"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/requireRole";
import { revalidatePath } from "next/cache";
import { GoalStatus, GoalPriority } from "@prisma/client";

export async function getGoals() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const goals = await prisma.goal.findMany({
      include: {
        owner: {
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
      orderBy: {
        targetDate: "asc",
      },
    });

    return { success: true, goals };
  } catch (error) {
    console.error("Error fetching goals:", error);
    return { success: false, error: "Failed to fetch goals" };
  }
}

export async function getTeamMembers() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const teamMembers = await prisma.user.findMany({
      where: {
        role: {
          in: ["CEO", "CFO", "FRONTEND", "BACKEND", "OUTREACH"],
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return { success: true, teamMembers };
  } catch (error) {
    console.error("Error fetching team members:", error);
    return { success: false, error: "Failed to fetch team members" };
  }
}

export async function createGoal(data: {
  title: string;
  description?: string;
  status: GoalStatus;
  priority: GoalPriority;
  category?: string;
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  startDate: Date;
  targetDate: Date;
  ownerId: string;
  teamMembers?: string[];
  notes?: string;
}) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const goal = await prisma.goal.create({
      data: {
        ...data,
        createdById: user.id,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    revalidatePath("/admin/goals");
    return { success: true, goal };
  } catch (error) {
    console.error("Error creating goal:", error);
    return { success: false, error: "Failed to create goal" };
  }
}

export async function updateGoal(
  id: string,
  data: {
    title?: string;
    description?: string;
    status?: GoalStatus;
    priority?: GoalPriority;
    category?: string;
    targetValue?: number;
    currentValue?: number;
    unit?: string;
    startDate?: Date;
    targetDate?: Date;
    ownerId?: string;
    teamMembers?: string[];
    notes?: string;
    completedAt?: Date | null;
  }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const goal = await prisma.goal.update({
      where: { id },
      data,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    revalidatePath("/admin/goals");
    return { success: true, goal };
  } catch (error) {
    console.error("Error updating goal:", error);
    return { success: false, error: "Failed to update goal" };
  }
}

export async function deleteGoal(id: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.goal.delete({
      where: { id },
    });

    revalidatePath("/admin/goals");
    return { success: true };
  } catch (error) {
    console.error("Error deleting goal:", error);
    return { success: false, error: "Failed to delete goal" };
  }
}
