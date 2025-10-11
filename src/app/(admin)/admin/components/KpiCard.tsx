import { ReactNode } from "react";

export default function KpiCard({ title, value, hint, icon }: { title: string; value: string | number; hint?: string; icon?: ReactNode }) {
  return (
    <div className="backdrop-blur-xl bg-white/[0.08] border border-white/10 rounded-2xl p-6 shadow-2xl h-32 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <div className="text-white/70 text-sm font-medium">{title}</div>
        {icon && <div className="text-white/40">{icon}</div>}
      </div>
      <div className="space-y-1">
        <div className="text-3xl font-light text-white">{value}</div>
        {hint && <div className="text-xs text-white/50">{hint}</div>}
      </div>
    </div>
  );
}