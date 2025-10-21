/**
 * CEO Dashboard Layout
 * Exclusive executive control center with royal purple/blue accent
 */

import "@/styles/admin.css";
import { requireRole } from "@/lib/auth/requireRole";
import { ROLE } from "@/lib/role";
import { CEOSidebar } from "@/components/ceo/CEOSidebar";
import { CommandPalette } from "@/components/admin/CommandPalette";
import { NotificationsProvider } from "@/providers/NotificationsProvider";
import { CommandPaletteProvider } from "@/providers/CommandPaletteProvider";

export default async function CEOLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // CEO-only access
  const user = await requireRole([ROLE.CEO]);

  return (
    <NotificationsProvider>
      <CommandPaletteProvider>
        <div className="with-sidebar fixed inset-0 flex flex-col">
          <div className="flex flex-1 overflow-hidden" style={{ marginTop: 'var(--h-nav)' }}>
            {/* CEO Sidebar with royal accent */}
            <aside className="sidebar-layer hidden md:block fixed left-0" style={{ top: 'var(--h-nav)' }}>
              <CEOSidebar userRole={user.role} />
            </aside>

            {/* Content area */}
            <main className="admin-main flex-1 overflow-y-auto">
              <div className="main-inner px-6 py-8">
                {children}
              </div>
            </main>
          </div>

          <CommandPalette />
        </div>
      </CommandPaletteProvider>
    </NotificationsProvider>
  );
}
