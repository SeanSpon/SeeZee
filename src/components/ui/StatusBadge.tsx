"use client";

import clsx from "clsx";

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  // General statuses
  pending: {
    label: "Pending",
    className: "border-yellow-700 bg-yellow-900/30 text-yellow-300",
  },
  received: {
    label: "Received",
    className: "border-blue-700 bg-blue-900/30 text-blue-300",
  },
  in_progress: {
    label: "In Progress",
    className: "border-[#ef4444] bg-[#ef4444]/20 text-[#ef4444]",
  },
  "in progress": {
    label: "In Progress",
    className: "border-[#ef4444] bg-[#ef4444]/20 text-[#ef4444]",
  },
  completed: {
    label: "Completed",
    className: "border-green-700 bg-green-900/30 text-green-300",
  },
  paid: {
    label: "Paid",
    className: "border-green-700 bg-green-900/30 text-green-300",
  },
  unpaid: {
    label: "Unpaid",
    className: "border-red-700 bg-red-900/30 text-red-300",
  },
  lead: {
    label: "Lead",
    className: "border-slate-600 bg-slate-800/50 text-slate-300",
  },
  proposal: {
    label: "Proposal",
    className: "border-blue-700 bg-blue-900/30 text-blue-300",
  },
  paid_status: {
    label: "Paid",
    className: "border-green-700 bg-green-900/30 text-green-300",
  },
  active: {
    label: "Active",
    className: "border-[#ef4444] bg-[#ef4444]/20 text-[#ef4444]",
  },
  // Blog statuses
  draft: {
    label: "Draft",
    className: "border-slate-600 bg-slate-800/50 text-slate-300",
  },
  review: {
    label: "Review",
    className: "border-yellow-700 bg-yellow-900/30 text-yellow-300",
  },
  scheduled: {
    label: "Scheduled",
    className: "border-blue-700 bg-blue-900/30 text-blue-300",
  },
  published: {
    label: "Published",
    className: "border-green-700 bg-green-900/30 text-green-300",
  },
  archived: {
    label: "Archived",
    className: "border-slate-600 bg-slate-800/50 text-slate-300",
  },
  // Goal statuses
  not_started: {
    label: "Not Started",
    className: "border-slate-600 bg-slate-800/50 text-slate-300",
  },
  "not started": {
    label: "Not Started",
    className: "border-slate-600 bg-slate-800/50 text-slate-300",
  },
  on_track: {
    label: "On Track",
    className: "border-green-700 bg-green-900/30 text-green-300",
  },
  "on track": {
    label: "On Track",
    className: "border-green-700 bg-green-900/30 text-green-300",
  },
  at_risk: {
    label: "At Risk",
    className: "border-yellow-700 bg-yellow-900/30 text-yellow-300",
  },
  "at risk": {
    label: "At Risk",
    className: "border-yellow-700 bg-yellow-900/30 text-yellow-300",
  },
  delayed: {
    label: "Delayed",
    className: "border-red-700 bg-red-900/30 text-red-300",
  },
  cancelled: {
    label: "Cancelled",
    className: "border-slate-600 bg-slate-800/50 text-slate-300",
  },
};

const SIZE_MAP = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-3 py-1",
  lg: "text-base px-4 py-1.5",
} as const;

export interface StatusBadgeProps {
  status: string;
  size?: keyof typeof SIZE_MAP;
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const normalized = status?.toLowerCase?.() ?? "unknown";
  const config = STATUS_STYLES[normalized] ?? {
    label: status,
    className: "border-slate-600 bg-slate-800/50 text-slate-300",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border font-medium",
        config.className,
        SIZE_MAP[size],
      )}
    >
      {config.label}
    </span>
  );
}

export default StatusBadge;




















