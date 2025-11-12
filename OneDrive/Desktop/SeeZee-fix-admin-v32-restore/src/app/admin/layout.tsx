/**
 * Admin Layout - SeeZee Studio Branded Admin Layout
 * Provides consistent layout for all admin pages
 */

import { requireRole } from "@/lib/auth/requireRole";
import { ROLE } from "@/lib/role";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check auth at layout level to prevent any rendering before redirect
  // Allow CEO, CFO, and all staff roles (FRONTEND, BACKEND, OUTREACH)
  await requireRole([
    ROLE.CEO,
    ROLE.CFO,
    ROLE.FRONTEND,
    ROLE.BACKEND,
    ROLE.OUTREACH,
  ]);

  // Render children - each page will handle its own layout (AdminAppShell, etc.)
  return <>{children}</>;
}
