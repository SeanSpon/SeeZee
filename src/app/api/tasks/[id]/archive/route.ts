import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/server/db";
import { isStaffRole } from "@/lib/role";

/**
 * POST /api/tasks/[id]/archive
 * Archive or restore a task
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || !isStaffRole(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id: taskId } = await params;
    const body = await request.json();
    const archived = body.archived ?? true;

    const task = await db.todo.update({
      where: { id: taskId },
      data: {
        archived,
        archivedAt: archived ? new Date() : null,
        archivedBy: archived ? session.user.id : null,
      },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true, image: true, role: true },
        },
        project: {
          select: { id: true, name: true },
        },
      },
    });

    // Create activity log (non-blocking)
    try {
      await db.activity.create({
        data: {
          type: "STATUS_CHANGE",
          title: archived ? "Task archived" : "Task restored",
          description: archived 
            ? `Archived task: ${task.title}`
            : `Restored task: ${task.title}`,
          userId: session.user.id,
          entityType: "TODO",
          entityId: taskId,
        },
      });
    } catch (activityError) {
      console.error("Failed to create activity log:", activityError);
    }

    // Serialize dates properly for JSON response
    return NextResponse.json({
      success: true,
      task: {
        ...task,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
        dueDate: task.dueDate?.toISOString() || null,
        completedAt: task.completedAt?.toISOString() || null,
        submittedAt: task.submittedAt?.toISOString() || null,
        approvedAt: task.approvedAt?.toISOString() || null,
        archivedAt: task.archivedAt?.toISOString() || null,
      },
    });
  } catch (error) {
    console.error("Error archiving/restoring task:", error);
    return NextResponse.json(
      { error: "Failed to update task archive status" },
      { status: 500 }
    );
  }
}
