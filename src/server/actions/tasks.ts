"use server";

/**
 * Server actions for Task management
 */

import { db } from "@/server/db";
import { requireRole } from "@/lib/auth/requireRole";
import { ROLE } from "@/lib/role";
import { revalidatePath } from "next/cache";
import { createActivity } from "./activity";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

interface CreateTaskParams {
  title: string;
  description?: string;
  priority?: TaskPriority;
  assignedToId?: string;
  dueDate?: Date;
}

/**
 * Get all tasks
 */
export async function getTasks(filter?: {
  status?: TaskStatus;
  assignedToId?: string;
}) {
  await requireRole([ROLE.CEO, ROLE.ADMIN, ROLE.STAFF, ROLE.DESIGNER, ROLE.DEV]);

  try {
    const where: any = {};

    if (filter?.status) {
      where.status = filter.status;
    }

    if (filter?.assignedToId) {
      where.assignedToId = filter.assignedToId;
    }

    const tasks = await db.todo.findMany({
      where,
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [
        { status: "asc" },
        { priority: "desc" },
        { dueDate: "asc" },
      ],
    });

    return { success: true, tasks };
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    return { success: false, error: "Failed to fetch tasks", tasks: [] };
  }
}

/**
 * Create a new task
 */
export async function createTask(params: CreateTaskParams) {
  const user = await requireRole([ROLE.CEO, ROLE.ADMIN, ROLE.STAFF]);

  try {
    const task = await db.todo.create({
      data: {
        title: params.title,
        description: params.description,
        priority: params.priority || "MEDIUM",
        assignedToId: params.assignedToId,
        dueDate: params.dueDate,
        createdById: user.id,
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

    // Create activity
    await createActivity({
      type: "SYSTEM_ALERT",
      title: "New task created",
      description: params.title,
      userId: user.id,
      entityType: "Task",
      entityId: task.id,
    });

    revalidatePath("/admin/tasks");
    return { success: true, task };
  } catch (error) {
    console.error("Failed to create task:", error);
    return { success: false, error: "Failed to create task" };
  }
}

/**
 * Update task status
 */
export async function updateTaskStatus(taskId: string, status: TaskStatus) {
  const user = await requireRole([ROLE.CEO, ROLE.ADMIN, ROLE.STAFF, ROLE.DESIGNER, ROLE.DEV]);

  try {
    const task = await db.todo.update({
      where: { id: taskId },
      data: {
        status,
        ...(status === "DONE" && { completedAt: new Date() }),
      },
    });

    // Create activity if task is completed
    if (status === "DONE") {
      await createActivity({
        type: "TASK_COMPLETED",
        title: "Task completed",
        description: task.title,
        userId: user.id,
        entityType: "Task",
        entityId: taskId,
      });
    }

    revalidatePath("/admin/tasks");
    return { success: true, task };
  } catch (error) {
    console.error("Failed to update task status:", error);
    return { success: false, error: "Failed to update task status" };
  }
}

/**
 * Assign task to user
 */
export async function assignTask(taskId: string, userId: string) {
  await requireRole([ROLE.CEO, ROLE.ADMIN, ROLE.STAFF]);

  try {
    const task = await db.todo.update({
      where: { id: taskId },
      data: {
        assignedToId: userId,
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

    revalidatePath("/admin/tasks");
    return { success: true, task };
  } catch (error) {
    console.error("Failed to assign task:", error);
    return { success: false, error: "Failed to assign task" };
  }
}

/**
 * Delete a task
 */
export async function deleteTask(taskId: string) {
  await requireRole([ROLE.CEO, ROLE.ADMIN, ROLE.STAFF]);

  try {
    await db.todo.delete({
      where: { id: taskId },
    });

    revalidatePath("/admin/tasks");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete task:", error);
    return { success: false, error: "Failed to delete task" };
  }
}

/**
 * Get task statistics
 */
export async function getTaskStats() {
  await requireRole([ROLE.CEO, ROLE.ADMIN, ROLE.STAFF, ROLE.DESIGNER, ROLE.DEV]);

  try {
    const [total, todo, inProgress, done, overdue] = await Promise.all([
      db.todo.count(),
      db.todo.count({ where: { status: "TODO" } }),
      db.todo.count({ where: { status: "IN_PROGRESS" } }),
      db.todo.count({ where: { status: "DONE" } }),
      db.todo.count({
        where: {
          status: { not: "DONE" },
          dueDate: { lt: new Date() },
        },
      }),
    ]);

    return {
      success: true,
      stats: { total, todo, inProgress, done, overdue },
    };
  } catch (error) {
    console.error("Failed to fetch task stats:", error);
    return {
      success: false,
      error: "Failed to fetch task stats",
      stats: { total: 0, todo: 0, inProgress: 0, done: 0, overdue: 0 },
    };
  }
}
