import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/ceo/tool-assignments
 * Assign a tool to multiple users
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !["CEO", "CFO"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { toolId, userIds, dueAt, notes } = body;

    if (!toolId || !userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: "Tool ID and user IDs are required" },
        { status: 400 }
      );
    }

    // Verify tool exists
    const tool = await prisma.toolEntry.findUnique({
      where: { id: toolId },
    });

    if (!tool) {
      return NextResponse.json(
        { error: "Tool not found" },
        { status: 404 }
      );
    }

    // Create notifications for each user
    const notifications = await prisma.notification.createMany({
      data: userIds.map((userId: string) => ({
        userId,
        title: "New Tool Assigned",
        message: `You have been assigned the tool: ${tool.name}${
          dueAt ? ` (Setup by: ${new Date(dueAt).toLocaleDateString()})` : ""
        }${notes ? `\n\nNotes: ${notes}` : ""}`,
        type: "INFO",
      })),
    });

    // Log the assignment
    await prisma.systemLog.create({
      data: {
        entityType: "Tool",
        entityId: toolId,
        action: "ASSIGNED",
        userId: session.user.id,
        metadata: {
          toolName: tool.name,
          assignedTo: userIds,
          dueAt,
          notes,
        },
        message: `Assigned tool "${tool.name}" to ${userIds.length} user(s)`,
      },
    });

    return NextResponse.json({
      success: true,
      assignedCount: userIds.length,
      toolName: tool.name,
    });
  } catch (error) {
    console.error("[POST /api/ceo/tool-assignments]", error);
    return NextResponse.json(
      { error: "Failed to assign tool" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ceo/tool-assignments
 * Get all tool assignments (for admin view)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !["CEO", "CFO"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const toolId = searchParams.get("toolId");
    const userId = searchParams.get("userId");

    // Get assignment logs
    const logs = await prisma.systemLog.findMany({
      where: {
        entityType: "Tool",
        action: "ASSIGNED",
        ...(toolId && { entityId: toolId }),
        ...(userId && {
          metadata: {
            path: ["assignedTo"],
            array_contains: userId,
          },
        }),
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
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error("[GET /api/ceo/tool-assignments]", error);
    return NextResponse.json(
      { error: "Failed to fetch assignments" },
      { status: 500 }
    );
  }
}
