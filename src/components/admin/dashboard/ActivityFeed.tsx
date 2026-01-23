"use client";

import { motion } from "framer-motion";
import {
  FiCheckCircle,
  FiDollarSign,
  FiFolder,
  FiMessageSquare,
  FiUser,
  FiActivity,
} from "react-icons/fi";

export interface ActivityItem {
  id: string;
  type?: string | null;
  message: string;
  timestamp: string | Date;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
}

const iconMap: Record<string, { icon: JSX.Element; bgClass: string }> = {
  project_created: { 
    icon: <FiFolder className="h-3.5 w-3.5 text-sky-400" />,
    bgClass: "bg-sky-500/10"
  },
  payment_received: { 
    icon: <FiDollarSign className="h-3.5 w-3.5 text-emerald-400" />,
    bgClass: "bg-emerald-500/10"
  },
  milestone_completed: { 
    icon: <FiCheckCircle className="h-3.5 w-3.5 text-violet-400" />,
    bgClass: "bg-violet-500/10"
  },
  request_created: { 
    icon: <FiMessageSquare className="h-3.5 w-3.5 text-amber-400" />,
    bgClass: "bg-amber-500/10"
  },
  client_added: { 
    icon: <FiUser className="h-3.5 w-3.5 text-violet-400" />,
    bgClass: "bg-violet-500/10"
  },
};

const defaultIcon = {
  icon: <FiActivity className="h-3.5 w-3.5 text-sky-400" />,
  bgClass: "bg-sky-500/10"
};

function relativeTime(timestamp: string | Date) {
  const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
  if (Number.isNaN(date.getTime())) return "Just now";

  const diff = Date.now() - date.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < hour) {
    const minutes = Math.max(1, Math.floor(diff / minute));
    return `${minutes}m ago`;
  }

  if (diff < day) {
    const hours = Math.max(1, Math.floor(diff / hour));
    return `${hours}h ago`;
  }

  const days = Math.max(1, Math.floor(diff / day));
  return `${days}d ago`;
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-slate-900/50 backdrop-blur-xl p-5 transition-all duration-300 hover:border-white/[0.12]">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-sky-500/10">
          <FiActivity className="h-4 w-4 text-sky-400" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-white">Recent Activity</h3>
          <p className="text-xs text-slate-500">Latest updates across your workspace</p>
        </div>
      </div>
      <div className="space-y-2">
        {activities.length > 0 ? (
          activities.map((activity, index) => {
            const iconConfig = iconMap[activity.type ?? ""] ?? defaultIcon;
            
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ x: 2 }}
                className="flex items-start gap-3 rounded-lg border border-white/[0.04] bg-white/[0.02] p-3 transition-all duration-200 hover:border-white/[0.08] hover:bg-white/[0.04]"
              >
                <div className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md ${iconConfig.bgClass}`}>
                  {iconConfig.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-white leading-relaxed">{activity.message}</p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    {relativeTime(activity.timestamp)}
                  </p>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="rounded-lg border border-dashed border-white/[0.08] bg-white/[0.02] p-8 text-center">
            <p className="text-sm text-slate-400">No recent activity</p>
            <p className="text-xs text-slate-500 mt-1">Activity will show up here as you work</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ActivityFeed;
