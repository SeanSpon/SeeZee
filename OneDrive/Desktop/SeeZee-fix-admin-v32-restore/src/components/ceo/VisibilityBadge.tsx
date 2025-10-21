"use client";

interface VisibilityBadgeProps {
  visibility: "INTERNAL" | "PUBLIC" | "CLIENT";
  size?: "sm" | "md";
}

export default function VisibilityBadge({ visibility, size = "md" }: VisibilityBadgeProps) {
  const sizeClasses = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-2 py-1";

  const colorClasses = {
    INTERNAL: "bg-slate-700 text-slate-300",
    PUBLIC: "bg-green-500/20 text-green-300 border border-green-500/30",
    CLIENT: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
  };

  return (
    <span className={`inline-block rounded font-medium ${sizeClasses} ${colorClasses[visibility]}`}>
      {visibility}
    </span>
  );
}
