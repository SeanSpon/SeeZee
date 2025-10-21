import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminOrCEO, getSession } from "@/server/http";
import { assignTaskSchema } from "@/lib/validation/resources-tools-tasks";

/**
 * POST /api/ceo/tasks/assign
 * Assign tasks to multiple users
 */
export const POST = withAdminOrCEO(async (req: NextRequest) => {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = assignTaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { title, description, priority, projectId, dueDate, userIds } =
      parsed.data;

    let assigned = 0;
    let skipped = 0;
    const createdTasks = [];

    for (const userId of userIds) {
      // Check if task already exists for this user
      const existing = await prisma.todo.findFirst({
        where: {
          title,
          assignedToId: userId,
          ...(projectId && { 
            // Note: Todo model doesn't have projectId, you might need to add it
            // or link via another method
          }),
        },
      });

      if (existing) {
        skipped++;
        continue;
      }

      const task = await prisma.todo.create({
        data: {
          title,
          description: description || "",
          priority,
          assignedToId: userId,
          createdById: session.user.id,
          dueDate: dueDate ? new Date(dueDate) : null,
          status: "TODO",
        },
        include: {
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      createdTasks.push(task);
      assigned++;

      // Create notification for the assigned user
      await prisma.notification.create({
        data: {
          userId,
          title: "New Task Assigned",
          message: `You have been assigned: ${title}${
            dueDate ? ` (Due: ${new Date(dueDate).toLocaleDateString()})` : ""
          }`,
          type: "INFO",
        },
      });

      // Log the assignment
      await prisma.systemLog.create({
        data: {
          entityType: "Todo",
          entityId: task.id,
          action: "ASSIGNED",
          userId: session.user.id,
          metadata: {
            taskTitle: title,
            assignedTo: userId,
            dueDate,
            priority,
          },
          message: `Assigned task "${title}" to ${task.assignedTo?.name || task.assignedTo?.email}`,
        },
      });
    }

    return NextResponse.json(
      {
        assigned,
        skipped,
        tasks: createdTasks,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/ceo/tasks/assign]", error);
    return NextResponse.json(
      { error: "Failed to assign tasks" },
      { status: 500 }
    );
  }
});

/**
 * GET /api/ceo/tasks/assign
 * Get task assignment history
 */
export const GET = withAdminOrCEO(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    const logs = await prisma.systemLog.findMany({
      where: {
        entityType: "Todo",
        action: "ASSIGNED",
        ...(userId && {
          metadata: {
            path: ["assignedTo"],
            equals: userId,
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
      take: 100,
    });

    return NextResponse.json({ assignments: logs });
  } catch (error) {
    console.error("[GET /api/ceo/tasks/assign]", error);
    return NextResponse.json(
      { error: "Failed to fetch assignments" },
      { status: 500 }
    );
  }
});
