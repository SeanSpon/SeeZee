"use client";

/**
 * Stat Card for KPIs with optional trend indicator
 */

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label: string;
  };
  delay?: number;
}

export function StatCard({ label, value, icon, trend, delay = 0 }: StatCardProps) {
  const trendPositive = trend && trend.value > 0;
  const trendNegative = trend && trend.value < 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="
        seezee-glass
        relative overflow-hidden
        p-6
        hover:border-[rgba(110,231,255,0.3)] hover:shadow-xl
        transition-all duration-300
      "
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

      <div className="relative z-10 flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-400 mb-1">{label}</p>
          <p className="text-3xl font-bold text-white">{value}</p>

          {trend && (
            <div
              className={`
                mt-2 flex items-center gap-1 text-xs font-medium
                ${trendPositive ? "text-green-400" : ""}
                ${trendNegative ? "text-red-400" : ""}
                ${!trendPositive && !trendNegative ? "text-slate-400" : ""}
              `}
            >
              {trendPositive && <TrendingUp className="w-3 h-3" />}
              {trendNegative && <TrendingDown className="w-3 h-3" />}
              <span>
                {trend.value > 0 ? "+" : ""}
                {trend.value}% {trend.label}
              </span>
            </div>
          )}
        </div>

        {icon && (
          <div className="flex-shrink-0 text-slate-400/60">
            {icon}
          </div>
        )}
      </div>
    </motion.div>
  );
}
