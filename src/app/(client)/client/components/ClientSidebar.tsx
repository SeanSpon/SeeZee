"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  TrendingUp,
  MessageSquare,
  Github,
  FileText,
  FileCheck,
  Settings,
  HelpCircle,
} from "lucide-react";

interface ClientSidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

const navItems = [
  { href: "/client", icon: LayoutDashboard, label: "Overview" },
  { href: "/client/projects", icon: FolderKanban, label: "Projects" },
  { href: "/client/progress", icon: TrendingUp, label: "Progress" },
  { href: "/client/messages", icon: MessageSquare, label: "Messages" },
  { href: "/client/github", icon: Github, label: "GitHub Activity" },
  { href: "/client/invoices", icon: FileText, label: "Invoices" },
  { href: "/client/files", icon: FileCheck, label: "Files & Assets" },
  { href: "/client/requests", icon: FileCheck, label: "Requests" },
  { href: "/client/settings", icon: Settings, label: "Settings" },
  { href: "/client/support", icon: HelpCircle, label: "Support" },
];

export default function ClientSidebar({ user }: ClientSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 w-64 bg-slate-900/80 backdrop-blur-xl border-r border-white/5 hidden lg:block">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6 border-b border-white/5">
          <Link href="/client" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className="text-xl font-bold text-white">SeeZee</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                  ${
                    isActive
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/5">
            <img
              src={user.image || "/default-avatar.png"}
              alt={user.name || "User"}
              className="w-10 h-10 rounded-full border-2 border-cyan-500/30"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user.name}
              </p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
