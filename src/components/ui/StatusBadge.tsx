"use client";

import clsx from "clsx";

// Consistent, refined color palette for status badges
// Using a cohesive set of colors that work well together
const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  // Positive states - Emerald green
  completed: {
    label: "Completed",
    className: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  },
  paid: {
    label: "Paid",
    className: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  },
  paid_status: {
    label: "Paid",
    className: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  },
  published: {
    label: "Published",
    className: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  },
  on_track: {
    label: "On Track",
    className: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  },
  "on track": {
    label: "On Track",
    className: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  },
  converted: {
    label: "Converted",
    className: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  },

  // Active/In-progress states - Sky blue
  active: {
    label: "Active",
    className: "border-sky-500/40 bg-sky-500/10 text-sky-400",
  },
  in_progress: {
    label: "In Progress",
    className: "border-sky-500/40 bg-sky-500/10 text-sky-400",
  },
  "in progress": {
    label: "In Progress",
    className: "border-sky-500/40 bg-sky-500/10 text-sky-400",
  },
  
  // Sent/Proposal states - Violet
  sent: {
    label: "Sent",
    className: "border-violet-500/40 bg-violet-500/10 text-violet-400",
  },
  proposal: {
    label: "Proposal",
    className: "border-violet-500/40 bg-violet-500/10 text-violet-400",
  },
  review: {
    label: "Review",
    className: "border-violet-500/40 bg-violet-500/10 text-violet-400",
  },
  scheduled: {
    label: "Scheduled",
    className: "border-violet-500/40 bg-violet-500/10 text-violet-400",
  },
  
  // Pending/Warning states - Amber
  pending: {
    label: "Pending",
    className: "border-amber-500/40 bg-amber-500/10 text-amber-400",
  },
  received: {
    label: "Received",
    className: "border-amber-500/40 bg-amber-500/10 text-amber-400",
  },
  at_risk: {
    label: "At Risk",
    className: "border-amber-500/40 bg-amber-500/10 text-amber-400",
  },
  "at risk": {
    label: "At Risk",
    className: "border-amber-500/40 bg-amber-500/10 text-amber-400",
  },
  deposit_paid: {
    label: "Deposit Paid",
    className: "border-amber-500/40 bg-amber-500/10 text-amber-400",
  },

  // Negative states - Rose
  unpaid: {
    label: "Unpaid",
    className: "border-rose-500/40 bg-rose-500/10 text-rose-400",
  },
  delayed: {
    label: "Delayed",
    className: "border-rose-500/40 bg-rose-500/10 text-rose-400",
  },
  overdue: {
    label: "Overdue",
    className: "border-rose-500/40 bg-rose-500/10 text-rose-400",
  },

  // Neutral states - Slate
  lead: {
    label: "Lead",
    className: "border-slate-500/40 bg-slate-500/10 text-slate-400",
  },
  draft: {
    label: "Draft",
    className: "border-slate-500/40 bg-slate-500/10 text-slate-400",
  },
  archived: {
    label: "Archived",
    className: "border-slate-500/40 bg-slate-500/10 text-slate-400",
  },
  not_started: {
    label: "Not Started",
    className: "border-slate-500/40 bg-slate-500/10 text-slate-400",
  },
  "not started": {
    label: "Not Started",
    className: "border-slate-500/40 bg-slate-500/10 text-slate-400",
  },
  cancelled: {
    label: "Cancelled",
    className: "border-slate-500/40 bg-slate-500/10 text-slate-400",
  },
};

const SIZE_MAP = {
  sm: "text-[10px] px-2 py-0.5 tracking-wide",
  md: "text-xs px-2.5 py-1 tracking-wide",
  lg: "text-sm px-3 py-1.5 tracking-wide",
} as const;

export interface StatusBadgeProps {
  status: string;
  size?: keyof typeof SIZE_MAP;
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const normalized = status?.toLowerCase?.().replace(/_/g, " ").replace(/ /g, "_") ?? "unknown";
  // Try both underscore and space versions
  const config = STATUS_STYLES[normalized] ?? 
    STATUS_STYLES[status?.toLowerCase?.()] ?? 
    STATUS_STYLES[status?.toLowerCase?.().replace(/_/g, " ")] ?? {
    label: status?.replace(/_/g, " ") || "Unknown",
    className: "border-slate-500/40 bg-slate-500/10 text-slate-400",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-md border font-semibold uppercase",
        config.className,
        SIZE_MAP[size],
      )}
    >
      {config.label}
    </span>
  );
}

export default StatusBadge;




















