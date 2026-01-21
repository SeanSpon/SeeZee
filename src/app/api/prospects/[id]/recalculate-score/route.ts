import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateLeadScoreDetailed } from "@/lib/leads/scoring";

/**
 * POST /api/prospects/[id]/recalculate-score
 * Recalculate lead score for a single prospect
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch prospect
    const prospect = await prisma.prospect.findUnique({
      where: { id },
    });

    if (!prospect) {
      return NextResponse.json(
        { success: false, error: "Prospect not found" },
        { status: 404 }
      );
    }

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
      emailsSent: 0, // Not tracking on prospects
      convertedAt: prospect.convertedAt,
      googleRating: prospect.googleRating,
      googleReviews: prospect.googleReviews,
    });

    // Update prospect with new score and breakdown
    const updated = await prisma.prospect.update({
      where: { id },
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

    return NextResponse.json({
      success: true,
      prospect: updated,
      breakdown: scoreData.breakdown,
      recommendation: scoreData.recommendation,
    });
  } catch (error: any) {
    console.error("Error recalculating prospect score:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to recalculate score" },
      { status: 500 }
    );
  }
}
