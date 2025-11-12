import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withInternalStaff, getSession } from "@/server/http";
import { z } from "zod";

const claimTaskSchema = z.object({
  taskId: z.string().min(1, "Task ID is required"),
});

/**
 * POST /api/tasks/claim
 * Staff-only: Claim a task from a role group
 */
export const POST = withInternalStaff(async (req: NextRequest) => {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = claimTaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { taskId } = parsed.data;

    // Get the task
    const task = await prisma.todo.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Check if task is available to claim
    if (task.assignedToId) {
      return NextResponse.json(
        { error: "Task already assigned" },
        { status: 400 }
      );
    }

    // TODO: Add assignedToRole field to Todo model for role-based claiming
    // Check if user has the correct role
    // if (task.assignedToRole !== session.user.role) {
    //   return NextResponse.json(
    //     { error: "You don't have permission to claim this task" },
    //     { status: 403 }
    //   );
    // }

    // Update task
    const updatedTask = await prisma.todo.update({
      where: { id: taskId },
      data: {
        assignedToId: session.user.id!,
        status: "IN_PROGRESS",
      } as any,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      } as any,
    });
    
    // TODO: Create taskClaim when model is added to schema
    // await prisma.taskClaim.create({
    //   data: {
    //     taskId,
    //     userId: session.user.id!,
    //     status: "ACTIVE",
    //   },
    // });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: session.user.id!,
        title: "Task Claimed",
        message: `You claimed: ${task.title}`,
        type: "SUCCESS",
      },
    });

    // Log the claim
    await prisma.systemLog.create({
      data: {
        entityType: "Todo",
        entityId: task.id,
        action: "CLAIMED",
        userId: session.user.id!,
        metadata: {
          taskTitle: task.title,
          claimedBy: session.user.id!,
        },
        message: `Task "${task.title}" claimed by ${session.user.name || session.user.email}`,
      },
    });

    return NextResponse.json({ success: true, task: updatedTask }, { status: 200 });
  } catch (error) {
    console.error("[POST /api/tasks/claim]", error);
    return NextResponse.json(
      { error: "Failed to claim task" },
      { status: 500 }
    );
  }
});

