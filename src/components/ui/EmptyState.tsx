"use client";

import { LucideIcon } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-8 mb-6">
        <Icon className="w-16 h-16 text-slate-400 mx-auto" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-center max-w-md mb-6">{description}</p>
      {action && (
        <Link
          href={action.href}
          className="px-6 py-3 rounded-xl bg-[#ef4444] hover:bg-[#dc2626] text-white font-medium transition-all shadow-lg"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}









