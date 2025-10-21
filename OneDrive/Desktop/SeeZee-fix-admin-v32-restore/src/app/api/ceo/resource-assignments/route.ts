import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/ceo/resource-assignments
 * Assign a resource to multiple users
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !["CEO", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { resourceId, userIds, dueAt, notes } = body;

    if (!resourceId || !userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: "Resource ID and user IDs are required" },
        { status: 400 }
      );
    }

    // Verify resource exists
    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
    });

    if (!resource) {
      return NextResponse.json(
        { error: "Resource not found" },
        { status: 404 }
      );
    }

    // Create notifications for each user
    const notifications = await prisma.notification.createMany({
      data: userIds.map((userId: string) => ({
        userId,
        title: "New Resource Assigned",
        message: `You have been assigned the resource: ${resource.title}${
          dueAt ? ` (Due: ${new Date(dueAt).toLocaleDateString()})` : ""
        }${notes ? `\n\nNotes: ${notes}` : ""}`,
        type: "INFO",
      })),
    });

    // Log the assignment
    await prisma.systemLog.create({
      data: {
        entityType: "Resource",
        entityId: resourceId,
        action: "ASSIGNED",
        userId: session.user.id,
        metadata: {
          resourceTitle: resource.title,
          assignedTo: userIds,
          dueAt,
          notes,
        },
        message: `Assigned resource "${resource.title}" to ${userIds.length} user(s)`,
      },
    });

    return NextResponse.json({
      success: true,
      assignedCount: userIds.length,
      resourceTitle: resource.title,
    });
  } catch (error) {
    console.error("[POST /api/ceo/resource-assignments]", error);
    return NextResponse.json(
      { error: "Failed to assign resource" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ceo/resource-assignments
 * Get all resource assignments (for admin view)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !["CEO", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const resourceId = searchParams.get("resourceId");
    const userId = searchParams.get("userId");

    // Get assignment logs
    const logs = await prisma.systemLog.findMany({
      where: {
        entityType: "Resource",
        action: "ASSIGNED",
        ...(resourceId && { entityId: resourceId }),
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
    console.error("[GET /api/ceo/resource-assignments]", error);
    return NextResponse.json(
      { error: "Failed to fetch assignments" },
      { status: 500 }
    );
  }
}
