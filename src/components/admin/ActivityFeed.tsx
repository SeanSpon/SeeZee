"use client";

/**
 * Activity Feed component for dashboard
 */

import { motion } from "framer-motion";
import { formatRelativeTime } from "@/lib/ui";

interface ActivityItem {
  id: string;
  type: "lead" | "project" | "invoice" | "task" | "maintenance" | "system";
  title: string;
  description: string;
  timestamp: Date;
  user?: {
    name: string;
    avatar?: string;
  };
}

interface ActivityFeedProps {
  items: ActivityItem[];
  maxItems?: number;
}

const typeColors = {
  lead: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  project: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  invoice: "bg-green-500/20 text-green-400 border-green-500/30",
  task: "bg-teal-500/20 text-teal-400 border-teal-500/30",
  maintenance: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  system: "bg-slate-500/20 text-slate-400 border-slate-500/30",
};

const typeIcons = {
  lead: "👤",
  project: "📁",
  invoice: "💰",
  task: "✓",
  maintenance: "🔧",
  system: "⚙️",
};

export function ActivityFeed({ items, maxItems = 10 }: ActivityFeedProps) {
  const displayItems = items.slice(0, maxItems);

  return (
    <div className="space-y-3">
      {displayItems.map((item, idx) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.05, duration: 0.3 }}
          className="
            flex items-start gap-4 p-4 rounded-lg
            bg-slate-900/30 border border-white/5
            hover:bg-slate-900/50 hover:border-white/10
            transition-all duration-200
          "
        >
          {/* Icon */}
          <div
            className={`
              flex-shrink-0 w-10 h-10 rounded-lg
              flex items-center justify-center
              text-lg border
              ${typeColors[item.type]}
            `}
          >
            {typeIcons[item.type]}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white">
              {item.title}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              {item.description}
            </p>
            <div className="flex items-center gap-2 mt-2">
              {item.user && (
                <>
                  {item.user.avatar ? (
                    <img
                      src={item.user.avatar}
                      alt={item.user.name}
                      className="w-4 h-4 rounded-full"
                    />
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-slate-700 flex items-center justify-center text-[8px] text-slate-300">
                      {item.user.name[0]}
                    </div>
                  )}
                  <span className="text-xs text-slate-500">
                    {item.user.name}
                  </span>
                  <span className="text-xs text-slate-600">•</span>
                </>
              )}
              <span className="text-xs text-slate-500">
                {formatRelativeTime(item.timestamp)}
              </span>
            </div>
          </div>
        </motion.div>
      ))}

      {items.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          No recent activity
        </div>
      )}
    </div>
  );
}
