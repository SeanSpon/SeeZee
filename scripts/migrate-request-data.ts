/**
 * Data migration: Copy old ProjectRequest fields to new unified schema
 * Run AFTER the Prisma migration has been applied
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Migrating ProjectRequest data from old schema to new...\n");

  // Update all existing requests
  const result = await prisma.$executeRaw`
    UPDATE project_requests
    SET
      "contactEmail" = COALESCE("email", "contactEmail", ''),
      "title" = COALESCE("projectType", "name", "title", 'Project Inquiry'),
      "description" = COALESCE("goal", "description", 'No description provided'),
      "updatedAt" = NOW()
    WHERE "contactEmail" = '' OR "title" = '' OR "description" = ''
  `;

  console.log(`✅ Updated ${result} records`);
  
  // Verify the migration
  const requests = await prisma.projectRequest.findMany({
    select: {
      id: true,
      contactEmail: true,
      title: true,
      description: true,
      name: true,
      email: true,
      projectType: true,
      goal: true,
    },
  });

  console.log("\nVerification:");
  requests.forEach((r) => {
    console.log(`\n${r.id}:`);
    console.log(`  Email: ${r.email} → ${r.contactEmail}`);
    console.log(`  Name/Type: ${r.name || r.projectType} → ${r.title}`);
    console.log(`  Goal: ${r.goal?.substring(0, 50)}... → ${r.description.substring(0, 50)}...`);
  });

  console.log("\n✅ Data migration complete!");
}

main()
  .catch((e) => {
    console.error("❌ Migration failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
