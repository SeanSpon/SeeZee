/**
 * Server-side role-based access control utilities
 */

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import type { Role } from "@/lib/role";

export interface CurrentUser {
  id: string;
  name: string | null;
  email: string | null;
  role: Role;
  image?: string | null;
}

/**
 * Get current authenticated user with role
 * Server-side only
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await auth();
  
  if (!session?.user) {
    return null;
  }

  return {
    id: session.user.id || "",
    name: session.user.name || null,
    email: session.user.email || null,
    role: (session.user.role as Role) || "CLIENT",
    image: session.user.image || null,
  };
}

/**
 * Require user to have one of the specified roles
 * Redirects to /login if not authenticated
 * Redirects to /unauthorized if authenticated but wrong role
 * 
 * @example
 * ```ts
 * // In a server component or route handler
 * const user = await requireRole(['CEO', 'ADMIN']);
 * ```
 */
export async function requireRole(
  allowedRoles: Role[]
): Promise<CurrentUser> {
  const user = await getCurrentUser();

  // Not authenticated
  if (!user) {
    redirect("/login");
  }

  // Wrong role
  if (!allowedRoles.includes(user.role)) {
    redirect("/unauthorized");
  }

  return user;
}

/**
 * Check if current user has role (non-throwing version)
 * Returns null if not authenticated or wrong role
 */
export async function checkRole(
  allowedRoles: Role[]
): Promise<CurrentUser | null> {
  const user = await getCurrentUser();
  
  if (!user || !allowedRoles.includes(user.role)) {
    return null;
  }

  return user;
}
