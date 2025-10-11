"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
// import { TodoStatus, TodoPriority } from "@prisma/client";

type TodoStatus = "TODO" | "IN_PROGRESS" | "DONE";
type TodoPriority = "LOW" | "MEDIUM" | "HIGH";

interface CreateTodoData {
  title: string;
  description?: string;
  priority?: TodoPriority;
  assignedToId?: string;
  dueDate?: Date;
}

export async function createTask(data: CreateTodoData) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      throw new Error("Unauthorized");
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true }
    });

    if (!user || !["ADMIN", "STAFF"].includes(user.role)) {
      throw new Error("Only admins and staff can create tasks");
    }

    // TODO: Uncomment after migration
    // const task = await prisma.todo.create({
    //   data: {
    //     title: data.title,
    //     description: data.description,
    //     priority: data.priority || "MEDIUM",
    //     status: "TODO",
    //     createdById: user.id,
    //     assignedToId: data.assignedToId,
    //     dueDate: data.dueDate,
    //   },
    //   include: {
    //     assignedTo: {
    //       select: {
    //         id: true,
    //         name: true,
    //         email: true,
    //       }
    //     }
    //   }
    // });

    revalidatePath("/admin/tasks");

    return {
      success: true,
      // task,
    };
  } catch (error) {
    console.error("Error creating task:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create task",
    };
  }
}

export async function updateTaskStatus(taskId: string, status: TodoStatus) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      throw new Error("Unauthorized");
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) {
      throw new Error("User not found");
    }

    // TODO: Uncomment after migration
    // const task = await prisma.todo.update({
    //   where: { id: taskId },
    //   data: {
    //     status,
    //     completedAt: status === "DONE" ? new Date() : null,
    //   },
    //   include: {
    //     assignedTo: {
    //       select: {
    //         id: true,
    //         name: true,
    //         email: true,
    //       }
    //     }
    //   }
    // });

    revalidatePath("/admin/tasks");

    return {
      success: true,
      // task,
    };
  } catch (error) {
    console.error("Error updating task status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update task status",
    };
  }
}

export async function assignTask(taskId: string, userId: string | null) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      throw new Error("Unauthorized");
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true }
    });

    if (!user || !["ADMIN", "STAFF"].includes(user.role)) {
      throw new Error("Only admins and staff can assign tasks");
    }

    // TODO: Uncomment after migration
    // const task = await prisma.todo.update({
    //   where: { id: taskId },
    //   data: {
    //     assignedToId: userId,
    //   },
    //   include: {
    //     assignedTo: {
    //       select: {
    //         id: true,
    //         name: true,
    //         email: true,
    //       }
    //     }
    //   }
    // });

    revalidatePath("/admin/tasks");

    return {
      success: true,
      // task,
    };
  } catch (error) {
    console.error("Error assigning task:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to assign task",
    };
  }
}

export async function deleteTask(taskId: string) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      throw new Error("Unauthorized");
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true }
    });

    if (!user || user.role !== "ADMIN") {
      throw new Error("Only admins can delete tasks");
    }

    // TODO: Uncomment after migration
    // await prisma.todo.delete({
    //   where: { id: taskId },
    // });

    revalidatePath("/admin/tasks");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting task:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete task",
    };
  }
}
