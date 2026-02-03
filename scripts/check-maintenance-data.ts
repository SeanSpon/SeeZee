/**
 * Script to check and identify old maintenance data
 * Run with: npx tsx scripts/check-maintenance-data.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking Maintenance Data...\n');

  // Check MaintenanceSchedule records
  const schedules = await prisma.maintenanceSchedule.findMany({
    include: {
      project: {
        select: {
          id: true,
          name: true,
          organization: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  console.log(`📋 MaintenanceSchedule Records: ${schedules.length}`);
  if (schedules.length > 0) {
    console.log('\nRecords:');
    schedules.forEach((schedule) => {
      console.log(`  - ${schedule.title}`);
      console.log(`    Project: ${schedule.project.name} (${schedule.project.organization.name})`);
      console.log(`    Status: ${schedule.status}`);
      console.log(`    Scheduled: ${schedule.scheduledFor.toLocaleDateString()}`);
      console.log(`    Created: ${schedule.createdAt.toLocaleDateString()}`);
      console.log(`    ID: ${schedule.id}\n`);
    });
  }

  // Check ChangeRequest records
  const changeRequests = await prisma.changeRequest.findMany({
    include: {
      project: {
        select: {
          id: true,
          name: true,
          organization: {
            select: {
              name: true,
            },
          },
        },
      },
      subscription: {
        select: {
          id: true,
          planName: true,
          status: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  console.log(`\n📝 ChangeRequest Records: ${changeRequests.length}`);
  if (changeRequests.length > 0) {
    console.log('\nRecords:');
    changeRequests.forEach((cr) => {
      console.log(`  - ${cr.description.substring(0, 50)}...`);
      console.log(`    Project: ${cr.project.name} (${cr.project.organization.name})`);
      console.log(`    Status: ${cr.status}`);
      console.log(`    Priority: ${cr.priority}`);
      console.log(`    Category: ${cr.category}`);
      console.log(`    Created: ${cr.createdAt.toLocaleDateString()}`);
      console.log(`    ID: ${cr.id}\n`);
    });
  }

  // Check MaintenancePlan records
  const plans = await prisma.maintenancePlan.findMany({
    include: {
      project: {
        select: {
          id: true,
          name: true,
          organization: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  console.log(`\n💼 MaintenancePlan Records: ${plans.length}`);
  if (plans.length > 0) {
    console.log('\nRecords:');
    plans.forEach((plan) => {
      console.log(`  - ${plan.project?.name || 'No project'}`);
      console.log(`    Organization: ${plan.project?.organization.name || 'N/A'}`);
      console.log(`    Tier: ${plan.tier}`);
      console.log(`    Status: ${plan.status}`);
      console.log(`    Monthly Price: $${(plan.monthlyPrice.toNumber() / 100).toFixed(0)}`);
      console.log(`    Hours: ${plan.supportHoursUsed}/${plan.supportHoursIncluded}`);
      console.log(`    Created: ${plan.createdAt.toLocaleDateString()}`);
      console.log(`    ID: ${plan.id}\n`);
    });
  }

  // Check Projects with active subscriptions
  const projectsWithSubs = await prisma.project.findMany({
    where: {
      subscriptions: {
        some: {
          status: 'active',
        },
      },
    },
    include: {
      organization: {
        select: {
          name: true,
        },
      },
      subscriptions: {
        where: {
          status: 'active',
        },
        select: {
          id: true,
          priceId: true,
          status: true,
          currentPeriodEnd: true,
        },
      },
    },
  });

  console.log(`\n💳 Projects with Active Subscriptions: ${projectsWithSubs.length}`);
  if (projectsWithSubs.length > 0) {
    console.log('\nProjects:');
    projectsWithSubs.forEach((project) => {
      console.log(`  - ${project.name}`);
      console.log(`    Organization: ${project.organization.name}`);
      console.log(`    Subscriptions: ${project.subscriptions.length}`);
      project.subscriptions.forEach((sub) => {
        console.log(`      - Price ID: ${sub.priceId}`);
        console.log(`        Status: ${sub.status}`);
        console.log(`        Period End: ${sub.currentPeriodEnd?.toLocaleDateString() || 'N/A'}`);
      });
      console.log('');
    });
  }

  console.log('\n✅ Data check complete!');
  console.log('\n💡 To clean up old data, run: npx tsx scripts/clean-maintenance-data.ts');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
