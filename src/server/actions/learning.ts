"use server";

/**
 * Server actions for Learning Hub (resources, tools, documentation)
 */

import { db } from "@/server/db";
import { requireRole } from "@/lib/auth/requireRole";
import { ROLE } from "@/lib/role";
import { revalidatePath } from "next/cache";

interface CreateResourceParams {
  title: string;
  description?: string;
  type: string;
  url: string;
  category?: string;
  thumbnailUrl?: string;
  duration?: number;
  difficulty?: string;
  tags?: string[];
}

interface CreateToolParams {
  name: string;
  description?: string;
  url: string;
  category: string;
  logoUrl?: string;
  pricing?: string;
  tags?: string[];
}

/**
 * Get all learning resources
 */
export async function getLearningResources(filter?: {
  type?: string;
  category?: string;
  search?: string;
}) {
  await requireRole([ROLE.CEO, ROLE.CFO, ROLE.FRONTEND, ROLE.BACKEND, ROLE.OUTREACH]);

  try {
    const where: any = {};

    if (filter?.type) {
      where.type = filter.type;
    }

    if (filter?.category) {
      where.category = filter.category;
    }

    if (filter?.search) {
      where.OR = [
        { title: { contains: filter.search, mode: "insensitive" } },
        { description: { contains: filter.search, mode: "insensitive" } },
      ];
    }

    const resources = await db.learningResource.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, resources };
  } catch (error) {
    console.error("Failed to fetch learning resources:", error);
    return { success: false, error: "Failed to fetch learning resources", resources: [] };
  }
}

/**
 * Create a learning resource
 */
export async function createLearningResource(params: CreateResourceParams) {
  await requireRole([ROLE.CEO, ROLE.CFO, ROLE.FRONTEND, ROLE.BACKEND, ROLE.OUTREACH]);

  try {
    const resource = await db.learningResource.create({
      data: {
        title: params.title,
        description: params.description,
        type: params.type,
        url: params.url,
        category: params.category,
        thumbnailUrl: params.thumbnailUrl,
        duration: params.duration,
        difficulty: params.difficulty,
        tags: params.tags || [],
      },
    });

    revalidatePath("/admin/learning/resources");
    return { success: true, resource };
  } catch (error) {
    console.error("Failed to create learning resource:", error);
    return { success: false, error: "Failed to create learning resource" };
  }
}

/**
 * Get all tools
 */
export async function getTools(filter?: { category?: string; search?: string }) {
  await requireRole([ROLE.CEO, ROLE.CFO, ROLE.FRONTEND, ROLE.BACKEND, ROLE.OUTREACH]);

  try {
    const where: any = {};

    if (filter?.category) {
      where.category = filter.category;
    }

    if (filter?.search) {
      where.OR = [
        { name: { contains: filter.search, mode: "insensitive" } },
        { description: { contains: filter.search, mode: "insensitive" } },
      ];
    }

    const tools = await db.tool.findMany({
      where,
      orderBy: {
        name: "asc",
      },
    });

    return { success: true, tools };
  } catch (error) {
    console.error("Failed to fetch tools:", error);
    return { success: false, error: "Failed to fetch tools", tools: [] };
  }
}

/**
 * Create a tool entry
 */
export async function createTool(params: CreateToolParams) {
  await requireRole([ROLE.CEO, ROLE.CFO, ROLE.FRONTEND, ROLE.BACKEND, ROLE.OUTREACH]);

  try {
    const tool = await db.tool.create({
      data: {
        name: params.name,
        description: params.description,
        url: params.url,
        category: params.category,
        logoUrl: params.logoUrl,
        pricing: params.pricing,
        tags: params.tags || [],
      },
    });

    revalidatePath("/admin/learning/tools");
    return { success: true, tool };
  } catch (error) {
    console.error("Failed to create tool:", error);
    return { success: false, error: "Failed to create tool" };
  }
}

/**
 * Delete a learning resource
 */
export async function deleteLearningResource(resourceId: string) {
  await requireRole([ROLE.CEO, ROLE.CFO]);

  try {
    await db.learningResource.delete({
      where: { id: resourceId },
    });

    revalidatePath("/admin/learning/resources");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete learning resource:", error);
    return { success: false, error: "Failed to delete learning resource" };
  }
}

/**
 * Delete a tool
 */
export async function deleteTool(toolId: string) {
  await requireRole([ROLE.CEO, ROLE.CFO]);

  try {
    await db.tool.delete({
      where: { id: toolId },
    });

    revalidatePath("/admin/learning/tools");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete tool:", error);
    return { success: false, error: "Failed to delete tool" };
  }
}

/**
 * Get assignments for a specific user with training details and completion status
 */
export async function getMyAssignments(userId: string) {
  await requireRole([ROLE.CEO, ROLE.CFO, ROLE.FRONTEND, ROLE.BACKEND, ROLE.OUTREACH]);

  try {
    // Find all assignments for this user (direct or by role)
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      return { success: false, error: "User not found", assignments: [] };
    }

    const assignments = await db.assignment.findMany({
      where: {
        OR: [
          { audienceType: "USER", userId },
          { audienceType: "ROLE", role: user.role },
        ],
      },
      include: {
        training: {
          select: {
            id: true,
            title: true,
            type: true,
            description: true,
            url: true,
            tags: true,
          },
        },
        completions: {
          where: { userId },
          select: {
            id: true,
            status: true,
            startedAt: true,
            completedAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const mapped = assignments.map((a) => {
      const comp = a.completions[0] || null;
      return {
        id: a.id,
        training: a.training,
        dueAt: a.dueAt?.toISOString() || null,
        createdAt: a.createdAt.toISOString(),
        completion: comp
          ? {
              id: comp.id,
              status: comp.status,
              startedAt: comp.startedAt?.toISOString() || null,
              completedAt: comp.completedAt?.toISOString() || null,
            }
          : null,
      };
    });

    return { success: true, assignments: mapped };
  } catch (error) {
    console.error("Failed to fetch user assignments:", error);
    return { success: false, error: "Failed to fetch assignments", assignments: [] };
  }
}

/**
 * Update a completion record status (mark started/complete)
 */
export async function updateCompletionStatus(
  assignmentId: string,
  userId: string,
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETE"
) {
  await requireRole([ROLE.CEO, ROLE.CFO, ROLE.FRONTEND, ROLE.BACKEND, ROLE.OUTREACH]);

  try {
    const now = new Date();
    const data: any = { status };

    if (status === "IN_PROGRESS") {
      data.startedAt = now;
    } else if (status === "COMPLETE") {
      data.completedAt = now;
    }

    // Upsert: create completion if it doesn't exist, update if it does
    const completion = await db.completion.upsert({
      where: {
        assignmentId_userId: {
          assignmentId,
          userId,
        },
      },
      create: {
        assignmentId,
        userId,
        status,
        startedAt: status === "IN_PROGRESS" || status === "COMPLETE" ? now : null,
        completedAt: status === "COMPLETE" ? now : null,
      },
      update: data,
    });

    revalidatePath("/admin/learning");
    return { success: true, completion };
  } catch (error) {
    console.error("Failed to update completion status:", error);
    return { success: false, error: "Failed to update status" };
  }
}

/**
 * CEO: Create an onboarding path for a tool with steps
 */
export async function createOnboardingPath(
  toolId: string,
  title: string,
  description: string | null,
  steps: { trainingId: string; order: number; isRequired: boolean }[]
) {
  await requireRole([ROLE.CEO]);

  try {
    const path = await db.onboardingPath.create({
      data: {
        toolId,
        title,
        description,
        steps: {
          create: steps.map((s) => ({
            trainingId: s.trainingId,
            order: s.order,
            isRequired: s.isRequired,
          })),
        },
      },
      include: {
        steps: {
          include: {
            training: {
              select: { id: true, title: true, type: true },
            },
          },
          orderBy: { order: "asc" },
        },
      },
    });

    revalidatePath("/admin/learning");
    return { success: true, path };
  } catch (error) {
    console.error("Failed to create onboarding path:", error);
    return { success: false, error: "Failed to create onboarding path" };
  }
}

/**
 * Get tools with their onboarding paths
 */
export async function getToolsWithOnboarding() {
  await requireRole([ROLE.CEO, ROLE.CFO, ROLE.FRONTEND, ROLE.BACKEND, ROLE.OUTREACH]);

  try {
    const tools = await db.tool.findMany({
      include: {
        onboardingPath: {
          include: {
            steps: {
              include: {
                training: {
                  select: { id: true, title: true, type: true },
                },
              },
              orderBy: { order: "asc" },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return { success: true, tools };
  } catch (error) {
    console.error("Failed to fetch tools with onboarding:", error);
    return { success: false, error: "Failed to fetch tools", tools: [] };
  }
}
