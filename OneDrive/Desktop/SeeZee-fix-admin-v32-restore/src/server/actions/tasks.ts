"use server";

/**
 * Server actions for Task management
 */

import { db } from "@/server/db";
import { requireRole } from "@/lib/auth/requireRole";
import { ROLE } from "@/lib/role";
import { revalidatePath } from "next/cache";
import { createActivity } from "./activity";
import { TodoStatus, TodoPriority } from "@prisma/client";

// Type aliases for backward compatibility
export type TaskStatus = TodoStatus;
export type TaskPriority = TodoPriority;

interface CreateTaskParams {
  title: string;
  description?: string;
  priority?: TodoPriority;
  assignedToId?: string;
  dueDate?: Date;
}

/**
 * Get all tasks - defaults to current user's tasks unless assignedToId is explicitly set
 */
export async function getTasks(filter?: {
  status?: TaskStatus;
  assignedToId?: string;
}) {
  const user = await requireRole([ROLE.CEO, ROLE.ADMIN, ROLE.STAFF, ROLE.DESIGNER, ROLE.DEV]);

  try {
    const where: any = {};

    // Default to current user's tasks if no assignedToId filter is provided
    if (filter?.assignedToId !== undefined) {
      // Explicit filter (can be null to get unassigned tasks)
      if (filter.assignedToId !== null) {
        where.assignedToId = filter.assignedToId;
      }
    } else {
      // Default: show only tasks assigned to current user
      where.assignedToId = user.id;
    }

    if (filter?.status) {
      where.status = filter.status;
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
        priority: params.priority || TodoPriority.MEDIUM,
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
        ...(status === TodoStatus.DONE && { completedAt: new Date() }),
      },
    });

    // Create activity if task is completed
    if (status === TodoStatus.DONE) {
      await createActivity({
        type: "TASK_COMPLETED",
        title: "Task completed",
        description: task.title,
        userId: user.id,
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
  const user = await requireRole([ROLE.CEO, ROLE.ADMIN, ROLE.STAFF, ROLE.DESIGNER, ROLE.DEV]);

  try {
    // Filter tasks assigned to the current user
    const baseFilter = { assignedToId: user.id };

    const [total, todo, inProgress, done, overdue] = await Promise.all([
      db.todo.count({ where: baseFilter }),
      db.todo.count({ where: { ...baseFilter, status: TodoStatus.TODO } }),
      db.todo.count({ where: { ...baseFilter, status: TodoStatus.IN_PROGRESS } }),
      db.todo.count({ where: { ...baseFilter, status: TodoStatus.DONE } }),
      db.todo.count({
        where: {
          ...baseFilter,
          status: { not: TodoStatus.DONE },
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

/**
 * Bulk update task status
 */
export async function bulkUpdateTaskStatus(taskIds: string[], status: TaskStatus) {
  await requireRole([ROLE.CEO, ROLE.ADMIN, ROLE.STAFF]);

  try {
    const result = await db.todo.updateMany({
      where: {
        id: { in: taskIds },
      },
      data: {
        status,
        ...(status === TodoStatus.DONE && { completedAt: new Date() }),
      },
    });

    revalidatePath("/admin/tasks");
    return { success: true, count: result.count };
  } catch (error) {
    console.error("Failed to bulk update tasks:", error);
    return { success: false, error: "Failed to bulk update tasks", count: 0 };
  }
}

/**
 * Bulk assign tasks to a user
 */
export async function bulkAssignTasks(taskIds: string[], assignedToId: string | null) {
  await requireRole([ROLE.CEO, ROLE.ADMIN, ROLE.STAFF]);

  try {
    const result = await db.todo.updateMany({
      where: {
        id: { in: taskIds },
      },
      data: {
        assignedToId,
      },
    });

    revalidatePath("/admin/tasks");
    return { success: true, count: result.count };
  } catch (error) {
    console.error("Failed to bulk assign tasks:", error);
    return { success: false, error: "Failed to bulk assign tasks", count: 0 };
  }
}

/**
 * Bulk delete tasks
 */
export async function bulkDeleteTasks(taskIds: string[]) {
  await requireRole([ROLE.CEO, ROLE.ADMIN]);

  try {
    const result = await db.todo.deleteMany({
      where: {
        id: { in: taskIds },
      },
    });

    revalidatePath("/admin/tasks");
    return { success: true, count: result.count };
  } catch (error) {
    console.error("Failed to bulk delete tasks:", error);
    return { success: false, error: "Failed to bulk delete tasks", count: 0 };
  }
}
