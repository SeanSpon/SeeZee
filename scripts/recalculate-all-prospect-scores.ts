/**
 * Utility Script: Recalculate All Prospect Scores
 * 
 * This script recalculates lead scores for all prospects in the database,
 * including the newly added googleScore field.
 * 
 * Usage:
 *   npx ts-node scripts/recalculate-all-prospect-scores.ts
 * 
 * Or via API:
 *   POST /api/prospects/recalculate-all
 */

import { PrismaClient } from '@prisma/client';
import { calculateLeadScoreDetailed } from '../src/lib/leads/scoring';

const prisma = new PrismaClient();

async function recalculateAllScores() {
  console.log('🔄 Starting score recalculation for all prospects...\n');

  try {
    // Fetch all non-converted, non-archived prospects
    const prospects = await prisma.prospect.findMany({
      where: {
        convertedAt: null,
        archived: false,
      },
    });

    console.log(`📊 Found ${prospects.length} prospects to recalculate\n`);

    let updated = 0;
    let failed = 0;
    const results: Array<{
      name: string;
      oldScore: number;
      newScore: number;
      change: number;
    }> = [];

    // Process each prospect
    for (const prospect of prospects) {
      try {
        const oldScore = prospect.leadScore;

        // Calculate new score with detailed breakdown
        const scoreData = calculateLeadScoreDetailed({
          hasWebsite: prospect.hasWebsite,
          websiteQuality: prospect.websiteQuality,
          annualRevenue: prospect.annualRevenue,
          category: prospect.category,
          city: prospect.city,
          state: prospect.state,
          employeeCount: prospect.employeeCount,
          email: prospect.email,
          phone: prospect.phone,
          emailsSent: 0,
          convertedAt: prospect.convertedAt,
          googleRating: prospect.googleRating,
          googleReviews: prospect.googleReviews,
        });

        // Update prospect with new score and all breakdown components
        await prisma.prospect.update({
          where: { id: prospect.id },
          data: {
            leadScore: scoreData.total,
            websiteQualityScore: scoreData.breakdown.websiteScore,
            revenuePotential: scoreData.breakdown.revenueScore,
            categoryFit: scoreData.breakdown.categoryScore,
            locationScore: scoreData.breakdown.locationScore,
            organizationSize: scoreData.breakdown.sizeScore,
            googleScore: scoreData.breakdown.googleScore,
          },
        });

        const change = scoreData.total - oldScore;
        results.push({
          name: prospect.name,
          oldScore,
          newScore: scoreData.total,
          change,
        });

        updated++;

        // Progress indicator
        if (updated % 10 === 0) {
          console.log(`✅ Updated ${updated}/${prospects.length} prospects...`);
        }
      } catch (error) {
        console.error(`❌ Error updating prospect ${prospect.name}:`, error);
        failed++;
      }
    }

    console.log('\n📈 Recalculation Complete!\n');
    console.log(`✅ Successfully updated: ${updated}`);
    console.log(`❌ Failed: ${failed}`);

    // Show statistics
    const scoreIncreases = results.filter((r) => r.change > 0).length;
    const scoreDecreases = results.filter((r) => r.change < 0).length;
    const noChange = results.filter((r) => r.change === 0).length;

    console.log('\n📊 Score Changes:');
    console.log(`   ⬆️  Increased: ${scoreIncreases}`);
    console.log(`   ⬇️  Decreased: ${scoreDecreases}`);
    console.log(`   ➡️  No change: ${noChange}`);

    // Show top 10 biggest increases
    const topIncreases = results
      .filter((r) => r.change > 0)
      .sort((a, b) => b.change - a.change)
      .slice(0, 10);

    if (topIncreases.length > 0) {
      console.log('\n🔥 Top 10 Score Increases:');
      topIncreases.forEach((r, i) => {
        console.log(
          `   ${i + 1}. ${r.name}: ${r.oldScore} → ${r.newScore} (+${r.change})`
        );
      });
    }

    // Show top 10 biggest decreases
    const topDecreases = results
      .filter((r) => r.change < 0)
      .sort((a, b) => a.change - b.change)
      .slice(0, 10);

    if (topDecreases.length > 0) {
      console.log('\n❄️ Top 10 Score Decreases:');
      topDecreases.forEach((r, i) => {
        console.log(
          `   ${i + 1}. ${r.name}: ${r.oldScore} → ${r.newScore} (${r.change})`
        );
      });
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Fatal error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Run the script
recalculateAllScores()
  .then(() => {
    console.log('\n✅ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
