import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/requireRole";
import { ROLE } from "@/lib/role";

/**
 * GET /api/drip-campaigns
 * List all drip campaigns
 */
export async function GET(req: NextRequest) {
  try {
    const campaigns = await prisma.dripCampaign.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        steps: {
          orderBy: { stepNumber: "asc" },
          include: {
            template: {
              select: {
                id: true,
                name: true,
                subject: true,
              },
            },
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      campaigns,
    });
  } catch (error: any) {
    console.error("Error fetching campaigns:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch campaigns" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/drip-campaigns
 * Create a new drip campaign
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
    const {
      name,
      description,
      active,
      targetStatus,
      targetTags,
      minLeadScore,
      maxLeadScore,
      steps,
    } = body;

    // Validation
    if (!name) {
      return NextResponse.json(
        { success: false, error: "Campaign name is required" },
        { status: 400 }
      );
    }

    if (!steps || steps.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one step is required" },
        { status: 400 }
      );
    }

    // Create campaign with steps
    const campaign = await prisma.dripCampaign.create({
      data: {
        name,
        description: description || null,
        active: active || false,
        targetStatus: targetStatus || [],
        targetTags: targetTags || [],
        minLeadScore: minLeadScore || null,
        maxLeadScore: maxLeadScore || null,
        steps: {
          create: steps.map((step: any) => ({
            stepNumber: step.stepNumber,
            delayDays: step.delayDays,
            delayHours: step.delayHours || 0,
            templateId: step.templateId,
          })),
        },
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
    console.error("Error creating campaign:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create campaign" },
      { status: 500 }
    );
  }
}
