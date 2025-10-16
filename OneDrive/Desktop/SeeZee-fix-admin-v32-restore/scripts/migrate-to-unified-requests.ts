/**
 * Migration script: Transform old ProjectRequest schema to unified schema
 * Run BEFORE applying the Prisma migration
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Starting migration of ProjectRequest records...\n");

  // Get all existing requests using raw SQL (before schema change)
  const oldRequests: any[] = await prisma.$queryRaw`
    SELECT * FROM project_requests
  `;

  console.log(`Found ${oldRequests.length} existing requests to migrate\n`);

  for (const old of oldRequests) {
    console.log(`Migrating request ${old.id} (${old.email})...`);
    
    // Transform old schema to new schema using raw SQL
    await prisma.$executeRaw`
      UPDATE project_requests
      SET
        "contactEmail" = ${old.email},
        "title" = ${old.projectType || "Project Inquiry"},
        "description" = COALESCE(${old.goal}, 'No description provided'),
        "updatedAt" = NOW()
      WHERE id = ${old.id}
    `;
  }

  console.log("\n✅ Migration complete!");
  console.log(`Transformed ${oldRequests.length} records`);
}

main()
  .catch((e) => {
    console.error("❌ Migration failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
