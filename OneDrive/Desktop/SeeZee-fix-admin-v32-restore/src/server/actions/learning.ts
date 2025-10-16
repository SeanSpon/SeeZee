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
  await requireRole([ROLE.CEO, ROLE.ADMIN, ROLE.STAFF, ROLE.DESIGNER, ROLE.DEV]);

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
  await requireRole([ROLE.CEO, ROLE.ADMIN, ROLE.STAFF]);

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
  await requireRole([ROLE.CEO, ROLE.ADMIN, ROLE.STAFF, ROLE.DESIGNER, ROLE.DEV]);

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
  await requireRole([ROLE.CEO, ROLE.ADMIN, ROLE.STAFF]);

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
  await requireRole([ROLE.CEO, ROLE.ADMIN]);

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
  await requireRole([ROLE.CEO, ROLE.ADMIN]);

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
