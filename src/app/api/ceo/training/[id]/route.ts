import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/ceo/training/[id]
 * Get a single training by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user || session.user.role !== "CEO") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const training = await prisma.training.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        assignments: {
          include: {
            completions: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!training) {
      return NextResponse.json(
        { error: "Training not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(training);
  } catch (error) {
    console.error("[GET /api/ceo/training/:id]", error);
    return NextResponse.json(
      { error: "Failed to fetch training" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/ceo/training/[id]
 * Update a training
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user || session.user.role !== "CEO") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, type, description, visibility, url, fileKey, tags } = body;

    const training = await prisma.training.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(type !== undefined && { type }),
        ...(description !== undefined && { description }),
        ...(visibility !== undefined && { visibility }),
        ...(url !== undefined && { url }),
        ...(fileKey !== undefined && { fileKey }),
        ...(tags !== undefined && { tags }),
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(training);
  } catch (error) {
    console.error("[PUT /api/ceo/training/:id]", error);
    return NextResponse.json(
      { error: "Failed to update training" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/ceo/training/[id]
 * Delete a training (cascades to assignments and completions)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user || session.user.role !== "CEO") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.training.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/ceo/training/:id]", error);
    return NextResponse.json(
      { error: "Failed to delete training" },
      { status: 500 }
    );
  }
}
