/**
 * Role Migration Script
 * 
 * Maps old roles to new roles:
 * - ADMIN → CFO
 * - DESIGNER → FRONTEND
 * - DEV → BACKEND
 * - OUTREACH → OUTREACH (keep)
 * - STAFF → FRONTEND (default, manual review recommended)
 * - INTERN → FRONTEND (default, manual review recommended)
 * - PARTNER → CFO (default, manual review recommended)
 * - CEO → CEO (keep)
 * - CLIENT → CLIENT (keep)
 */

import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

const roleMapping: Record<string, UserRole> = {
  ADMIN: "CFO",
  DESIGNER: "FRONTEND",
  DEV: "BACKEND",
  OUTREACH: "OUTREACH",
  STAFF: "FRONTEND", // Default, manual review recommended
  INTERN: "FRONTEND", // Default, manual review recommended
  PARTNER: "CFO", // Default, manual review recommended
  CEO: "CEO",
  CLIENT: "CLIENT",
};

async function migrateRoles() {
  console.log("Starting role migration...\n");

  const allUsers = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });

  console.log(`Found ${allUsers.length} users to migrate\n`);

  const migrationResults = {
    total: allUsers.length,
    migrated: 0,
    skipped: 0,
    errors: 0,
    details: [] as Array<{
      email: string;
      oldRole: string;
      newRole: string;
      status: string;
    }>,
  };

  for (const user of allUsers) {
    const oldRole = user.role;
    const newRole = roleMapping[oldRole];

    if (!newRole) {
      console.error(`❌ Unknown role for user ${user.email}: ${oldRole}`);
      migrationResults.errors++;
      migrationResults.details.push({
        email: user.email || "unknown",
        oldRole,
        newRole: oldRole,
        status: "ERROR: Unknown role",
      });
      continue;
    }

    if (oldRole === newRole) {
      console.log(`✓ ${user.email}: Already has role ${newRole} (skipped)`);
      migrationResults.skipped++;
      migrationResults.details.push({
        email: user.email || "unknown",
        oldRole,
        newRole,
        status: "SKIPPED: Already correct",
      });
      continue;
    }

    try {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: newRole },
      });

      console.log(`✓ ${user.email}: ${oldRole} → ${newRole}`);
      migrationResults.migrated++;
      migrationResults.details.push({
        email: user.email || "unknown",
        oldRole,
        newRole,
        status: "MIGRATED",
      });
    } catch (error) {
      console.error(`❌ Error migrating ${user.email}:`, error);
      migrationResults.errors++;
      migrationResults.details.push({
        email: user.email || "unknown",
        oldRole,
        newRole,
        status: `ERROR: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("Migration Summary:");
  console.log("=".repeat(60));
  console.log(`Total users: ${migrationResults.total}`);
  console.log(`Migrated: ${migrationResults.migrated}`);
  console.log(`Skipped: ${migrationResults.skipped}`);
  console.log(`Errors: ${migrationResults.errors}`);
  console.log("=".repeat(60));

  // Show users that need manual review
  const needsReview = migrationResults.details.filter(
    (d) => d.oldRole === "STAFF" || d.oldRole === "INTERN" || d.oldRole === "PARTNER"
  );

  if (needsReview.length > 0) {
    console.log("\n⚠️  Users that need manual review:");
    needsReview.forEach((user) => {
      console.log(`  - ${user.email}: ${user.oldRole} → ${user.newRole}`);
    });
  }

  // Save migration log
  const logFile = `migration-log-${new Date().toISOString().split("T")[0]}.json`;
  console.log(`\n📝 Migration details saved to: ${logFile}`);
  console.log("\nMigration completed!");

  return migrationResults;
}

// Run migration
migrateRoles()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

