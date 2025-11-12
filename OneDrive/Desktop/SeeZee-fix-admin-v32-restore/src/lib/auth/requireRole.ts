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
 * Map Prisma UserRole to Role type
 * Handles legacy roles (ADMIN, STAFF, DEV, DESIGNER) and maps them appropriately
 */
function mapUserRoleToRole(userRole: string | null | undefined): Role {
  if (!userRole) return "CLIENT";
  
  const role = userRole.toUpperCase();
  
  // Direct matches
  if (["CEO", "CFO", "FRONTEND", "BACKEND", "OUTREACH", "CLIENT"].includes(role)) {
    return role as Role;
  }
  
  // Map legacy roles
  if (role === "ADMIN" || role === "STAFF") {
    // ADMIN/STAFF can access admin dashboard - map to CEO for now
    // TODO: Consider creating ADMIN role in Role type
    return "CEO";
  }
  
  if (role === "DEV") {
    // DEV maps to BACKEND
    return "BACKEND";
  }
  
  if (role === "DESIGNER") {
    // DESIGNER maps to FRONTEND
    return "FRONTEND";
  }
  
  // Default to CLIENT for unknown roles
  return "CLIENT";
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

  const mappedRole = mapUserRoleToRole(session.user.role as string);

  return {
    id: session.user.id || "",
    name: session.user.name || null,
    email: session.user.email || null,
    role: mappedRole,
    image: session.user.image || null,
  };
}

/**
 * Require user to have one of the specified roles
 * Redirects to /login if not authenticated
 * Redirects to appropriate dashboard based on user role if authenticated but wrong role
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

  // CEO email always has access - bypass role check for admin routes
  const CEO_EMAIL = "seanspm1007@gmail.com";
  if (user.email === CEO_EMAIL || user.email === "seanpm1007@gmail.com") {
    // If accessing admin routes, allow access
    if (allowedRoles.includes("CEO") || 
        allowedRoles.includes("CFO") || 
        allowedRoles.includes("FRONTEND") || 
        allowedRoles.includes("BACKEND") || 
        allowedRoles.includes("OUTREACH")) {
      // Return user with CEO role for admin access
      return {
        ...user,
        role: "CEO" as Role,
      };
    }
  }

  // Wrong role - redirect to appropriate dashboard based on user's role
  if (!allowedRoles.includes(user.role)) {
    // Admin roles (CEO, CFO, FRONTEND, BACKEND, OUTREACH) go to admin dashboard
    if (user.role === "CEO" || user.role === "CFO" || 
        user.role === "FRONTEND" || user.role === "BACKEND" || user.role === "OUTREACH") {
      redirect("/admin");
    } else {
      // CLIENT role goes to client dashboard
      redirect("/client");
    }
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
