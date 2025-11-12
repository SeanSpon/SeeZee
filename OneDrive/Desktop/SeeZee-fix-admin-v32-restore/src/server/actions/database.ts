"use server";

/**
 * Server actions for Database Browser
 * Lightweight admin data browser for inspecting database tables
 */

import { db } from "@/server/db";
import { requireRole } from "@/lib/permissions";

/**
 * List all available database models
 */
export async function listModels() {
  await requireRole("CFO"); // CEO role is higher than ADMIN, so CEO can access
  
  return {
    success: true,
    models: [
      "user",
      "project",
      "lead",
      "task",
      "activity",
      "maintenanceSchedule",
      "learningResource",
      "tool",
      "link",
    ],
  };
}

/**
 * Query a specific database model
 * @param model - The name of the Prisma model to query
 * @param limit - Maximum number of records to return
 */
export async function query(model: string, limit = 50) {
  await requireRole("CFO");
  
  try {
    // Type-safe model access
    const validModels = [
      "user",
      "project",
      "lead",
      "task",
      "activity",
      "maintenanceSchedule",
      "learningResource",
      "tool",
      "link",
    ];
    
    if (!validModels.includes(model)) {
      return { success: false, error: "Invalid model", data: [] };
    }
    
    // @ts-ignore - Dynamic model access
    const data = await db[model].findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
    });
    
    return { success: true, data };
  } catch (error) {
    console.error(`Failed to query ${model}:`, error);
    return { success: false, error: `Failed to query ${model}`, data: [] };
  }
}

/**
 * Get count of records in a model
 * @param model - The name of the Prisma model
 */
export async function getModelCount(model: string) {
  await requireRole("CFO");
  
  try {
    // @ts-ignore - Dynamic model access
    const count = await db[model].count();
    return { success: true, count };
  } catch (error) {
    console.error(`Failed to count ${model}:`, error);
    return { success: false, count: 0 };
  }
}
