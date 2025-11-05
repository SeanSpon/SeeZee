"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FolderKanban,
  TrendingUp,
  MessageSquare,
  Github,
  FileText,
  Upload,
  HelpCircle,
  Settings,
  Receipt,
} from "lucide-react";

interface ClientSidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

const navItems = [
  {
    label: "Overview",
    href: "/client",
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    label: "Projects",
    href: "/client/projects",
    icon: <FolderKanban className="w-5 h-5" />,
  },
  {
    label: "Files",
    href: "/client/files",
    icon: <Upload className="w-5 h-5" />,
  },
  {
    label: "Requests",
    href: "/client/requests",
    icon: <HelpCircle className="w-5 h-5" />,
  },
  {
    label: "Settings",
    href: "/client/settings",
    icon: <Settings className="w-5 h-5" />,
  },
];

export default function ClientSidebar({ user }: ClientSidebarProps) {
  const pathname = usePathname();
  
  // Generate breadcrumbs from pathname
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = segments.map((segment) => 
    segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
  );
  const pageTitle = breadcrumbs.slice(-1)[0] || "Dashboard";

  const isActive = (href: string) => {
    if (href === "/client") return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside
      className="
        w-full h-full border-r border-white/5
        bg-slate-950/80 backdrop-blur-xl
        ring-1 ring-cyan-500/10
        flex flex-col
      "
    >
      {/* Page Title Breadcrumb - Top of Sidebar (Fixed) */}
      <div className="flex-shrink-0 px-4 pt-4 pb-3 border-b border-white/5 bg-slate-950/90">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
          {breadcrumbs.map((crumb, idx) => (
            <span key={idx} className="flex items-center gap-1.5">
              {idx > 0 && <span>/</span>}
              <span>{crumb}</span>
            </span>
          ))}
        </div>
        <h2 className="text-lg font-bold text-white">{pageTitle}</h2>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-thin scrollbar-thumb-cyan-500/50 scrollbar-track-transparent">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                relative flex items-center gap-3 px-3 py-2 rounded-lg
                text-sm font-medium
                transition-all duration-200
                ${
                  active
                    ? "bg-white/10 text-white shadow-lg"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }
              `}
            >
              {active && (
                <motion.div
                  layoutId="client-sidebar-active"
                  className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg"
                  transition={{ duration: 0.3 }}
                />
              )}
              <span className="relative z-10">{item.icon}</span>
              <span className="relative z-10 flex-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="flex-shrink-0 p-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer">
          <img
            src={user.image || "/default-avatar.png"}
            alt={user.name || "User"}
            className="w-9 h-9 rounded-full border-2 border-cyan-500/30"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user.name}
            </p>
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
