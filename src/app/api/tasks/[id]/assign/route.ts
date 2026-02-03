import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/server/db";
import { isStaffRole } from "@/lib/role";

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

    // Clear all assignment fields first, then set the appropriate one
    const updateData: any = {
      assignedToId: null,
      assignedToRole: null,
      assignedToTeamId: null,
    };

    // Set the appropriate assignment based on what's provided
    if (body.assignedToId) {
      updateData.assignedToId = body.assignedToId;
    } else if (body.assignedToRole) {
      updateData.assignedToRole = body.assignedToRole;
    } else if (body.assignedToTeamId) {
      updateData.assignedToTeamId = body.assignedToTeamId;
    }

    const task = await db.todo.update({
      where: { id: taskId },
      data: updateData,
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true, image: true, role: true },
        },
      },
    });

    // Create activity log
    await db.activity.create({
      data: {
        type: "STATUS_CHANGE",
        title: "Task assignment updated",
        description: body.assignedToId 
          ? `Task assigned to user`
          : body.assignedToRole
          ? `Task assigned to ${body.assignedToRole} role`
          : body.assignedToTeamId
          ? `Task assigned to team`
          : "Task unassigned",
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
    console.error("Error updating task assignment:", error);
    return NextResponse.json(
      { error: "Failed to update task assignment" },
      { status: 500 }
    );
  }
}
