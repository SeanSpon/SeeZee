/**
 * Cleanup script for duplicate test leads and orphaned data
 * 
 * This script:
 * 1. Removes duplicate leads (same email+serviceType), keeping the newest
 * 2. Removes orphaned projects that have no real work attached
 * 3. Resets ProjectRequest statuses that were incorrectly set to APPROVED
 * 
 * Run with: npm run cleanup-duplicates
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupDuplicateLeads() {
  console.log('🔍 Starting comprehensive cleanup...\n');

  try {
    // ========== STEP 1: Find duplicate leads ==========
    console.log('📋 STEP 1: Scanning for duplicate leads...\n');
    
    const allLeads = await prisma.lead.findMany({
      orderBy: [
        { email: 'asc' },
        { serviceType: 'asc' },
        { createdAt: 'desc' }, // Most recent first
      ],
    });

    // Group leads by email + serviceType
    const leadGroups = new Map<string, typeof allLeads>();
    for (const lead of allLeads) {
      const key = `${lead.email}:${lead.serviceType || 'null'}`;
      const group = leadGroups.get(key) || [];
      group.push(lead);
      leadGroups.set(key, group);
    }

    // Find duplicates (groups with more than 1 lead)
    const duplicateGroups = Array.from(leadGroups.entries()).filter(
      ([_, leads]) => leads.length > 1
    );

    let duplicateLeadsToDelete = 0;
    if (duplicateGroups.length > 0) {
      console.log(`Found ${duplicateGroups.length} groups with duplicates:\n`);
      for (const [key, leads] of duplicateGroups) {
        console.log(`📧 ${key} - ${leads.length} leads`);
        duplicateLeadsToDelete += leads.length - 1;
      }
    } else {
      console.log('✅ No duplicate leads found.\n');
    }

    // ========== STEP 2: Find orphaned projects ==========
    console.log('\n📋 STEP 2: Scanning for orphaned projects (LEAD status with no work)...\n');
    
    const orphanedProjects = await prisma.project.findMany({
      where: {
        status: 'LEAD',
        milestones: { none: {} },
        invoices: { none: {} },
      },
    });

    if (orphanedProjects.length > 0) {
      console.log(`Found ${orphanedProjects.length} orphaned projects:\n`);
      for (const proj of orphanedProjects.slice(0, 10)) {
        console.log(`  - ${proj.name} (ID: ${proj.id})`);
      }
      if (orphanedProjects.length > 10) {
        console.log(`  ... and ${orphanedProjects.length - 10} more`);
      }
    } else {
      console.log('✅ No orphaned projects found.\n');
    }

    // ========== STEP 3: Find incorrectly APPROVED ProjectRequests ==========
    console.log('\n📋 STEP 3: Scanning for ProjectRequests incorrectly set to APPROVED...\n');
    
    const approvedRequests = await prisma.projectRequest.findMany({
      where: {
        status: 'APPROVED',
      },
    });

    if (approvedRequests.length > 0) {
      console.log(`Found ${approvedRequests.length} ProjectRequests with APPROVED status (should be SUBMITTED):\n`);
      for (const req of approvedRequests.slice(0, 5)) {
        console.log(`  - ${req.title} (ID: ${req.id})`);
      }
      if (approvedRequests.length > 5) {
        console.log(`  ... and ${approvedRequests.length - 5} more`);
      }
    } else {
      console.log('✅ No incorrectly approved ProjectRequests found.\n');
    }

    // ========== SUMMARY ==========
    console.log('\n' + '='.repeat(50));
    console.log('📊 CLEANUP SUMMARY');
    console.log('='.repeat(50));
    console.log(`Duplicate leads to delete: ${duplicateLeadsToDelete}`);
    console.log(`Orphaned projects to delete: ${orphanedProjects.length}`);
    console.log(`ProjectRequests to reset to SUBMITTED: ${approvedRequests.length}`);
    console.log('='.repeat(50) + '\n');

    if (duplicateLeadsToDelete === 0 && orphanedProjects.length === 0 && approvedRequests.length === 0) {
      console.log('✅ Nothing to clean up!');
      return;
    }

    // Ask for confirmation
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const confirmed = await new Promise<boolean>((resolve) => {
      rl.question('⚠️  Proceed with cleanup? (yes/no): ', (answer: string) => {
        rl.close();
        resolve(answer.toLowerCase() === 'yes');
      });
    });

    if (!confirmed) {
      console.log('❌ Cancelled - no changes made');
      return;
    }

    console.log('\n🗑️  Starting cleanup...\n');

    // Delete duplicate leads
    let deletedLeads = 0;
    for (const [_, leads] of duplicateGroups) {
      const toDelete = leads.slice(1);
      for (const lead of toDelete) {
        try {
          // Unlink from project if linked
          const linkedProject = await prisma.project.findFirst({
            where: { leadId: lead.id }
          });
          if (linkedProject) {
            await prisma.project.update({
              where: { id: linkedProject.id },
              data: { leadId: null }
            });
          }
          await prisma.lead.delete({ where: { id: lead.id } });
          deletedLeads++;
        } catch (error) {
          console.error(`   ✗ Failed to delete lead ${lead.id}:`, error);
        }
      }
    }

    // Delete orphaned projects
    let deletedProjects = 0;
    for (const project of orphanedProjects) {
      try {
        // Delete related maintenance plans first
        await prisma.maintenancePlan.deleteMany({ where: { projectId: project.id } });
        await prisma.project.delete({ where: { id: project.id } });
        deletedProjects++;
      } catch (error) {
        console.error(`   ✗ Failed to delete project ${project.id}:`, error);
      }
    }

    // Reset ProjectRequest statuses
    let resetRequests = 0;
    for (const request of approvedRequests) {
      try {
        await prisma.projectRequest.update({
          where: { id: request.id },
          data: { status: 'SUBMITTED' }
        });
        resetRequests++;
      } catch (error) {
        console.error(`   ✗ Failed to reset ProjectRequest ${request.id}:`, error);
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ CLEANUP COMPLETE');
    console.log('='.repeat(50));
    console.log(`Deleted ${deletedLeads} duplicate leads`);
    console.log(`Deleted ${deletedProjects} orphaned projects`);
    console.log(`Reset ${resetRequests} ProjectRequests to SUBMITTED`);
    console.log('='.repeat(50) + '\n');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
cleanupDuplicateLeads()
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
