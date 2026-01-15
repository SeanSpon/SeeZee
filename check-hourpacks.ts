import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkHourPacks() {
  const hourPacks = await prisma.hourPack.findMany({
    include: {
      plan: {
        include: {
          project: {
            include: {
              organization: true
            }
          }
        }
      }
    },
    orderBy: { purchasedAt: 'desc' },
    take: 10
  });

  console.log('\n=== Recent Hour Pack Purchases ===');
  console.log(`Found ${hourPacks.length} hour packs\n`);
  
  hourPacks.forEach((pack, i) => {
    console.log(`${i + 1}. ${pack.packType} - ${pack.hours} hours ($${(Number(pack.cost) / 100).toFixed(2)})`);
    console.log(`   Remaining: ${pack.hoursRemaining} hours`);
    console.log(`   Purchased: ${pack.purchasedAt.toLocaleDateString()}`);
    console.log(`   Project: ${pack.plan.project.name}`);
    console.log(`   Payment ID: ${pack.stripePaymentId}`);
    console.log('');
  });

  await prisma.$disconnect();
}

checkHourPacks().catch(console.error);
