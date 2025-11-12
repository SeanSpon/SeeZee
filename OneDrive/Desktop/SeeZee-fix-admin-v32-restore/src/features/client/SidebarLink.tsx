"use client";

import Link from "next/link";
import { useActivePath } from "@/hooks/useActivePath";
import { LucideIcon } from "lucide-react";

interface SidebarLinkProps {
  href: string;
  label: string;
  icon: LucideIcon;
}

export function SidebarLink({ href, label, icon: Icon }: SidebarLinkProps) {
  const pathname = useActivePath();
  
  // Exact match for /client, prefix match for others
  const isActive = pathname === href || (href !== "/client" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      data-active={isActive ? "true" : "false"}
      className="group flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium
                 transition-[color,background-color] duration-150 ease-in-out
                 text-slate-300 hover:text-white hover:bg-white/5
                 data-[active=true]:text-white data-[active=true]:bg-gradient-to-r data-[active=true]:from-blue-500/20 data-[active=true]:to-purple-500/20
                 data-[active=true]:border data-[active=true]:border-blue-500/30
                 data-[active=true]:shadow-lg data-[active=true]:shadow-blue-500/10"
    >
      <Icon className="w-5 h-5 opacity-80 group-hover:opacity-100 transition-opacity duration-150" />
      <span>{label}</span>
    </Link>
  );
}
