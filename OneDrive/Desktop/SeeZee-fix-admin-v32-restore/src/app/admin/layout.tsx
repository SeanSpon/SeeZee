/**
 * Admin Layout with role-based access control
 */

import "@/styles/admin.css";
import { requireRole } from "@/lib/auth/requireRole";
import { ROLE } from "@/lib/role";
import { Sidebar } from "@/components/admin/Sidebar";
import { CommandPalette } from "@/components/admin/CommandPalette";
import { NotificationsProvider } from "@/providers/NotificationsProvider";
import { CommandPaletteProvider } from "@/providers/CommandPaletteProvider";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Require user to be CEO, ADMIN, STAFF, DESIGNER, or DEV
  const user = await requireRole([
    ROLE.CEO,
    ROLE.ADMIN,
    ROLE.STAFF,
    ROLE.DESIGNER,
    ROLE.DEV,
  ]);

  return (
    <NotificationsProvider>
      <CommandPaletteProvider>
        {/* Admin layout without topbar */}
        <div className="with-sidebar fixed inset-0 flex flex-col">
          <div className="flex flex-1 overflow-hidden" style={{ marginTop: 'var(--h-nav)' }}>
            {/* Sidebar pinned below navbar */}
            <aside className="sidebar-layer hidden md:block fixed left-0" style={{ top: 'var(--h-nav)' }}>
              <Sidebar userRole={user.role} />
            </aside>

            {/* Content shifted by sidebar width and pushed below navbar */}
            <main className="admin-main flex-1 overflow-y-auto">
              <div className="main-inner px-6 py-8">
                {children}
              </div>
            </main>
          </div>

          {/* Command Palette (global) */}
          <CommandPalette />
        </div>
      </CommandPaletteProvider>
    </NotificationsProvider>
  );
}
