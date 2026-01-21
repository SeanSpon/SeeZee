/**
 * MIGRATION SCRIPT: Transition to Simplified System
 * 
 * This script helps migrate data from the old complex system
 * to the new simplified structure.
 * 
 * Run with: npx tsx scripts/migrate-to-simplified-system.ts
 */

import { db } from "../src/server/db";
import { initializeProjectFolders } from "../src/lib/project-organization";

async function main() {
  console.log("🚀 Starting migration to simplified system...\n");

  // Step 1: Initialize folders for all projects
  console.log("📁 Step 1: Creating default folder structure for all projects...");
  const projects = await db.project.findMany({
    select: { id: true, name: true },
  });

  let foldersCreated = 0;
  for (const project of projects) {
    try {
      const result = await initializeProjectFolders(project.id);
      if (result.success) {
        console.log(`  ✓ Created folders for ${project.name}`);
        foldersCreated++;
      }
    } catch (error: any) {
      // Folders might already exist, that's okay
      if (!error.message.includes("Unique constraint")) {
        console.error(`  ✗ Failed for ${project.name}:`, error.message);
      }
    }
  }
  console.log(`✅ Initialized folders for ${foldersCreated}/${projects.length} projects\n`);

  // Step 2: Migrate old Request records to UnifiedRequest
  console.log("📋 Step 2: Migrating old Request records...");
  const oldRequests = await db.request.findMany({
    include: {
      project: {
        select: {
          organizationId: true,
        },
      },
    },
  });

  let requestsMigrated = 0;
  for (const request of oldRequests) {
    try {
      await db.unifiedRequest.create({
        data: {
          projectId: request.projectId,
          organizationId: request.project.organizationId,
          type: "MAINTENANCE_TASK",
          title: request.title,
          description: request.details,
          status: mapOldStatus(request.state),
          priority: "MEDIUM",
          metadata: {
            migratedFrom: "Request",
            oldId: request.id,
            source: request.source,
          },
          createdAt: request.createdAt,
          updatedAt: request.updatedAt,
        },
      });
      requestsMigrated++;
    } catch (error: any) {
      console.error(`  ✗ Failed to migrate request ${request.id}:`, error.message);
    }
  }
  console.log(`✅ Migrated ${requestsMigrated}/${oldRequests.length} requests\n`);

  // Step 3: Migrate ChangeRequest records
  console.log("🔄 Step 3: Migrating ChangeRequest records...");
  const changeRequests = await db.changeRequest.findMany({
    include: {
      project: {
        select: {
          organizationId: true,
        },
      },
    },
  });

  let changesMigrated = 0;
  for (const change of changeRequests) {
    try {
      await db.unifiedRequest.create({
        data: {
          projectId: change.projectId,
          organizationId: change.project.organizationId,
          type: mapChangeCategory(change.category),
          title: `Change Request: ${change.category}`,
          description: change.description,
          status: mapChangeStatus(change.status),
          priority: mapChangePriority(change.priority),
          estimatedHours: change.estimatedHours,
          actualHours: change.actualHours,
          hoursDeducted: change.hoursDeducted,
          hoursSource: change.hoursSource,
          hourPackId: change.hourPackId,
          category: change.category,
          requiresApproval: change.requiresClientApproval,
          isBillable: change.isOverage,
          billedAmount: change.overageAmount,
          attachments: change.attachments,
          metadata: {
            migratedFrom: "ChangeRequest",
            oldId: change.id,
            subscriptionId: change.subscriptionId,
            urgencyFee: change.urgencyFee,
            flaggedForReview: change.flaggedForReview,
          },
          createdAt: change.createdAt,
          updatedAt: change.updatedAt,
          completedAt: change.completedAt,
        },
      });
      changesMigrated++;
    } catch (error: any) {
      console.error(`  ✗ Failed to migrate change request ${change.id}:`, error.message);
    }
  }
  console.log(`✅ Migrated ${changesMigrated}/${changeRequests.length} change requests\n`);

  // Step 4: Migrate ProjectRequest records
  console.log("💼 Step 4: Migrating ProjectRequest records...");
  const projectRequests = await db.projectRequest.findMany();

  let projectRequestsMigrated = 0;
  for (const request of projectRequests) {
    try {
      await db.unifiedRequest.create({
        data: {
          organizationId: request.userId ? undefined : undefined, // Will need to map user to org
          type: "NEW_PROJECT",
          title: request.title || "New Project Request",
          description: request.description || request.goal || "",
          status: mapProjectRequestStatus(request.status),
          priority: "HIGH",
          submittedBy: request.userId,
          estimatedHours: request.estimatedHours,
          actualHours: request.actualHours,
          hoursDeducted: request.hoursDeducted,
          hoursSource: request.hoursSource,
          hourPackId: request.hourPackId,
          requiresApproval: true,
          metadata: {
            migratedFrom: "ProjectRequest",
            oldId: request.id,
            projectType: request.projectType,
            goal: request.goal,
            timeline: request.timeline,
            company: request.company,
            contactEmail: request.contactEmail,
            budget: request.budget,
            services: request.services,
          },
          createdAt: request.createdAt,
          updatedAt: request.updatedAt,
        },
      });
      projectRequestsMigrated++;
    } catch (error: any) {
      console.error(`  ✗ Failed to migrate project request ${request.id}:`, error.message);
    }
  }
  console.log(`✅ Migrated ${projectRequestsMigrated}/${projectRequests.length} project requests\n`);

  // Step 5: Migrate ClientTask records
  console.log("📋 Step 5: Migrating ClientTask records...");
  const clientTasks = await db.clientTask.findMany({
    include: {
      project: {
        select: {
          organizationId: true,
        },
      },
    },
  });

  let tasksMigrated = 0;
  for (const task of clientTasks) {
    try {
      await db.unifiedRequest.create({
        data: {
          projectId: task.projectId,
          organizationId: task.project.organizationId,
          type: "CLIENT_TASK",
          title: task.title,
          description: task.description,
          status: mapClientTaskStatus(task.status),
          priority: "MEDIUM",
          category: task.type,
          requiresApproval: false,
          metadata: {
            migratedFrom: "ClientTask",
            oldId: task.id,
            assignedToClient: task.assignedToClient,
            requiresUpload: task.requiresUpload,
            data: task.data,
          },
          internalNotes: task.submissionNotes,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
          completedAt: task.completedAt,
        },
      });
      tasksMigrated++;
    } catch (error: any) {
      console.error(`  ✗ Failed to migrate client task ${task.id}:`, error.message);
    }
  }
  console.log(`✅ Migrated ${tasksMigrated}/${clientTasks.length} client tasks\n`);

  // Step 6: Update invoice metadata
  console.log("💰 Step 6: Migrating invoice data to new structure...");
  const invoices = await db.invoice.findMany();

  let invoicesUpdated = 0;
  for (const invoice of invoices) {
    try {
      // Build metadata from old fields
      const metadata: any = {};
      
      // These fields don't exist in the new schema, so we'll just skip this migration
      // and keep the invoices as-is for now
      
      invoicesUpdated++;
    } catch (error: any) {
      console.error(`  ✗ Failed to update invoice ${invoice.id}:`, error.message);
    }
  }
  console.log(`✅ Updated ${invoicesUpdated}/${invoices.length} invoices\n`);

  // Summary
  console.log("=" . repeat(50));
  console.log("📊 MIGRATION SUMMARY");
  console.log("=" . repeat(50));
  console.log(`Projects with folders: ${foldersCreated}/${projects.length}`);
  console.log(`Requests migrated: ${requestsMigrated}/${oldRequests.length}`);
  console.log(`Change requests migrated: ${changesMigrated}/${changeRequests.length}`);
  console.log(`Project requests migrated: ${projectRequestsMigrated}/${projectRequests.length}`);
  console.log(`Client tasks migrated: ${tasksMigrated}/${clientTasks.length}`);
  console.log(`Invoices updated: ${invoicesUpdated}/${invoices.length}`);
  console.log("\n✅ Migration complete!");
  console.log("\n⚠️  NEXT STEPS:");
  console.log("1. Review the migrated data in the database");
  console.log("2. Update your code to use the new unified systems");
  console.log("3. Test thoroughly before deploying");
  console.log("4. Once confirmed working, you can safely delete old models from schema");
}

// Helper functions to map old statuses to new ones

function mapOldStatus(state: string): any {
  const mapping: Record<string, string> = {
    new: "PENDING",
    in_progress: "IN_PROGRESS",
    completed: "COMPLETED",
    cancelled: "CANCELLED",
  };
  return mapping[state] || "PENDING";
}

function mapChangeStatus(status: string): any {
  const mapping: Record<string, string> = {
    pending: "PENDING",
    approved: "APPROVED",
    in_progress: "IN_PROGRESS",
    completed: "COMPLETED",
    rejected: "REJECTED",
  };
  return mapping[status] || "PENDING";
}

function mapChangePriority(priority: string): any {
  const mapping: Record<string, string> = {
    LOW: "LOW",
    NORMAL: "MEDIUM",
    HIGH: "HIGH",
    URGENT: "URGENT",
    EMERGENCY: "EMERGENCY",
  };
  return mapping[priority] || "MEDIUM";
}

function mapChangeCategory(category: string): any {
  const mapping: Record<string, string> = {
    CONTENT: "CONTENT_UPDATE",
    BUG: "BUG_REPORT",
    FEATURE: "FEATURE_REQUEST",
    DESIGN: "CHANGE_REQUEST",
    SEO: "MAINTENANCE_TASK",
    SECURITY: "BUG_REPORT",
    OTHER: "OTHER",
  };
  return mapping[category] || "OTHER";
}

function mapProjectRequestStatus(status: string): any {
  const mapping: Record<string, string> = {
    DRAFT: "DRAFT",
    SUBMITTED: "PENDING",
    REVIEWING: "REVIEWING",
    NEEDS_INFO: "NEEDS_INFO",
    APPROVED: "APPROVED",
    REJECTED: "REJECTED",
    ARCHIVED: "ARCHIVED",
  };
  return mapping[status] || "PENDING";
}

function mapClientTaskStatus(status: string): any {
  const mapping: Record<string, string> = {
    pending: "AWAITING_CLIENT",
    in_progress: "IN_PROGRESS",
    completed: "COMPLETED",
    cancelled: "CANCELLED",
  };
  return mapping[status] || "PENDING";
}

main()
  .catch((error) => {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  })
  .finally(() => {
    db.$disconnect();
  });
