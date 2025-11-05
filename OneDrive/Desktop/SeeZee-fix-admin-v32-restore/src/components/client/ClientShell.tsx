/**
 * ClientShell - Premium client dashboard layout matching admin/CEO style
 * Fixed sidebar + main content area with consistent glass morphism
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { Home, FolderKanban, FileText, MessageSquare, Settings, Plus, CreditCard } from "lucide-react";

const NAV_ITEMS = [
  { href: "/client/overview", label: "Overview", icon: Home },
  { href: "/client/projects", label: "Projects", icon: FolderKanban },
  { href: "/client/invoices", label: "Invoices", icon: CreditCard },
  { href: "/client/files", label: "Files", icon: FileText },
  { href: "/client/requests", label: "Requests", icon: MessageSquare },
];

export default function ClientShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="fixed inset-0 flex flex-col" style={{ top: 'var(--h-nav)' }}>
      <div className="flex flex-1 overflow-hidden">
        {/* Fixed Sidebar - Desktop Only */}
        <aside 
          className="sidebar-layer hidden md:block fixed left-0 seezee-glass border-r border-white/10 w-64"
          style={{ top: 'var(--h-nav)', height: 'calc(100vh - var(--h-nav))' }}
        >
          <div className="flex flex-col h-full p-6">
            {/* Logo - Clean and simple */}
            <div className="flex items-center gap-3 mb-8">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <span className="text-xl font-bold text-white">Z</span>
              </div>
              <div>
                <div className="font-bold text-white text-base">SeeZee</div>
                <div className="text-xs text-white/50">Client Portal</div>
              </div>
            </div>

            {/* Navigation - Clean and simple */}
            <nav className="space-y-1 flex-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link key={item.href} href={item.href}>
                    <div
                      className={`
                        flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200
                        ${
                          isActive
                            ? "bg-blue-500/20 text-white border-l-2 border-blue-400"
                            : "text-white/60 hover:bg-white/5 hover:text-white"
                        }
                      `}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                  </Link>
                );
              })}
              
              <div className="h-px bg-white/10 my-4" />
              
              <Link href="/start">
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-white border border-blue-400/30 transition-all duration-200">
                  <Plus className="w-5 h-5" />
                  <span className="text-sm font-semibold">Start Project</span>
                </div>
              </Link>
            </nav>

            {/* Settings at bottom */}
            <div className="border-t border-white/10 pt-4">
              <Link href="/client/settings">
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 text-white/60 hover:bg-white/5 hover:text-white">
                  <Settings className="w-5 h-5" />
                  <span className="text-sm font-medium">Settings</span>
                </div>
              </Link>
            </div>
          </div>
        </aside>

        {/* Main content area */}
        <main className="admin-main flex-1 overflow-y-auto md:ml-64">
          <div className="main-inner px-4 sm:px-6 py-6 sm:py-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
