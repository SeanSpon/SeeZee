interface KpiCardProps {
  title: string;
  value: string | number;
  icon: string;
  trend?: string;
}

export default function KpiCard({ title, value, icon, trend }: KpiCardProps) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div className="text-3xl opacity-80">{icon}</div>
        {trend && (
          <span className={`stat-trend ${trend.startsWith("+") ? "positive" : "negative"}`}>
            {trend}
          </span>
        )}
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{title}</div>
    </div>
  );
}
