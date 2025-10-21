import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/ceo/tools/[id]
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

    const tool = await prisma.toolEntry.findUnique({
      where: { id },
    });

    if (!tool) {
      return NextResponse.json({ error: "Tool not found" }, { status: 404 });
    }

    return NextResponse.json(tool);
  } catch (error) {
    console.error("[GET /api/ceo/tools/:id]", error);
    return NextResponse.json(
      { error: "Failed to fetch tool" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/ceo/tools/[id]
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
    const { name, category, url, description, visibility, icon, tags } = body;

    const tool = await prisma.toolEntry.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(category !== undefined && { category }),
        ...(url !== undefined && { url }),
        ...(description !== undefined && { description }),
        ...(visibility !== undefined && { visibility }),
        ...(icon !== undefined && { icon }),
        ...(tags !== undefined && { tags }),
      },
    });

    return NextResponse.json(tool);
  } catch (error) {
    console.error("[PUT /api/ceo/tools/:id]", error);
    return NextResponse.json(
      { error: "Failed to update tool" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/ceo/tools/[id]
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

    await prisma.toolEntry.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/ceo/tools/:id]", error);
    return NextResponse.json(
      { error: "Failed to delete tool" },
      { status: 500 }
    );
  }
}
