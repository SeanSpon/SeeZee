"use server";

/**
 * Server actions for Team Management
 */

import { db } from "@/server/db";
import { requireRole } from "@/lib/permissions";
import { revalidateTag } from "next/cache";
import { tags } from "@/lib/tags";

/**
 * List all team members
 */
export async function listTeam() {
  await requireRole("STAFF");
  
  try {
    const users = await db.user.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    return { success: true, users };
  } catch (error) {
    console.error("Failed to list team:", error);
    return { success: false, error: "Failed to load team", users: [] };
  }
}

/**
 * Update a user's role
 * @param userId - ID of the user to update
 * @param role - New role to assign
 */
export async function updateRole(userId: string, role: string) {
  await requireRole("ADMIN");
  
  try {
    const user = await db.user.update({
      where: { id: userId },
      data: { role },
    });
    
    tags.team.forEach(revalidateTag);
    
    return { success: true, user };
  } catch (error) {
    console.error("Failed to update role:", error);
    return { success: false, error: "Failed to update user role" };
  }
}

/**
 * Get user by ID
 * @param userId - ID of the user to fetch
 */
export async function getUserById(userId: string) {
  await requireRole("STAFF");
  
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    if (!user) {
      return { success: false, error: "User not found" };
    }
    
    return { success: true, user };
  } catch (error) {
    console.error("Failed to get user:", error);
    return { success: false, error: "Failed to load user" };
  }
}
