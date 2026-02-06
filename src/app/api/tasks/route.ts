import { NextRequest, NextResponse } from "next/server";
import { withInternalStaff, getSession } from "@/server/http";
import { getTasks } from "@/server/actions/tasks";
import { auth } from "@/auth";
import { db } from "@/server/db";
import { isStaffRole } from "@/lib/role";
import { TodoPriority, TodoStatus } from "@prisma/client";

/**
 * GET /api/tasks
 * Staff-only: Get tasks with optional filters
 */
export const GET = withInternalStaff(async (req: NextRequest) => {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const assignedToRole = searchParams.get("assignedToRole");
    const projectId = searchParams.get("projectId");

    const result = await getTasks({
      status: status as any,
      assignedToRole: assignedToRole as any,
      projectId: projectId || undefined,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to fetch tasks" },
        { status: 500 }
      );
    }

    return NextResponse.json({ tasks: result.tasks }, { status: 200 });
  } catch (error) {
    console.error("[GET /api/tasks]", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
});

/**
 * POST /api/tasks
 * Create a new task
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();

    // Validate required fields
    if (!body.title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const task = await db.todo.create({
      data: {
        title: body.title,
        description: body.description || null,
        status: TodoStatus.TODO,
        priority: body.priority ? (body.priority as TodoPriority) : TodoPriority.MEDIUM,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        projectId: body.projectId || null,
        assignedToId: body.assignedToId || null,
        assignedToRole: body.assignedToRole || null,
        assignedToTeamId: body.assignedToTeamId || null,
        createdById: session.user.id,
        estimatedHours: body.estimatedHours || null,
        column: "todo",
        position: 0,
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

    // Create activity log (non-blocking - don't fail task creation if this fails)
    try {
      await db.activity.create({
        data: {
          type: "TASK_CREATED",
          title: "Task created",
          description: `Created task: ${body.title}`,
          userId: session.user.id,
          entityType: "TODO",
          entityId: task.id,
        },
      });
    } catch (activityError) {
      console.error("Failed to create activity log:", activityError);
      // Continue anyway - activity log is not critical
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
      },
    });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}

