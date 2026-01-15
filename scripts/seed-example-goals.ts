/**
 * Seed Example Goals
 * 
 * Creates sample goals for different categories:
 * - Revenue goals
 * - Client acquisition
 * - Project delivery
 * - Team growth
 * - Marketing metrics
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🎯 Seeding example goals...");

  // Find a user to be the goal owner (CEO or first admin)
  const owner = await prisma.user.findFirst({
    where: {
      OR: [
        { role: "CEO" },
        { role: "ADMIN" },
      ],
    },
  });

  if (!owner) {
    console.error("❌ No CEO or ADMIN user found. Please create an admin user first.");
    return;
  }

  console.log(`✓ Using ${owner.name || owner.email} as goal owner`);

  const startDate = new Date();
  const targetDate = new Date();
  targetDate.setMonth(targetDate.getMonth() + 3); // 3 months from now

  const goals = [
    {
      title: "Achieve $50,000 Monthly Recurring Revenue",
      description: "Reach $50k MRR through new client acquisitions and upsells to existing clients",
      category: "Revenue",
      targetValue: 50000,
      currentValue: 32000,
      unit: "$",
      priority: "HIGH",
      status: "IN_PROGRESS",
    },
    {
      title: "Acquire 10 New Clients",
      description: "Onboard 10 new agency clients across all service tiers",
      category: "Clients",
      targetValue: 10,
      currentValue: 6,
      unit: "clients",
      priority: "HIGH",
      status: "ON_TRACK",
    },
    {
      title: "Complete 15 Active Projects",
      description: "Deliver and launch 15 client projects by end of quarter",
      category: "Projects",
      targetValue: 15,
      currentValue: 8,
      unit: "projects",
      priority: "MEDIUM",
      status: "IN_PROGRESS",
    },
    {
      title: "Increase Revenue by 40%",
      description: "Grow quarterly revenue by 40% compared to previous quarter",
      category: "Growth",
      targetValue: 40,
      currentValue: 18,
      unit: "%",
      priority: "HIGH",
      status: "AT_RISK",
    },
    {
      title: "Generate 100 Qualified Leads",
      description: "Generate 100 high-quality leads through marketing campaigns and outreach",
      category: "Marketing",
      targetValue: 100,
      currentValue: 45,
      unit: "leads",
      priority: "MEDIUM",
      status: "ON_TRACK",
    },
    {
      title: "Close $200,000 in Sales",
      description: "Close $200k worth of new contracts and project agreements",
      category: "Sales",
      targetValue: 200000,
      currentValue: 120000,
      unit: "$",
      priority: "CRITICAL",
      status: "IN_PROGRESS",
    },
    {
      title: "Expand Team to 8 Members",
      description: "Hire 3 new team members (1 designer, 1 developer, 1 marketer)",
      category: "Team",
      targetValue: 8,
      currentValue: 5,
      unit: "members",
      priority: "MEDIUM",
      status: "NOT_STARTED",
    },
    {
      title: "Launch 5 New Product Features",
      description: "Ship 5 major platform features to improve client experience",
      category: "Product",
      targetValue: 5,
      currentValue: 2,
      unit: "features",
      priority: "MEDIUM",
      status: "IN_PROGRESS",
    },
    {
      title: "Achieve 95% Client Satisfaction",
      description: "Maintain at least 95% satisfaction score across all clients",
      category: "Customer Success",
      targetValue: 95,
      currentValue: 88,
      unit: "%",
      priority: "HIGH",
      status: "AT_RISK",
    },
    {
      title: "Reduce Project Delivery Time by 25%",
      description: "Streamline operations to deliver projects 25% faster",
      category: "Operations",
      targetValue: 25,
      currentValue: 12,
      unit: "%",
      priority: "MEDIUM",
      status: "IN_PROGRESS",
    },
  ];

  let created = 0;

  for (const goalData of goals) {
    try {
      await prisma.goal.create({
        data: {
          ...goalData,
          startDate,
          targetDate,
          ownerId: owner.id,
          createdById: owner.id,
        },
      });
      created++;
      console.log(`✓ Created goal: ${goalData.title}`);
    } catch (error: any) {
      console.error(`✗ Failed to create goal: ${goalData.title}`, error.message);
    }
  }

  console.log(`\n🎉 Successfully created ${created} example goals!`);
  console.log(`\nYou can view them at: /admin/goals`);
}

main()
  .catch((e) => {
    console.error("Error seeding goals:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
