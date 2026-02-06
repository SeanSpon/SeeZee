import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/server/db";
import { isStaffRole } from "@/lib/role";
import { TodoStatus, TodoPriority } from "@prisma/client";

/**
 * PATCH /api/tasks/[id]
 * Update a task (status, priority, due date, etc.)
 */
export async function PATCH(
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

    // Build update data
    const updateData: any = {};

    if (body.status) {
      updateData.status = body.status as TodoStatus;
      
      // Auto-set timestamps based on status
      if (body.status === "DONE") {
        updateData.completedAt = new Date();
      } else if (body.status === "SUBMITTED") {
        updateData.submittedAt = new Date();
      }
    }

    if (body.priority) {
      updateData.priority = body.priority as TodoPriority;
    }

    if (body.dueDate !== undefined) {
      updateData.dueDate = body.dueDate ? new Date(body.dueDate) : null;
    }

    if (body.title) {
      updateData.title = body.title;
    }

    if (body.description !== undefined) {
      updateData.description = body.description;
    }

    if (body.estimatedHours !== undefined) {
      updateData.estimatedHours = body.estimatedHours;
    }

    if (body.actualHours !== undefined) {
      updateData.actualHours = body.actualHours;
    }

    const task = await db.todo.update({
      where: { id: taskId },
      data: updateData,
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true, image: true, role: true },
        },
        project: {
          select: { id: true, name: true },
        },
      },
    });

    // Create activity log
    await db.activity.create({
      data: {
        type: "STATUS_CHANGE",
        title: "Task updated",
        description: body.status 
          ? `Task status changed to ${body.status}`
          : "Task details updated",
        userId: session.user.id,
        entityType: "TODO",
        entityId: taskId,
      },
    });

    return NextResponse.json({
      success: true,
      task,
    });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/tasks/[id]
 * Delete a task
 */
export async function DELETE(
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

    await db.todo.delete({
      where: { id: taskId },
    });

    return NextResponse.json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
