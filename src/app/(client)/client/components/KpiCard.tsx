interface KpiCardProps {
  title: string;
  value: string | number;
  icon: string;
  trend?: string;
}

export default function KpiCard({ title, value, icon, trend }: KpiCardProps) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:border-cyan-500/30 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="text-3xl">{icon}</div>
        {trend && (
          <span
            className={`text-xs font-semibold px-2 py-1 rounded ${
              trend.startsWith("+")
                ? "bg-green-500/20 text-green-300"
                : "bg-red-500/20 text-red-300"
            }`}
          >
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-sm text-slate-400 mb-2">{title}</h3>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}
