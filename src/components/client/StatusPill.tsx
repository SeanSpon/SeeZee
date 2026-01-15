/**
 * StatusPill - Unified status badge component
 * Premium agency-style status indicators with color logic
 */

export function StatusPill({ status }: { status: string }) {
  const statusMap: Record<string, string> = {
    PLANNING: "bg-blue-500/15 text-blue-300 border-blue-300/20",
    LEAD: "bg-slate-500/15 text-slate-300 border-slate-300/20",
    PAID: "bg-emerald-500/15 text-emerald-300 border-emerald-300/20",
    ACTIVE: "bg-cyan-500/15 text-cyan-300 border-cyan-300/20",
    DESIGN: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-300/20",
    BUILD: "bg-violet-500/15 text-violet-300 border-violet-300/20",
    IN_PROGRESS: "bg-cyan-500/15 text-cyan-300 border-cyan-300/20",
    REVIEW: "bg-amber-500/15 text-amber-300 border-amber-300/20",
    LAUNCH: "bg-emerald-500/15 text-emerald-300 border-emerald-300/20",
    COMPLETED: "bg-emerald-600/20 text-emerald-300 border-emerald-300/25",
    ON_HOLD: "bg-slate-500/15 text-slate-300 border-slate-300/20",
    CANCELLED: "bg-red-500/15 text-red-300 border-red-300/20",
  };

  const className = statusMap[status] ?? "bg-white/10 text-white/70 border-white/10";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${className}`}
    >
      {status}
    </span>
  );
}
