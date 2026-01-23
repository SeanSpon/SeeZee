/**
 * Admin Layout - SeeZee Studio Branded Admin Layout
 * Provides consistent layout for all admin pages with AdminAppShell
 * Includes Git integration provider for GitHub API access throughout admin
 */

import { getCurrentUser } from "@/lib/auth/requireRole";
import { ROLE } from "@/lib/role";
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
  
  // Allow anyone who isn't a CLIENT (CEO, CFO, FRONTEND, BACKEND, OUTREACH)
  const allowedRoles = [ROLE.CEO, ROLE.CFO, ROLE.FRONTEND, ROLE.BACKEND, ROLE.OUTREACH];
  if (!allowedRoles.includes(user.role as any)) {
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
