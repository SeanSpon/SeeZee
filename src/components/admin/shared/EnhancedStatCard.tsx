"use client";

import { IconType } from "react-icons";
import { motion } from "framer-motion";
import { FiTrendingUp, FiTrendingDown } from "react-icons/fi";

interface EnhancedStatCardProps {
  label: string;
  value: string | number;
  icon: IconType;
  iconColor?: string;
  iconBgColor?: string;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onClick?: () => void;
  variant?: "default" | "primary" | "success" | "info" | "warning";
}

// Consistent color variants for stat cards
const CARD_VARIANTS = {
  default: {
    iconColor: "text-slate-300",
    iconBgColor: "bg-slate-500/10",
    borderHover: "hover:border-slate-500/30",
  },
  primary: {
    iconColor: "text-sky-400",
    iconBgColor: "bg-sky-500/10",
    borderHover: "hover:border-sky-500/30",
  },
  success: {
    iconColor: "text-emerald-400",
    iconBgColor: "bg-emerald-500/10",
    borderHover: "hover:border-emerald-500/30",
  },
  info: {
    iconColor: "text-violet-400",
    iconBgColor: "bg-violet-500/10",
    borderHover: "hover:border-violet-500/30",
  },
  warning: {
    iconColor: "text-amber-400",
    iconBgColor: "bg-amber-500/10",
    borderHover: "hover:border-amber-500/30",
  },
};

export function EnhancedStatCard({
  label,
  value,
  icon: Icon,
  iconColor,
  iconBgColor,
  subtitle,
  trend,
  onClick,
  variant = "default",
}: EnhancedStatCardProps) {
  const CardWrapper = onClick ? motion.button : motion.div;
  const variantStyles = CARD_VARIANTS[variant];
  
  // Use provided colors or fall back to variant colors
  const finalIconColor = iconColor || variantStyles.iconColor;
  const finalIconBgColor = iconBgColor || variantStyles.iconBgColor;

  return (
    <CardWrapper
      whileHover={{ y: -2 }}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={`
        relative overflow-hidden
        rounded-xl 
        border border-white/[0.08]
        bg-gradient-to-br from-slate-900/90 to-slate-950/90
        backdrop-blur-xl 
        p-5 
        text-white 
        hover:border-white/[0.15]
        transition-all duration-300 
        group 
        hover:shadow-lg hover:shadow-black/20
        text-left 
        w-full
        ${variantStyles.borderHover}
      `}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-10 h-10 ${finalIconBgColor} rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-105`}>
            <Icon className={`w-5 h-5 ${finalIconColor}`} />
          </div>
          {trend && (
            <div
              className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-md ${
                trend.isPositive 
                  ? "text-emerald-400 bg-emerald-500/10" 
                  : "text-rose-400 bg-rose-500/10"
              }`}
            >
              {trend.isPositive ? (
                <FiTrendingUp className="w-3 h-3" />
              ) : (
                <FiTrendingDown className="w-3 h-3" />
              )}
              {trend.isPositive ? "+" : ""}
              {trend.value}%
            </div>
          )}
        </div>
        <div>
          <p className="text-2xl lg:text-3xl font-semibold text-white mb-1 tracking-tight">
            {value}
          </p>
          <p className="text-xs uppercase tracking-[0.15em] text-slate-400 font-medium">
            {label}
          </p>
          {subtitle && <p className="text-[11px] text-slate-500 mt-1.5">{subtitle}</p>}
        </div>
      </div>
    </CardWrapper>
  );
}
