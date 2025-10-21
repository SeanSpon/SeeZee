import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CompletionStatus } from "@prisma/client";

/**
 * GET /api/ceo/completions
 * Get all completions with optional filters
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "CEO") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const trainingId = searchParams.get("trainingId");
    const status = searchParams.get("status") as CompletionStatus | null;

    const completions = await prisma.completion.findMany({
      where: {
        ...(userId && { userId }),
        ...(trainingId && {
          assignment: {
            trainingId,
          },
        }),
        ...(status && { status }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        assignment: {
          include: {
            training: {
              select: {
                id: true,
                title: true,
                type: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(completions);
  } catch (error) {
    console.error("[GET /api/ceo/completions]", error);
    return NextResponse.json(
      { error: "Failed to fetch completions" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/ceo/completions
 * Update completion status (CEO can update any, users can update their own via client API)
 */
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "CEO") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { assignmentId, userId, status, notes } = body;

    if (!assignmentId || !userId || !status) {
      return NextResponse.json(
        { error: "Assignment ID, user ID, and status are required" },
        { status: 400 }
      );
    }

    // Find the completion record
    const completion = await prisma.completion.findUnique({
      where: {
        assignmentId_userId: {
          assignmentId,
          userId,
        },
      },
    });

    if (!completion) {
      return NextResponse.json(
        { error: "Completion record not found" },
        { status: 404 }
      );
    }

    // Update the completion
    const updated = await prisma.completion.update({
      where: {
        assignmentId_userId: {
          assignmentId,
          userId,
        },
      },
      data: {
        status,
        ...(notes !== undefined && { notes }),
        ...(status === "IN_PROGRESS" &&
          !completion.startedAt && { startedAt: new Date() }),
        ...(status === "COMPLETE" &&
          !completion.completedAt && { completedAt: new Date() }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignment: {
          include: {
            training: {
              select: {
                id: true,
                title: true,
                type: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PUT /api/ceo/completions]", error);
    return NextResponse.json(
      { error: "Failed to update completion" },
      { status: 500 }
    );
  }
}
