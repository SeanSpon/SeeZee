"use client";

import { motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import type { NavGroup } from "@/lib/admin/nav-data";

interface TabsFolderViewProps {
  group: NavGroup;
}

export function TabsFolderView({ group }: TabsFolderViewProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <div className="mb-6 flex items-center gap-1 overflow-x-auto border-b border-slate-800 px-1 scrollbar-hide">
      {group.items.map((item) => {
        const active = isActive(item.href);
        return (
          <button
            key={item.href}
            onClick={() => router.push(item.href)}
            className={`relative flex items-center gap-2 whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors ${
              active ? "text-white" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <item.icon className="h-3.5 w-3.5" />
            {item.label}
            {active && (
              <motion.div
                layoutId="active-tab-underline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ef4444] rounded-full"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
