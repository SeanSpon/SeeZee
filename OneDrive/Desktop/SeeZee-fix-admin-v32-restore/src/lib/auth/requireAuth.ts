import { redirect } from "next/navigation";
import { auth } from "@/auth";

/**
 * Require authentication for server components and route handlers
 * Redirects to /login if not authenticated
 * Returns the session if authenticated
 * 
 * @example
 * ```ts
 * // In a server component or route handler
 * const session = await requireAuth();
 * // session.user.id, session.user.email, etc. are now available
 * ```
 */
export async function requireAuth() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return session;
}



