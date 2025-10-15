"use client";

import Link from "next/link";
import { CLIENT_LINKS } from "@/features/client/navLinks";
import { SidebarLink } from "@/features/client/SidebarLink";

interface ClientSidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default function ClientSidebar({ user }: ClientSidebarProps) {
  return (
    <aside className="fixed left-0 z-30 w-64 bg-black/20 backdrop-blur-xl border-r border-white/10 hidden lg:block" style={{ top: 'var(--nav-h)', bottom: 0 }}>
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <Link href="/client" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className="text-xl font-bold text-white">SeeZee</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {CLIENT_LINKS.map((link) => (
            <SidebarLink key={link.href} {...link} />
          ))}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-white/10">
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
