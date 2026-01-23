"use client";

import { motion } from "framer-motion";
import {
  FiAlertCircle,
  FiDollarSign,
  FiFolder,
  FiUsers,
  FiTrendingUp,
  FiTrendingDown,
} from "react-icons/fi";

export interface AdminStats {
  activeProjects?: number;
  totalRevenue?: number;
  totalClients?: number;
  unpaidInvoices?: number;
  thisMonthRevenue?: number;
  thisMonthExpenses?: number;
  netProfit?: number;
}

interface StatsCardsProps {
  stats: AdminStats;
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function StatsCards({ stats }: StatsCardsProps) {
  // Convert Decimal to number safely
  const revenueValue = stats.totalRevenue 
    ? (typeof stats.totalRevenue === 'number' 
        ? stats.totalRevenue 
        : Number(stats.totalRevenue) || 0)
    : 0;

  const cards = [
    {
      label: "Active Projects",
      value: stats.activeProjects ?? 0,
      Icon: FiFolder,
      iconBgClass: "bg-sky-500/10",
      iconTextClass: "text-sky-400",
      trend: "+2",
      trendUp: true,
    },
    {
      label: "Total Revenue",
      value: currencyFormatter.format(revenueValue),
      Icon: FiDollarSign,
      iconBgClass: "bg-emerald-500/10",
      iconTextClass: "text-emerald-400",
      trend: "+23%",
      trendUp: true,
    },
    {
      label: "Total Clients",
      value: stats.totalClients ?? 0,
      Icon: FiUsers,
      iconBgClass: "bg-violet-500/10",
      iconTextClass: "text-violet-400",
      trend: "+5",
      trendUp: true,
    },
    {
      label: "Unpaid Invoices",
      value: stats.unpaidInvoices ?? 0,
      Icon: FiAlertCircle,
      iconBgClass: "bg-amber-500/10",
      iconTextClass: "text-amber-400",
      trend: (stats.unpaidInvoices ?? 0) > 0 ? "Action needed" : "All clear",
      trendUp: (stats.unpaidInvoices ?? 0) === 0,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ label, value, Icon, iconBgClass, iconTextClass, trend, trendUp }, index) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.08, duration: 0.4, ease: "easeOut" }}
          whileHover={{ y: -2 }}
          className={`
            relative overflow-hidden rounded-xl 
            border border-white/[0.08]
            bg-gradient-to-br from-slate-900/90 to-slate-950/90
            backdrop-blur-xl 
            p-5 
            transition-all duration-300 
            hover:border-white/[0.15]
            hover:shadow-lg hover:shadow-black/20
            group
          `}
        >
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
          
          {/* Content */}
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBgClass} transition-all duration-300 group-hover:scale-105`}>
                <Icon className={`h-5 w-5 ${iconTextClass}`} />
              </div>
              {/* Trend indicator */}
              <div className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-md ${
                trendUp 
                  ? "bg-emerald-500/10 text-emerald-400" 
                  : "bg-amber-500/10 text-amber-400"
              }`}>
                {trendUp ? (
                  <FiTrendingUp className="h-3 w-3" />
                ) : (
                  <FiTrendingDown className="h-3 w-3" />
                )}
                <span>{trend}</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-2xl lg:text-3xl font-semibold text-white tracking-tight">{value}</p>
              <p className="text-xs text-slate-400 uppercase tracking-[0.15em] font-medium">{label}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default StatsCards;
