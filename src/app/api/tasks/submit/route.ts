import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withInternalStaff, getSession } from "@/server/http";
import { z } from "zod";

const submitTaskSchema = z.object({
  taskId: z.string().min(1, "Task ID is required"),
  submissionNotes: z.string().optional(),
});

/**
 * POST /api/tasks/submit
 * Staff-only: Submit a completed task for review
 */
export const POST = withInternalStaff(async (req: NextRequest) => {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = submitTaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { taskId, submissionNotes } = parsed.data;

    // Get the task
    const task = await prisma.todo.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Check if user is the one who is assigned to it
    if (task.assignedToId !== session.user.id) {
      return NextResponse.json(
        { error: "You don't have permission to submit this task" },
        { status: 403 }
      );
    }

    // Update task
    const updatedTask = await prisma.todo.update({
      where: { id: taskId },
      data: {
        status: "SUBMITTED",
        submittedAt: new Date(),
        submissionNotes: submissionNotes || null,
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
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      } as any,
    });

    // Create notification for CEO
    await prisma.notification.create({
      data: {
        userId: task.createdById,
        title: "Task Submitted for Review",
        message: `${session.user.name || session.user.email} submitted: ${task.title}`,
        type: "INFO",
      },
    });

    // Log the submission
    await prisma.systemLog.create({
      data: {
        entityType: "Todo",
        entityId: task.id,
        action: "SUBMITTED",
        userId: session.user.id!,
        metadata: {
          taskTitle: task.title,
          submittedBy: session.user.id!,
          submissionNotes,
        },
        message: `Task "${task.title}" submitted for review`,
      },
    });

    return NextResponse.json({ success: true, task: updatedTask }, { status: 200 });
  } catch (error) {
    console.error("[POST /api/tasks/submit]", error);
    return NextResponse.json(
      { error: "Failed to submit task" },
      { status: 500 }
    );
  }
});

