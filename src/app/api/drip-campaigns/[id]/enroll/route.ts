import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/requireRole";
import { ROLE } from "@/lib/role";

/**
 * POST /api/drip-campaigns/[id]/enroll
 * Enroll prospect(s) in a drip campaign
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    const { id: campaignId } = await params;
    const body = await req.json();
    const { prospectIds, autoEnroll } = body;

    // Validate campaign exists and is active
    const campaign = await prisma.dripCampaign.findUnique({
      where: { id: campaignId },
      include: {
        steps: {
          orderBy: { stepNumber: "asc" },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: "Campaign not found" },
        { status: 404 }
      );
    }

    if (!campaign.active) {
      return NextResponse.json(
        { success: false, error: "Campaign is not active" },
        { status: 400 }
      );
    }

    if (campaign.steps.length === 0) {
      return NextResponse.json(
        { success: false, error: "Campaign has no steps configured" },
        { status: 400 }
      );
    }

    let enrolledCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    if (autoEnroll) {
      // Auto-enroll based on campaign targeting criteria
      const whereClause: any = {
        archived: false,
        convertedAt: null,
      };

      if (campaign.targetStatus && campaign.targetStatus.length > 0) {
        whereClause.status = { in: campaign.targetStatus };
      }

      if (campaign.minLeadScore !== null || campaign.maxLeadScore !== null) {
        whereClause.leadScore = {};
        if (campaign.minLeadScore !== null) {
          whereClause.leadScore.gte = campaign.minLeadScore;
        }
        if (campaign.maxLeadScore !== null) {
          whereClause.leadScore.lte = campaign.maxLeadScore;
        }
      }

      if (campaign.targetStates && campaign.targetStates.length > 0) {
        whereClause.state = { in: campaign.targetStates };
      }

      // Get matching prospects
      const prospects = await prisma.prospect.findMany({
        where: whereClause,
      });

      // Enroll each prospect
      for (const prospect of prospects) {
        try {
          // Check if already enrolled
          const existing = await prisma.dripEnrollment.findUnique({
            where: {
              campaignId_prospectId: {
                campaignId,
                prospectId: prospect.id,
              },
            },
          });

          if (existing) {
            skippedCount++;
            continue;
          }

          // Calculate next email time (first step delay)
          const firstStep = campaign.steps[0];
          const nextEmailAt = new Date();
          nextEmailAt.setDate(nextEmailAt.getDate() + firstStep.delayDays);
          nextEmailAt.setHours(nextEmailAt.getHours() + firstStep.delayHours);

          await prisma.dripEnrollment.create({
            data: {
              campaignId,
              prospectId: prospect.id,
              nextEmailAt,
            },
          });

          enrolledCount++;
        } catch (error: any) {
          errors.push(`${prospect.name}: ${error.message}`);
        }
      }
    } else if (prospectIds && Array.isArray(prospectIds)) {
      // Manual enrollment of specific prospects
      for (const prospectId of prospectIds) {
        try {
          // Check if already enrolled
          const existing = await prisma.dripEnrollment.findUnique({
            where: {
              campaignId_prospectId: {
                campaignId,
                prospectId,
              },
            },
          });

          if (existing) {
            skippedCount++;
            continue;
          }

          // Calculate next email time
          const firstStep = campaign.steps[0];
          const nextEmailAt = new Date();
          nextEmailAt.setDate(nextEmailAt.getDate() + firstStep.delayDays);
          nextEmailAt.setHours(nextEmailAt.getHours() + firstStep.delayHours);

          await prisma.dripEnrollment.create({
            data: {
              campaignId,
              prospectId,
              nextEmailAt,
            },
          });

          enrolledCount++;
        } catch (error: any) {
          errors.push(`Prospect ${prospectId}: ${error.message}`);
        }
      }
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Either prospectIds array or autoEnroll flag must be provided",
        },
        { status: 400 }
      );
    }

    // Update campaign stats
    await prisma.dripCampaign.update({
      where: { id: campaignId },
      data: {
        totalEnrolled: { increment: enrolledCount },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Enrolled ${enrolledCount} prospect(s), skipped ${skippedCount} already enrolled`,
      stats: {
        enrolled: enrolledCount,
        skipped: skippedCount,
        errors: errors.length,
      },
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error("Error enrolling prospects:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to enroll prospects" },
      { status: 500 }
    );
  }
}
