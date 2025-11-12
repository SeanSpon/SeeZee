"use client";

import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import Link from "next/link";

interface ClientEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
    onClick?: () => void;
  };
}

export function ClientEmptyState({ icon: Icon, title, description, action }: ClientEmptyStateProps) {
  return (
    <div className="seezee-glass p-12 text-center rounded-2xl">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
        <Icon className="w-8 h-8 text-white/20" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-white/60 mb-6 max-w-md mx-auto">{description}</p>
      {action && (
        action.href ? (
          <Link href={action.href}>
            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
              {action.label}
            </button>
          </Link>
        ) : action.onClick ? (
          <button
            onClick={action.onClick}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            {action.label}
          </button>
        ) : null
      )}
    </div>
  );
}

