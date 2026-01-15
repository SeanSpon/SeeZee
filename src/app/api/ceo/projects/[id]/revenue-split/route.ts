import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withCEO, getSession } from "@/server/http";
import { z } from "zod";

const revenueSplitSchema = z.object({
  businessPercent: z.number().min(0).max(100),
  ownerPercent: z.number().min(0).max(100),
  robardsPercent: z.number().min(0).max(100),
}).refine(
  (data) => data.businessPercent + data.ownerPercent + data.robardsPercent === 100,
  { message: "Percentages must sum to 100" }
);

/**
 * GET /api/ceo/projects/[id]/revenue-split
 * CEO-only: Get revenue split configuration for a project
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user || session.user.role !== "CEO") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: projectId } = await params;

    // Get or create revenue split
    // TODO: Add ProjectRevenueSplit model to Prisma schema
    const revenueSplit: any = {
      projectId,
      businessPercent: 50,
      ownerPercent: 25,
      robardsPercent: 25,
    }; // Temporary fix until ProjectRevenueSplit model is added
    /* let revenueSplit = await prisma.projectRevenueSplit.findUnique({
      where: { projectId },
    });

    // If not exists, create with default values
    if (!revenueSplit) {
      revenueSplit = await prisma.projectRevenueSplit.create({
        data: {
          projectId,
          businessPercent: 50,
          ownerPercent: 25,
          robardsPercent: 25,
        },
      });
    }
    */

    return NextResponse.json({ success: true, revenueSplit }, { status: 200 });
  } catch (error) {
    console.error("[GET /api/ceo/projects/[id]/revenue-split]", error);
    return NextResponse.json(
      { error: "Failed to fetch revenue split" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/ceo/projects/[id]/revenue-split
 * CEO-only: Update revenue split configuration for a project
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user || session.user.role !== "CEO") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: projectId } = await params;
    const body = await req.json();
    const parsed = revenueSplitSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { businessPercent, ownerPercent, robardsPercent } = parsed.data;

    // Update or create revenue split
    // TODO: Add ProjectRevenueSplit model to Prisma schema
    const revenueSplit: any = {
      projectId,
      businessPercent,
      ownerPercent,
      robardsPercent,
    }; // Temporary fix until ProjectRevenueSplit model is added
    /* const revenueSplit = await prisma.projectRevenueSplit.upsert({
      where: { projectId },
      create: {
        projectId,
        businessPercent,
        ownerPercent,
        robardsPercent,
      },
      update: {
        businessPercent,
        ownerPercent,
        robardsPercent,
      },
    });
    */

    // Log the change
    // TODO: Re-enable when ProjectRevenueSplit model is added
    /*
    await prisma.systemLog.create({
      data: {
        entityType: "ProjectRevenueSplit",
        entityId: revenueSplit.id,
        action: "UPDATED",
        userId: session.user.id!,
        metadata: {
          projectId,
          businessPercent,
          ownerPercent,
          robardsPercent,
        },
        message: `Revenue split updated for project: ${businessPercent}% business, ${ownerPercent}% owner, ${robardsPercent}% Robards`,
      },
    });
    */

    return NextResponse.json({ success: true, revenueSplit }, { status: 200 });
  } catch (error) {
    console.error("[PUT /api/ceo/projects/[id]/revenue-split]", error);
    return NextResponse.json(
      { error: "Failed to update revenue split" },
      { status: 500 }
    );
  }
}

