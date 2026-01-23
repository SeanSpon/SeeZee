import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TodoPriority, TodoStatus } from "@prisma/client";

const ADMIN_ROLES = ["CEO", "CFO", "ADMIN", "STAFF", "DEV", "FRONTEND", "BACKEND", "DESIGNER"];

interface TaskInput {
  title: string;
  description?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH";
  estimatedHours?: number;
  dueDate?: string;
  assignedToId?: string;
}

/**
 * POST /api/ai/create-tasks
 * Bulk create tasks from AI suggestions
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!ADMIN_ROLES.includes(session.user.role || "")) {
      return NextResponse.json({ error: "Admin role required" }, { status: 403 });
    }

    const body = await req.json();
    const { 
      projectId, 
      milestoneId, 
      tasks,
      aiContext,
    }: {
      projectId?: string;
      milestoneId?: string;
      tasks: TaskInput[];
      aiContext?: any;
    } = body;

    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
      return NextResponse.json({ error: "Tasks array required" }, { status: 400 });
    }

    // Validate project/milestone exist
    if (projectId) {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { id: true },
      });
      if (!project) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
      }
    }

    if (milestoneId) {
      const milestone = await prisma.projectMilestone.findUnique({
        where: { id: milestoneId },
        select: { id: true, projectId: true },
      });
      if (!milestone) {
        return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
      }
    }

    // Build task data - handle fields that may not exist in schema yet
    const buildTaskData = (task: TaskInput, index: number) => {
      const baseData: any = {
        title: task.title,
        description: task.description || null,
        priority: (task.priority as TodoPriority) || TodoPriority.MEDIUM,
        status: TodoStatus.TODO,
        projectId: projectId || null,
        estimatedHours: task.estimatedHours || null,
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
        assignedToId: task.assignedToId || null,
        createdById: session.user.id!,
        column: "todo",
        position: index,
      };

      // Add new fields if they exist in schema (will work after migration)
      if (milestoneId) {
        baseData.milestoneId = milestoneId;
      }
      if (aiContext) {
        baseData.aiGenerated = true;
        baseData.aiContext = aiContext;
      }

      return baseData;
    };

    // Create tasks
    const createdTasks = await prisma.$transaction(
      tasks.map((task, index) => 
        prisma.todo.create({
          data: buildTaskData(task, index),
        })
      )
    );

    return NextResponse.json({
      success: true,
      created: createdTasks.length,
      tasks: createdTasks,
    });
  } catch (error) {
    console.error("[POST /api/ai/create-tasks]", error);
    return NextResponse.json(
      { error: "Failed to create tasks" },
      { status: 500 }
    );
  }
}
