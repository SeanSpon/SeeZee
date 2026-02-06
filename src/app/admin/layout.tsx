/**
 * Admin Layout - SeeZee Studio Branded Admin Layout
 * Provides consistent layout for all admin pages with AdminAppShell
 * Includes Git integration provider for GitHub API access throughout admin
 */

import { getCurrentUser } from "@/lib/auth/requireRole";
import { isStaffRole } from "@/lib/role";
import { redirect } from "next/navigation";
import { AdminAppShell } from "@/components/admin/AdminAppShell";
import { NotificationsProvider } from "@/providers/NotificationsProvider";
import { GitProvider } from "@/lib/git/git-context";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  
  // Check auth at layout level to prevent any rendering before redirect
  if (!user) {
    redirect("/login");
  }
  
  // Allow all staff/admin roles (CEO, CFO, ADMIN, STAFF, FRONTEND, BACKEND, DESIGNER, DEV, OUTREACH, etc.)
  // CLIENT role is not allowed in admin area
  if (!isStaffRole(user.role)) {
    redirect("/no-access");
  }

  // Wrap all admin pages with AdminAppShell, NotificationsProvider, and GitProvider
  // GitProvider enables GitHub API integration across the entire admin dashboard
  return (
    <NotificationsProvider>
      <GitProvider>
        <AdminAppShell user={user}>
          {children}
        </AdminAppShell>
      </GitProvider>
    </NotificationsProvider>
  );
}
