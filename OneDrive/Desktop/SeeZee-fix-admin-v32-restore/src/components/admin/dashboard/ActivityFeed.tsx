"use client";

import { motion } from "framer-motion";
import {
  FiCheckCircle,
  FiDollarSign,
  FiFolder,
  FiMessageSquare,
  FiUser,
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

const iconMap: Record<string, JSX.Element> = {
  project_created: <FiFolder className="h-5 w-5 text-trinity-red" />,
  payment_received: <FiDollarSign className="h-5 w-5 text-trinity-red" />,
  milestone_completed: <FiCheckCircle className="h-5 w-5 text-trinity-red" />,
  request_created: <FiMessageSquare className="h-5 w-5 text-trinity-red" />,
  client_added: <FiUser className="h-5 w-5 text-trinity-red" />,
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
    <div className="rounded-2xl border-2 border-gray-700 glass-effect p-6 hover:border-trinity-red/30 transition-all duration-300 hover:shadow-large">
      <h3 className="text-xl font-heading font-semibold text-white mb-1">Recent Activity</h3>
      <p className="text-sm text-gray-300 mb-4">Latest updates across your workspace</p>
      <div className="space-y-3">
        {activities.length > 0 ? (
          activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ x: 4 }}
              className="flex items-start gap-4 rounded-xl border-2 border-gray-700 glass-effect p-4 transition-all hover:border-trinity-red/50 hover:shadow-medium"
            >
              <div className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-trinity-red/20 border border-trinity-red/30">
                {iconMap[activity.type ?? ""] ?? (
                  <FiCheckCircle className="h-5 w-5 text-trinity-red" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-white font-medium">{activity.message}</p>
                <p className="mt-1 text-xs text-gray-400">
                  {relativeTime(activity.timestamp)}
                </p>
              </div>
            </motion.div>
          ))
        ) : (
          <p className="py-10 text-center text-sm text-gray-400">No recent activity</p>
        )}
      </div>
    </div>
  );
}

export default ActivityFeed;

