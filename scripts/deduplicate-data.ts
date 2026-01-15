/**
 * CRITICAL: Data Deduplication Script
 * 
 * This script cleans up duplicate Leads, Projects, and Organizations
 * created by the registration/onboarding flow bugs.
 * 
 * Run with: npx tsx scripts/deduplicate-data.ts
 * 
 * WARNING: This modifies production data. Back up database first.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface DuplicateGroup {
  email: string;
  ids: string[];
  count: number;
}

async function deduplicateLeads() {
  console.log('\n🔍 Finding duplicate Leads...');
  
  // Find leads with same email created within 1 hour of each other
  const allLeads = await prisma.lead.findMany({
    where: {
      createdAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
    include: {
      project: true,
    },
  });
  
  // Group by email + serviceType
  const groups = new Map<string, typeof allLeads>();
  
  for (const lead of allLeads) {
    const key = `${lead.email}:${lead.serviceType}`;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(lead);
  }
  
  let deletedCount = 0;
  let mergedProjects = 0;
  
  for (const [key, leads] of groups.entries()) {
    if (leads.length <= 1) continue;
    
    console.log(`\n📧 Found ${leads.length} duplicate leads for ${key}`);
    
    // Keep the oldest lead (first created)
    const keepLead = leads[0];
    const duplicates = leads.slice(1);
    
    console.log(`  ✓ Keeping Lead ${keepLead.id} (created ${keepLead.createdAt.toISOString()})`);
    
    for (const duplicate of duplicates) {
      console.log(`  🗑️  Deleting Lead ${duplicate.id} (created ${duplicate.createdAt.toISOString()})`);
      
      // If duplicate has a project, link it to the kept lead
      if (duplicate.project && !keepLead.project) {
        console.log(`    → Moving Project ${duplicate.project.id} to kept lead`);
        await prisma.project.update({
          where: { id: duplicate.project.id },
          data: { leadId: keepLead.id },
        });
        mergedProjects++;
      } else if (duplicate.project && keepLead.project) {
        // Both have projects - keep the one with more data
        console.log(`    ⚠️  Both leads have projects, keeping both projects but deleting duplicate lead`);
        // Unlink project from duplicate lead before deleting
        await prisma.project.update({
          where: { id: duplicate.project.id },
          data: { leadId: null },
        });
      }
      
      // Delete the duplicate lead
      await prisma.lead.delete({
        where: { id: duplicate.id },
      });
      deletedCount++;
    }
  }
  
  console.log(`\n✅ Deleted ${deletedCount} duplicate leads`);
  console.log(`✅ Merged ${mergedProjects} projects to kept leads`);
}

async function deduplicateProjects() {
  console.log('\n🔍 Finding duplicate Projects...');
  
  // Find projects with same name + organizationId
  const recentProjects = await prisma.project.findMany({
    where: {
      createdAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
    include: {
      lead: true,
      maintenancePlanRel: true,
    },
  });
  
  // Group by organizationId + name
  const groups = new Map<string, typeof recentProjects>();
  
  for (const project of recentProjects) {
    const key = `${project.organizationId}:${project.name}`;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(project);
  }
  
  let deletedCount = 0;
  
  for (const [key, projects] of groups.entries()) {
    if (projects.length <= 1) continue;
    
    console.log(`\n📁 Found ${projects.length} duplicate projects for ${key}`);
    
    // Keep the project with most data (has lead, has maintenance plan, etc.)
    const sortedProjects = projects.sort((a, b) => {
      const scoreA = (a.lead ? 10 : 0) + (a.maintenancePlanRel ? 10 : 0) + (a.description ? 5 : 0);
      const scoreB = (b.lead ? 10 : 0) + (b.maintenancePlanRel ? 10 : 0) + (b.description ? 5 : 0);
      return scoreB - scoreA;
    });
    
    const keepProject = sortedProjects[0];
    const duplicates = sortedProjects.slice(1);
    
    console.log(`  ✓ Keeping Project ${keepProject.id} "${keepProject.name}"`);
    
    for (const duplicate of duplicates) {
      console.log(`  🗑️  Deleting Project ${duplicate.id}`);
      
      // Delete maintenance plan if exists
      if (duplicate.maintenancePlanRel) {
        await prisma.maintenancePlan.delete({
          where: { id: duplicate.maintenancePlanRel.id },
        });
      }
      
      // Delete the project
      await prisma.project.delete({
        where: { id: duplicate.id },
      });
      deletedCount++;
    }
  }
  
  console.log(`\n✅ Deleted ${deletedCount} duplicate projects`);
}

async function deduplicateProjectRequests() {
  console.log('\n🔍 Finding duplicate ProjectRequests...');
  
  const recentRequests = await prisma.projectRequest.findMany({
    where: {
      createdAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  });
  
  // Group by userId + contactEmail
  const groups = new Map<string, typeof recentRequests>();
  
  for (const request of recentRequests) {
    const key = `${request.userId}:${request.contactEmail}`;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(request);
  }
  
  let deletedCount = 0;
  
  for (const [key, requests] of groups.entries()) {
    if (requests.length <= 1) continue;
    
    // Check if created within 5 minutes of each other
    const timeDiff = requests[requests.length - 1].createdAt.getTime() - requests[0].createdAt.getTime();
    if (timeDiff > 5 * 60 * 1000) continue; // Not duplicates, more than 5 min apart
    
    console.log(`\n📋 Found ${requests.length} duplicate project requests for ${key}`);
    
    const keepRequest = requests[0];
    const duplicates = requests.slice(1);
    
    console.log(`  ✓ Keeping ProjectRequest ${keepRequest.id}`);
    
    for (const duplicate of duplicates) {
      console.log(`  🗑️  Deleting ProjectRequest ${duplicate.id}`);
      await prisma.projectRequest.delete({
        where: { id: duplicate.id },
      });
      deletedCount++;
    }
  }
  
  console.log(`\n✅ Deleted ${deletedCount} duplicate project requests`);
}

async function reportDuplicateStats() {
  console.log('\n📊 Current Duplication Statistics:\n');
  
  // Check for duplicate leads
  const leadDuplicates = await prisma.$queryRaw<Array<{ email: string; count: bigint }>>`
    SELECT email, COUNT(*) as count
    FROM leads
    WHERE "createdAt" > NOW() - INTERVAL '7 days'
    GROUP BY email
    HAVING COUNT(*) > 1
    ORDER BY count DESC
    LIMIT 10
  `;
  
  console.log(`Duplicate Leads (by email, last 7 days): ${leadDuplicates.length} email addresses with duplicates`);
  for (const dup of leadDuplicates) {
    console.log(`  - ${dup.email}: ${dup.count} leads`);
  }
  
  // Check for duplicate projects
  const projectDuplicates = await prisma.$queryRaw<Array<{ name: string; count: bigint }>>`
    SELECT name, COUNT(*) as count
    FROM projects
    WHERE "createdAt" > NOW() - INTERVAL '7 days'
    GROUP BY name, "organizationId"
    HAVING COUNT(*) > 1
    ORDER BY count DESC
    LIMIT 10
  `;
  
  console.log(`\nDuplicate Projects (by name+org, last 7 days): ${projectDuplicates.length} combinations with duplicates`);
  for (const dup of projectDuplicates) {
    console.log(`  - "${dup.name}": ${dup.count} projects`);
  }
}

async function main() {
  console.log('🚀 Starting Data Deduplication...\n');
  console.log('⚠️  WARNING: This will modify your database!');
  console.log('⚠️  Make sure you have a backup before proceeding.\n');
  
  try {
    // Report current state
    await reportDuplicateStats();
    
    console.log('\n' + '='.repeat(60));
    console.log('Starting cleanup in 3 seconds... (Ctrl+C to cancel)');
    console.log('='.repeat(60));
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Run deduplication
    await deduplicateLeads();
    await deduplicateProjects();
    await deduplicateProjectRequests();
    
    // Report final state
    console.log('\n' + '='.repeat(60));
    console.log('After Cleanup:');
    await reportDuplicateStats();
    
    console.log('\n✅ Deduplication complete!');
  } catch (error) {
    console.error('\n❌ Error during deduplication:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
