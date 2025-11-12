import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withCEO, getSession } from "@/server/http";
import { assignTaskSchema } from "@/lib/validation/resources-tools-tasks";

/**
 * POST /api/ceo/tasks/assign
 * CEO-only: Assign tasks to role groups or individual users
 * Supports role-based assignment (assign to Frontend/Backend/Outreach) or individual assignment
 */
export const POST = withCEO(async (req: NextRequest) => {
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

    const {
      title,
      description,
      priority,
      projectId,
      dueDate,
      assignedToRole,
      userIds,
      payoutAmount,
    } = parsed.data;

    let assigned = 0;
    let skipped = 0;
    const createdTasks = [];

    // Role-based assignment (assign to role group)
    if (assignedToRole) {
      // Validate that the project exists (if provided)
      if (projectId) {
        const project = await prisma.project.findUnique({
          where: { id: projectId },
          select: { id: true },
        });

        if (!project) {
          return NextResponse.json(
            { error: `Project not found: ${projectId}` },
            { status: 400 }
          );
        }
      }

      // Validate that the session user exists
      const creator = await prisma.user.findUnique({
        where: { id: session.user.id! },
        select: { id: true },
      });

      if (!creator) {
        return NextResponse.json(
          { error: "Session user not found" },
          { status: 401 }
        );
      }

      // Check if task already exists for this role and project
      // TODO: Add assignedToRole field to Todo model
      const existing = await prisma.todo.findFirst({
        where: {
          title,
          // assignedToRole, // TODO: Add this field to Todo model
          ...(projectId && { projectId }),
        } as any,
      });

      if (existing) {
        skipped++;
      } else {
        const task = await prisma.todo.create({
          data: {
            title,
            description: description || "",
            priority,
            // assignedToRole, // TODO: Add this field to Todo model
            projectId: projectId && typeof projectId === "string" && projectId.trim() !== "" ? projectId : null,
            // payoutAmount: payoutAmount ? payoutAmount.toString() : null, // TODO: Add this field to Todo model
            createdById: creator.id,
            dueDate: dueDate ? new Date(dueDate) : null,
            status: "TODO",
          } as any,
          include: {
            project: {
              select: {
                id: true,
                name: true,
              },
            },
          } as any,
        });

        createdTasks.push(task);
        assigned++;

        // Log the assignment
        await prisma.systemLog.create({
          data: {
            entityType: "Todo",
            entityId: task.id,
            action: "ASSIGNED",
            userId: session.user.id!,
            metadata: {
              taskTitle: title,
              assignedToRole,
              projectId,
              payoutAmount,
              dueDate,
              priority,
            },
            message: `Assigned task "${title}" to ${assignedToRole} role group`,
          },
        });
      }
    }
    // Individual assignment (backward compatibility)
    else if (userIds && userIds.length > 0) {
      // Validate that the session user (creator) exists
      const creator = await prisma.user.findUnique({
        where: { id: session.user.id! },
        select: { id: true },
      });

      if (!creator) {
        return NextResponse.json(
          { error: "Session user not found" },
          { status: 401 }
        );
      }

      for (const userId of userIds) {
        // Validate that the user exists
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true },
        });

        if (!user) {
          console.warn(`[POST /api/ceo/tasks/assign] User not found: ${userId}`);
          skipped++;
          continue;
        }

        // Validate that the project exists (if provided)
        if (projectId) {
          const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: { id: true },
          });

          if (!project) {
            console.warn(`[POST /api/ceo/tasks/assign] Project not found: ${projectId}`);
            skipped++;
            continue;
          }
        }

        // Check if task already exists for this user
        const existing = await prisma.todo.findFirst({
          where: {
            title,
            assignedToId: userId,
            ...(projectId && { projectId }),
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
            projectId: projectId && typeof projectId === "string" && projectId.trim() !== "" ? projectId : null,
            // payoutAmount: payoutAmount ? payoutAmount.toString() : null, // TODO: Add this field to Todo model
            createdById: creator.id,
            dueDate: dueDate ? new Date(dueDate) : null,
            status: "TODO",
          } as any,
          include: {
            assignedTo: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            project: {
              select: {
                id: true,
                name: true,
              },
            },
          } as any,
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
            userId: session.user.id!,
            metadata: {
              taskTitle: title,
              assignedTo: userId,
              projectId,
              payoutAmount,
              dueDate,
              priority,
            },
            message: `Assigned task "${title}" to ${(task as any).assignedTo?.name || (task as any).assignedTo?.email}`,
          },
        });
      }
    }

    return NextResponse.json(
      {
        assigned,
        skipped,
        tasks: createdTasks,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[POST /api/ceo/tasks/assign]", error);
    
    // Handle Prisma foreign key constraint errors
    if (error?.code === "P2003") {
      const field = error?.meta?.field_name || "unknown field";
      return NextResponse.json(
        { 
          error: "Foreign key constraint failed",
          details: `The referenced ${field} does not exist in the database`,
          code: error.code
        },
        { status: 400 }
      );
    }

    // Handle other Prisma errors
    if (error?.code) {
      return NextResponse.json(
        { 
          error: "Database error",
          details: error.message || "An error occurred while processing the request",
          code: error.code
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: "Failed to assign tasks",
        details: error?.message || "An unexpected error occurred"
      },
      { status: 500 }
    );
  }
});

/**
 * GET /api/ceo/tasks/assign
 * CEO-only: Get task assignment history
 */
export const GET = withCEO(async (req: NextRequest) => {
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
