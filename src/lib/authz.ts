/**
 * Authorization utilities for See-Zee
 * Provides role-based access control helpers
 */
import { auth } from "@/auth";
import { redirect } from "next/navigation";

/**
 * Require authenticated user, throw if not logged in
 * @throws Error if user is not authenticated
 * @returns The authenticated session
 */
export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized: You must be logged in to access this resource");
  }
  return session;
}

/**
 * Require admin role (CEO or ADMIN), throw if not authorized
 * @throws Error if user is not an admin
 * @returns The authenticated admin session
 */
export async function requireAdmin() {
  const session = await requireUser();
  const user = session.user as any;
  
  // Check if user has admin role
  if (user.role !== "CEO" && user.role !== "ADMIN") {
    throw new Error("Forbidden: Admin access required");
  }
  
  return session;
}

/**
 * Require staff member (any non-CLIENT role), throw if not authorized
 * @throws Error if user is not staff
 * @returns The authenticated staff session
 */
export async function requireStaff() {
  const session = await requireUser();
  const user = session.user as any;
  
  // Check if user is staff
  if (user.accountType !== "STAFF") {
    throw new Error("Forbidden: Staff access required");
  }
  
  return session;
}

/**
 * Check if current user is admin (non-throwing)
 * @returns true if user is admin, false otherwise
 */
export async function isAdmin(): Promise<boolean> {
  try {
    await requireAdmin();
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if current user is staff (non-throwing)
 * @returns true if user is staff, false otherwise
 */
export async function isStaff(): Promise<boolean> {
  try {
    await requireStaff();
    return true;
  } catch {
    return false;
  }
}

/**
 * Redirect to login if not authenticated
 * Use in server components/actions
 */
export async function redirectIfNotAuthenticated(returnUrl?: string) {
  const session = await auth();
  if (!session?.user?.id) {
    const url = returnUrl ? `/login?returnUrl=${encodeURIComponent(returnUrl)}` : "/login";
    redirect(url);
  }
  return session;
}

/**
 * Redirect to home if not admin
 * Use in admin pages
 */
export async function redirectIfNotAdmin() {
  try {
    return await requireAdmin();
  } catch {
    redirect("/");
  }
}
