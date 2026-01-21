import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/requireRole";
import { ROLE } from "@/lib/role";
import { ProspectStatus } from "@prisma/client";

/**
 * POST /api/prospects/bulk
 * Perform bulk operations on prospects
 */
export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const { action, prospectIds, data } = body;

    if (!action || !prospectIds || !Array.isArray(prospectIds) || prospectIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "Invalid request" },
        { status: 400 }
      );
    }

    let result;
    let message = "";

    switch (action) {
      case "delete":
        // Delete prospects
        result = await prisma.prospect.deleteMany({
          where: {
            id: { in: prospectIds },
          },
        });
        message = `Deleted ${result.count} prospect(s)`;
        break;

      case "archive":
        // Archive prospects
        result = await prisma.prospect.updateMany({
          where: {
            id: { in: prospectIds },
          },
          data: {
            archived: true,
          },
        });
        message = `Archived ${result.count} prospect(s)`;
        break;

      case "unarchive":
        // Unarchive prospects
        result = await prisma.prospect.updateMany({
          where: {
            id: { in: prospectIds },
          },
          data: {
            archived: false,
          },
        });
        message = `Unarchived ${result.count} prospect(s)`;
        break;

      case "updateStatus":
        // Update status
        if (!data?.status) {
          return NextResponse.json(
            { success: false, error: "Status is required" },
            { status: 400 }
          );
        }
        result = await prisma.prospect.updateMany({
          where: {
            id: { in: prospectIds },
          },
          data: {
            status: data.status as ProspectStatus,
          },
        });
        message = `Updated status for ${result.count} prospect(s)`;
        break;

      case "addTags":
        // Add tags to prospects
        if (!data?.tags || !Array.isArray(data.tags)) {
          return NextResponse.json(
            { success: false, error: "Tags are required" },
            { status: 400 }
          );
        }

        // Fetch current prospects to merge tags
        const prospects = await prisma.prospect.findMany({
          where: { id: { in: prospectIds } },
          select: { id: true, tags: true },
        });

        // Update each prospect with merged tags
        await Promise.all(
          prospects.map((prospect) => {
            const newTags = [...new Set([...prospect.tags, ...data.tags])];
            return prisma.prospect.update({
              where: { id: prospect.id },
              data: { tags: newTags },
            });
          })
        );

        message = `Added tags to ${prospects.length} prospect(s)`;
        result = { count: prospects.length };
        break;

      case "removeTags":
        // Remove tags from prospects
        if (!data?.tags || !Array.isArray(data.tags)) {
          return NextResponse.json(
            { success: false, error: "Tags are required" },
            { status: 400 }
          );
        }

        // Fetch current prospects to filter tags
        const prospectsToUpdate = await prisma.prospect.findMany({
          where: { id: { in: prospectIds } },
          select: { id: true, tags: true },
        });

        // Update each prospect with filtered tags
        await Promise.all(
          prospectsToUpdate.map((prospect) => {
            const newTags = prospect.tags.filter((tag) => !data.tags.includes(tag));
            return prisma.prospect.update({
              where: { id: prospect.id },
              data: { tags: newTags },
            });
          })
        );

        message = `Removed tags from ${prospectsToUpdate.length} prospect(s)`;
        result = { count: prospectsToUpdate.length };
        break;

      case "enrollDrip":
        // Enroll in drip campaign
        if (!data?.campaignId) {
          return NextResponse.json(
            { success: false, error: "Campaign ID is required" },
            { status: 400 }
          );
        }

        // Check campaign exists and is active
        const campaign = await prisma.dripCampaign.findUnique({
          where: { id: data.campaignId },
          include: {
            steps: {
              orderBy: { stepNumber: "asc" },
              take: 1,
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
            { success: false, error: "Campaign has no steps" },
            { status: 400 }
          );
        }

        const firstStep = campaign.steps[0];
        
        // Enroll prospects (skip if already enrolled)
        const enrollments = await Promise.allSettled(
          prospectIds.map(async (prospectId) => {
            const nextEmailAt = new Date();
            if (firstStep.delayDays > 0 || firstStep.delayHours > 0) {
              nextEmailAt.setDate(nextEmailAt.getDate() + firstStep.delayDays);
              nextEmailAt.setHours(nextEmailAt.getHours() + firstStep.delayHours);
            }

            return prisma.dripEnrollment.create({
              data: {
                campaignId: data.campaignId,
                prospectId,
                currentStep: 0,
                nextEmailAt,
              },
            });
          })
        );

        const successCount = enrollments.filter((r) => r.status === "fulfilled").length;
        message = `Enrolled ${successCount} prospect(s) in drip campaign`;
        result = { count: successCount };
        break;

      case "recalculateScores":
        // Recalculate lead scores for selected prospects
        const { calculateLeadScoreDetailed } = await import("@/lib/leads/scoring");

        const prospectsToScore = await prisma.prospect.findMany({
          where: { id: { in: prospectIds } },
        });

        await Promise.all(
          prospectsToScore.map(async (prospect) => {
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

            return prisma.prospect.update({
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
          })
        );

        message = `Recalculated scores for ${prospectsToScore.length} prospect(s)`;
        result = { count: prospectsToScore.length };
        break;

      default:
        return NextResponse.json(
          { success: false, error: "Invalid action" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message,
      count: result.count,
    });
  } catch (error: any) {
    console.error("Error performing bulk operation:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to perform bulk operation" },
      { status: 500 }
    );
  }
}
