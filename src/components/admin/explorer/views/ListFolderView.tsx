"use client";

import { usePathname, useRouter } from "next/navigation";
import type { NavGroup } from "@/lib/admin/nav-data";

interface ListFolderViewProps {
  group: NavGroup;
}

export function ListFolderView({ group }: ListFolderViewProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
      {/* Group header */}
      <div className="flex items-center gap-2 border-b border-slate-800 px-4 py-3">
        <group.icon className="h-4 w-4" style={{ color: group.folderColor }} />
        <span className="text-sm font-medium text-white">{group.title}</span>
      </div>

      {/* Page list */}
      <div className="divide-y divide-slate-800/50">
        {group.items.map((item) => {
          const active = isActive(item.href);
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                active
                  ? "bg-[#ef4444]/10 border-l-2 border-[#ef4444]"
                  : "hover:bg-white/[0.03] border-l-2 border-transparent"
              }`}
            >
              <item.icon
                className={`h-4 w-4 flex-shrink-0 ${
                  active ? "text-[#ef4444]" : "text-slate-500"
                }`}
              />
              <div className="min-w-0">
                <p className={`text-sm font-medium ${active ? "text-white" : "text-slate-300"}`}>
                  {item.label}
                </p>
                {item.description && (
                  <p className="text-xs text-slate-500 truncate">{item.description}</p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
