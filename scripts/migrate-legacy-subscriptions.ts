/**
 * Migration Script: Legacy Subscription to MaintenancePlan
 * 
 * This script migrates active legacy Subscription records to the new MaintenancePlan model.
 * It should be run once to consolidate the subscription systems.
 * 
 * Usage: npx tsx scripts/migrate-legacy-subscriptions.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Tier mapping based on plan names
const PLAN_NAME_TO_TIER: Record<string, string> = {
  "Basic Monthly": "ESSENTIALS",
  "Standard Monthly": "ESSENTIALS",
  "Premium Monthly": "DIRECTOR",
  "Basic Annual": "ESSENTIALS",
  "Standard Annual": "ESSENTIALS",
  "Premium Annual": "DIRECTOR",
};

// Price mapping (in cents)
const TIER_PRICING = {
  ESSENTIALS: 50000, // $500/mo
  DIRECTOR: 75000,   // $750/mo
  COO: 200000,       // $2000/mo
};

const TIER_HOURS = {
  ESSENTIALS: 8,
  DIRECTOR: 16,
  COO: -1, // Unlimited
};

async function migrateSubscriptions() {
  console.log("🚀 Starting legacy subscription migration...\n");

  try {
    // Find all active legacy subscriptions that don't have a MaintenancePlan
    const legacySubscriptions = await prisma.subscription.findMany({
      where: {
        status: "active",
        project: {
          maintenancePlanRel: null, // Only subscriptions without an existing plan
        },
      },
      include: {
        project: {
          include: {
            organization: {
              select: { id: true, name: true },
            },
          },
        },
        changeRequests: true,
      },
    });

    console.log(`Found ${legacySubscriptions.length} active legacy subscriptions to migrate.\n`);

    if (legacySubscriptions.length === 0) {
      console.log("✅ No subscriptions to migrate. All done!");
      return;
    }

    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const sub of legacySubscriptions) {
      try {
        // Determine tier from plan name
        const tier = PLAN_NAME_TO_TIER[sub.planName || ""] || "ESSENTIALS";
        const monthlyPrice = TIER_PRICING[tier as keyof typeof TIER_PRICING];
        const supportHours = TIER_HOURS[tier as keyof typeof TIER_HOURS];

        console.log(`\nMigrating subscription ${sub.id}:`);
        console.log(`  Project: ${sub.project.name}`);
        console.log(`  Organization: ${sub.project.organization?.name}`);
        console.log(`  Plan: ${sub.planName} → ${tier}`);

        // Create MaintenancePlan
        const maintenancePlan = await prisma.maintenancePlan.create({
          data: {
            projectId: sub.projectId,
            tier,
            monthlyPrice,
            supportHoursIncluded: supportHours,
            supportHoursUsed: 0,
            changeRequestsIncluded: sub.changeRequestsAllowed || 3,
            changeRequestsUsed: sub.changeRequestsUsed || 0,
            status: "ACTIVE",
            stripeSubscriptionId: sub.stripeId,
            currentPeriodStart: new Date(),
            currentPeriodEnd: sub.currentPeriodEnd || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            rolloverEnabled: true,
            rolloverCap: supportHours === -1 ? 0 : supportHours * 2,
            rolloverHours: 0,
            onDemandEnabled: false,
          },
        });

        console.log(`  ✅ Created MaintenancePlan ${maintenancePlan.id}`);

        // Update change requests to link to new MaintenancePlan
        if (sub.changeRequests.length > 0) {
          await prisma.changeRequest.updateMany({
            where: { subscriptionId: sub.id },
            data: { maintenancePlanId: maintenancePlan.id },
          });
          console.log(`  ✅ Migrated ${sub.changeRequests.length} change requests`);
        }

        // Mark legacy subscription as migrated (we'll keep it for historical data)
        await prisma.subscription.update({
          where: { id: sub.id },
          data: {
            status: "canceled",
            // We could add a custom field like 'migratedAt' if needed
          },
        });

        migratedCount++;
        console.log(`  ✅ Marked legacy subscription as canceled`);
      } catch (error) {
        errorCount++;
        console.error(`  ❌ Error migrating subscription ${sub.id}:`, error);
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log("📊 Migration Summary:");
    console.log(`  ✅ Successfully migrated: ${migratedCount}`);
    console.log(`  ⏭️  Skipped: ${skippedCount}`);
    console.log(`  ❌ Errors: ${errorCount}`);
    console.log("=".repeat(50));

    if (migratedCount > 0) {
      console.log("\n🎉 Migration completed successfully!");
      console.log("\n📝 Next steps:");
      console.log("  1. Verify the migrated data in the database");
      console.log("  2. Test the maintenance page and change request flows");
      console.log("  3. Legacy subscription records have been kept for historical reference");
    }
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateSubscriptions()
  .then(() => {
    console.log("\n✅ Migration script completed.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Migration script failed:", error);
    process.exit(1);
  });
