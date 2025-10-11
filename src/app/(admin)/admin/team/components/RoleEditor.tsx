"use client";

import { useState, useTransition } from "react";
import { UserRole } from "@prisma/client";
import { Shield, Check } from "lucide-react";

interface RoleEditorProps {
  userId: string;
  currentRole: UserRole;
  userName: string;
  isCEO: boolean;
}

const roleLabels: Record<UserRole, string> = {
  ADMIN: "Admin",
  STAFF: "Staff",
  CLIENT: "Client",
};

const roleColors: Record<UserRole, string> = {
  ADMIN: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  STAFF: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  CLIENT: "bg-slate-500/20 text-slate-300 border-slate-500/30",
};

export default function RoleEditor({ userId, currentRole, userName, isCEO }: RoleEditorProps) {
  const [role, setRole] = useState<UserRole>(currentRole);
  const [isPending, startTransition] = useTransition();
  const [showSuccess, setShowSuccess] = useState(false);

  const handleRoleChange = async (newRole: UserRole) => {
    if (newRole === role) return;

    setRole(newRole);

    startTransition(async () => {
      try {
        const response = await fetch("/api/admin/team/role", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            role: newRole,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to update role");
        }

        // Show success indicator
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);

        // Refresh the page data
        window.location.reload();
      } catch (error) {
        console.error("Error updating role:", error);
        alert(error instanceof Error ? error.message : "Failed to update role");
        // Revert on error
        setRole(currentRole);
      }
    });
  };

  // CEO users can't edit roles
  if (!isCEO) {
    return (
      <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${roleColors[role]}`}>
        {roleLabels[role]}
      </span>
    );
  }

  return (
    <div className="relative">
      <select
        value={role}
        onChange={(e) => handleRoleChange(e.target.value as UserRole)}
        disabled={isPending}
        className={`
          px-3 py-1 rounded-lg text-xs font-semibold border
          bg-white/5 backdrop-blur-xl cursor-pointer
          hover:bg-white/10 transition-all
          disabled:opacity-50 disabled:cursor-not-allowed
          ${roleColors[role]}
        `}
      >
        {Object.entries(roleLabels).map(([value, label]) => (
          <option key={value} value={value} className="bg-slate-800 text-white">
            {label}
          </option>
        ))}
      </select>

      {/* Success indicator */}
      {showSuccess && (
        <div className="absolute -right-8 top-1/2 -translate-y-1/2">
          <div className="bg-green-500/20 border border-green-500/30 rounded-full p-1">
            <Check size={12} className="text-green-400" />
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {isPending && (
        <div className="absolute inset-0 bg-white/5 backdrop-blur-sm rounded-lg flex items-center justify-center">
          <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
