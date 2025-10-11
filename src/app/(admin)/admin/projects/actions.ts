"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ProjectStatus } from "@prisma/client";

export async function updateProjectStatus(projectId: string, status: ProjectStatus) {
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
      throw new Error("Only admins and staff can update project status");
    }

    const project = await prisma.project.update({
      where: { id: projectId },
      data: {
        status,
        endDate: status === "COMPLETED" ? new Date() : undefined,
      },
    });

    revalidatePath("/admin/projects");
    revalidatePath("/admin/overview");

    return {
      success: true,
      project,
    };
  } catch (error) {
    console.error("Error updating project status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update project status",
    };
  }
}

export async function assignProject(projectId: string, userId: string | null) {
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
      throw new Error("Only admins can assign projects");
    }

    const project = await prisma.project.update({
      where: { id: projectId },
      data: {
        assigneeId: userId,
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    revalidatePath("/admin/projects");

    return {
      success: true,
      project,
    };
  } catch (error) {
    console.error("Error assigning project:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to assign project",
    };
  }
}
