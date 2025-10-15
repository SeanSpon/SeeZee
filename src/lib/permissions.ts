/**
 * Role-based access control utilities
 */

import { auth } from "@/auth";

export type Role = "CEO" | "ADMIN" | "STAFF" | "DESIGNER" | "DEV" | "CLIENT";

export const roleOrder: Role[] = ["CLIENT", "DEV", "DESIGNER", "STAFF", "ADMIN", "CEO"];

/**
 * Require a minimum role level for an action
 * @throws Error if user is not authenticated or lacks permission
 */
export async function requireRole(min: Role) {
  const session = await auth();
  if (!session?.user?.role) throw new Error("Unauthorized");
  
  const userRoleIndex = roleOrder.indexOf(session.user.role as Role);
  const minRoleIndex = roleOrder.indexOf(min);
  
  const ok = userRoleIndex >= minRoleIndex;
  if (!ok) throw new Error("Forbidden");
  
  return session.user;
}

/**
 * Check if user has a specific role or higher
 */
export async function hasRole(min: Role): Promise<boolean> {
  try {
    await requireRole(min);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get current user session
 */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}
