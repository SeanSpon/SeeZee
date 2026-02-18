/**
 * Admin Layout - SeeZee Studio Branded Admin Layout
 * Provides consistent layout for all admin pages with AdminAppShell
 * Includes Git integration provider for GitHub API access throughout admin
 * Supports switching between sidebar, explorer, and dashboard nav modes
 */

import { getCurrentUser } from "@/lib/auth/requireRole";
import { ROLE } from "@/lib/role";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminAppShell } from "@/components/admin/AdminAppShell";
import { AdminExplorerShell } from "@/components/admin/explorer/AdminExplorerShell";
import { NavigationProvider } from "@/providers/NavigationProvider";
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

  // Read user's nav preference from DB
  const prefs = await prisma.userPreferences.findUnique({
    where: { userId: user.id },
    select: { adminNavMode: true, folderClickMode: true },
  });
  const navMode = (prefs?.adminNavMode as "sidebar" | "explorer" | "dashboard") ?? "sidebar";
  const clickMode = (prefs?.folderClickMode as "zoom" | "list" | "tabs") ?? "zoom";

  // Choose shell based on nav mode
  const shell =
    navMode === "sidebar" ? (
      <AdminAppShell user={user}>{children}</AdminAppShell>
    ) : (
      <AdminExplorerShell user={user}>{children}</AdminExplorerShell>
    );

  return (
    <NotificationsProvider>
      <GitProvider>
        <NavigationProvider initialNavMode={navMode} initialClickMode={clickMode}>
          {shell}
        </NavigationProvider>
      </GitProvider>
    </NotificationsProvider>
  );
}
