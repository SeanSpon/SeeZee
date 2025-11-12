"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { feedHelpers } from "@/lib/feed/emit";

/**
 * Create a new milestone for a project
 */
export async function createMilestone(data: {
  projectId: string;
  title: string;
  description?: string;
  dueDate?: Date;
}) {
  const session = await auth();

  if (!session?.user || !["CEO", "CFO"].includes(session.user.role || "")) {
    throw new Error("Unauthorized");
  }

  try {
    const milestone = await prisma.projectMilestone.create({
      data: {
        projectId: data.projectId,
        title: data.title,
        description: data.description,
        dueDate: data.dueDate,
        completed: false,
      },
    });

    revalidatePath(`/admin/pipeline/projects/${data.projectId}`);
    revalidatePath(`/client/projects/${data.projectId}`);

    return { success: true, milestone };
  } catch (error) {
    console.error("[createMilestone] Error:", error);
    throw error;
  }
}

/**
 * Toggle milestone completion status
 */
export async function toggleMilestone(milestoneId: string) {
  const session = await auth();

  if (!session?.user || !["CEO", "CFO"].includes(session.user.role || "")) {
    throw new Error("Unauthorized");
  }

  try {
    const milestone = await prisma.projectMilestone.findUnique({
      where: { id: milestoneId },
      include: { project: { select: { id: true } } },
    });

    if (!milestone) {
      throw new Error("Milestone not found");
    }

    const updated = await prisma.projectMilestone.update({
      where: { id: milestoneId },
      data: {
        completed: !milestone.completed,
        completedAt: !milestone.completed ? new Date() : null,
      },
    });

    // Emit feed event if completing
    if (updated.completed) {
      await feedHelpers.paymentSucceeded(milestone.project.id, 0, milestone.title);
    }

    revalidatePath(`/admin/pipeline/projects/${milestone.project.id}`);
    revalidatePath(`/client/projects/${milestone.project.id}`);

    return { success: true, milestone: updated };
  } catch (error) {
    console.error("[toggleMilestone] Error:", error);
    throw error;
  }
}

/**
 * Delete a milestone
 */
export async function deleteMilestone(milestoneId: string) {
  const session = await auth();

  if (!session?.user || !["CEO", "CFO"].includes(session.user.role || "")) {
    throw new Error("Unauthorized");
  }

  try {
    const milestone = await prisma.projectMilestone.findUnique({
      where: { id: milestoneId },
      include: { project: { select: { id: true } } },
    });

    if (!milestone) {
      throw new Error("Milestone not found");
    }

    await prisma.projectMilestone.delete({
      where: { id: milestoneId },
    });

    revalidatePath(`/admin/pipeline/projects/${milestone.project.id}`);
    revalidatePath(`/client/projects/${milestone.project.id}`);

    return { success: true };
  } catch (error) {
    console.error("[deleteMilestone] Error:", error);
    throw error;
  }
}
