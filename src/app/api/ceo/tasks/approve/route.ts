import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withCEO, getSession } from "@/server/http";
import { z } from "zod";
import { TodoStatus } from "@prisma/client";

const approveTaskSchema = z.object({
  taskId: z.string().min(1, "Task ID is required"),
  approved: z.boolean(),
  notes: z.string().optional(),
});

/**
 * POST /api/ceo/tasks/approve
 * CEO-only: Approve or reject a submitted task
 */
export const POST = withCEO(async (req: NextRequest) => {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = approveTaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { taskId, approved, notes } = parsed.data;

    // Get the task
    const task = await prisma.todo.findUnique({
      where: { id: taskId },
      // TODO: Add claimedBy field to Todo model if needed
      // include: {
      //   claimedBy: {
      //     select: {
      //       id: true,
      //       name: true,
      //       email: true,
      //     },
      //   },
      // },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (task.status !== TodoStatus.SUBMITTED) {
      return NextResponse.json(
        { error: "Task is not in submitted status" },
        { status: 400 }
      );
    }

    if (approved) {
      // Approve task - move to awaiting payout
      const updatedTask = await prisma.todo.update({
        where: { id: taskId },
        data: {
          status: TodoStatus.AWAITING_PAYOUT,
          approvedAt: new Date(),
        } as any,
        include: {
          project: {
            select: {
              id: true,
              name: true,
            },
          },
          // TODO: Add claimedBy field to Todo model if needed
          // claimedBy: {
          //   select: {
          //     id: true,
          //     name: true,
          //     email: true,
          //   },
          // },
        } as any,
      });
      
      // TODO: Create taskPayout when model is added to schema
      // const payout = await prisma.taskPayout.create({
      //   data: {
      //     taskId,
      //     userId: task.claimedById!,
      //     amount: task.payoutAmount || "0",
      //     status: "AWAITING_CLIENT_PAYMENT",
      //   },
      // });

      // Create notification for the worker
      // TODO: Add claimedById and payoutAmount fields to Todo model
      // await prisma.notification.create({
      //   data: {
      //     userId: task.claimedById!,
      //     title: "Task Approved",
      //     message: `Your task "${task.title}" has been approved. Payout: $${task.payoutAmount || "0"}`,
      //     type: "SUCCESS",
      //   },
      // });

      // Log the approval
      await prisma.systemLog.create({
        data: {
          entityType: "Todo",
          entityId: task.id,
          action: "APPROVED",
          userId: session.user.id!,
          metadata: {
            taskTitle: task.title,
            approvedBy: session.user.id!,
            // payoutAmount: task.payoutAmount, // TODO: Add payoutAmount field to Todo model
          },
          message: `Task "${task.title}" approved by CEO`,
        },
      });

      return NextResponse.json(
        { success: true, task: updatedTask },
        { status: 200 }
      );
    } else {
      // Reject task - reset to in progress
      const updatedTask = await prisma.todo.update({
        where: { id: taskId },
        data: {
          status: TodoStatus.IN_PROGRESS,
        },
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

      // Create notification for the worker
      // TODO: Add claimedById field to Todo model
      // await prisma.notification.create({
      //   data: {
      //     userId: task.claimedById!,
      //     title: "Task Rejected",
      //     message: `Your task "${task.title}" needs revision. ${notes || ""}`,
      //     type: "WARNING",
      //   },
      // });

      // Log the rejection
      await prisma.systemLog.create({
        data: {
          entityType: "Todo",
          entityId: task.id,
          action: "REJECTED",
          userId: session.user.id!,
          metadata: {
            taskTitle: task.title,
            rejectedBy: session.user.id!,
            notes,
          },
          message: `Task "${task.title}" rejected by CEO${notes ? ` - ${notes}` : ""}`,
        },
      });

      return NextResponse.json({ success: true, task: updatedTask }, { status: 200 });
    }
  } catch (error) {
    console.error("[POST /api/ceo/tasks/approve]", error);
    return NextResponse.json(
      { error: "Failed to approve task" },
      { status: 500 }
    );
  }
});

