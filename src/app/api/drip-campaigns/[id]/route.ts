import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/requireRole";
import { ROLE } from "@/lib/role";

/**
 * GET /api/drip-campaigns/[id]
 * Get a single campaign
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const campaign = await prisma.dripCampaign.findUnique({
      where: { id },
      include: {
        steps: {
          orderBy: { stepNumber: "asc" },
          include: {
            template: true,
          },
        },
        enrollments: {
          include: {
            prospect: {
              select: {
                id: true,
                name: true,
                email: true,
                company: true,
              },
            },
          },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: "Campaign not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      campaign,
    });
  } catch (error: any) {
    console.error("Error fetching campaign:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch campaign" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/drip-campaigns/[id]
 * Update a campaign
 */
export async function PATCH(
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

    const { id } = await params;
    const body = await req.json();

    // Check if campaign exists
    const existing = await prisma.dripCampaign.findUnique({
      where: { id },
      include: { steps: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Campaign not found" },
        { status: 404 }
      );
    }

    // If steps are being updated, delete old ones and create new ones
    if (body.steps) {
      await prisma.dripCampaignStep.deleteMany({
        where: { campaignId: id },
      });
    }

    const campaign = await prisma.dripCampaign.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.active !== undefined && { active: body.active }),
        ...(body.targetStatus !== undefined && { targetStatus: body.targetStatus }),
        ...(body.targetTags !== undefined && { targetTags: body.targetTags }),
        ...(body.minLeadScore !== undefined && { minLeadScore: body.minLeadScore }),
        ...(body.maxLeadScore !== undefined && { maxLeadScore: body.maxLeadScore }),
        ...(body.steps && {
          steps: {
            create: body.steps.map((step: any) => ({
              stepNumber: step.stepNumber,
              delayDays: step.delayDays,
              delayHours: step.delayHours || 0,
              templateId: step.templateId,
            })),
          },
        }),
      },
      include: {
        steps: {
          include: {
            template: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      campaign,
    });
  } catch (error: any) {
    console.error("Error updating campaign:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update campaign" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/drip-campaigns/[id]
 * Delete a campaign
 */
export async function DELETE(
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

    const allowedRoles = [ROLE.CEO, ROLE.CFO];
    if (!allowedRoles.includes(user.role as any)) {
      return NextResponse.json(
        { success: false, error: "Only CEO/CFO can delete campaigns" },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Check if campaign has active enrollments
    const campaign = await prisma.dripCampaign.findUnique({
      where: { id },
      include: {
        enrollments: {
          where: {
            completed: false,
            unsubscribed: false,
          },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: "Campaign not found" },
        { status: 404 }
      );
    }

    if (campaign.enrollments.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete campaign with ${campaign.enrollments.length} active enrollment(s). Set it to inactive instead.`,
        },
        { status: 400 }
      );
    }

    await prisma.dripCampaign.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Campaign deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting campaign:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete campaign" },
      { status: 500 }
    );
  }
}
