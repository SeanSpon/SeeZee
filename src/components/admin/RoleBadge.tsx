"use client";

/**
 * Role Badge component with gradient and glow
 */

import { getRoleDisplay, getRoleGradient, type Role } from "@/lib/role";

interface RoleBadgeProps {
  role: Role;
  size?: "sm" | "md" | "lg";
}

export function RoleBadge({ role, size = "md" }: RoleBadgeProps) {
  const gradient = getRoleGradient(role);
  const display = getRoleDisplay(role);

  const sizeClasses = {
    sm: "text-[10px] px-2 py-0.5",
    md: "text-xs px-3 py-1",
    lg: "text-sm px-4 py-1.5",
  };

  return (
    <div
      className={`
        inline-flex items-center gap-1.5 rounded-full font-semibold
        bg-gradient-to-r ${gradient}
        ${sizeClasses[size]}
      `}
    >
      <span className="relative z-10 text-white drop-shadow-sm">
        {display}
      </span>
    </div>
  );
}
