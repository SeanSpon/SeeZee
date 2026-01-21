import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateLeadScoreDetailed } from "@/lib/leads/scoring";
import { getCurrentUser } from "@/lib/auth/requireRole";
import { ROLE } from "@/lib/role";

/**
 * POST /api/prospects/recalculate-all
 * Recalculate lead scores for all prospects in the database
 * Requires CEO, CFO, or OUTREACH role
 */
export async function POST(req: NextRequest) {
  try {
    // Check authentication and authorization
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const allowedRoles = [ROLE.CEO, ROLE.CFO, ROLE.OUTREACH];
    if (!allowedRoles.includes(user.role as any)) {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Fetch all non-converted prospects
    const prospects = await prisma.prospect.findMany({
      where: {
        convertedAt: null,
        archived: false,
      },
    });

    let updated = 0;
    let errors = 0;
    const results: Array<{ id: string; oldScore: number; newScore: number }> = [];

    // Process each prospect
    for (const prospect of prospects) {
      try {
        const oldScore = prospect.leadScore;

        // Calculate new score
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

        // Update prospect
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

        results.push({
          id: prospect.id,
          oldScore,
          newScore: scoreData.total,
        });

        updated++;
      } catch (error: any) {
        console.error(`Error updating prospect ${prospect.id}:`, error);
        errors++;
      }
    }

    // Calculate statistics
    const totalProcessed = updated + errors;
    const scoreIncreases = results.filter(r => r.newScore > r.oldScore).length;
    const scoreDecreases = results.filter(r => r.newScore < r.oldScore).length;
    const noChange = results.filter(r => r.newScore === r.oldScore).length;

    return NextResponse.json({
      success: true,
      message: `Recalculated ${updated} prospect scores`,
      stats: {
        totalProspects: prospects.length,
        updated,
        errors,
        scoreIncreases,
        scoreDecreases,
        noChange,
      },
      sampleResults: results.slice(0, 10), // Return first 10 for preview
    });
  } catch (error: any) {
    console.error("Error recalculating all prospect scores:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to recalculate scores" },
      { status: 500 }
    );
  }
}
