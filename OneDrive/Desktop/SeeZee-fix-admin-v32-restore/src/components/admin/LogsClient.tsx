"use client";

import { useState } from "react";
import { SectionCard } from "@/components/admin/SectionCard";
import { formatRelativeTime } from "@/lib/ui";
import { ActivityType } from "@prisma/client";

interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string | null;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string;
  } | null;
}

interface LogsClientProps {
  activities: Activity[];
}

const typeColors: Record<string, string> = {
  LEAD_CREATED: "text-green-400 bg-green-500/20",
  LEAD_UPDATED: "text-blue-400 bg-blue-500/20",
  PROJECT_CREATED: "text-purple-400 bg-purple-500/20",
  PROJECT_UPDATED: "text-blue-400 bg-blue-500/20",
  INVOICE_CREATED: "text-yellow-400 bg-yellow-500/20",
  TASK_CREATED: "text-cyan-400 bg-cyan-500/20",
  TASK_COMPLETED: "text-green-400 bg-green-500/20",
  USER_LOGGED_IN: "text-slate-400 bg-slate-500/20",
};

export function LogsClient({ activities }: LogsClientProps) {
  const [filter, setFilter] = useState<ActivityType | "all">("all");

  // Get unique activity types
  const activityTypes = Array.from(
    new Set(activities.map((a) => a.type))
  ).slice(0, 5);

  const filteredActivities =
    filter === "all"
      ? activities
      : activities.filter((a) => a.type === filter);

  return (
    <div className="space-y-6">
      <div className="admin-page-header">
        <h1 className="admin-page-title">System Logs</h1>
        <p className="admin-page-subtitle">
          Real-time activity and system events
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/5 overflow-x-auto">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
            filter === "all"
              ? "border-blue-500 text-white"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          All
        </button>
        {activityTypes.map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
              filter === type
                ? "border-blue-500 text-white"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            {type.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {/* Logs */}
      <SectionCard>
        {filteredActivities.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            No activity logs found
          </div>
        ) : (
          <div className="space-y-2">
            {filteredActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 p-3 rounded-lg bg-slate-900/40 border border-white/5 hover:bg-slate-900/60 transition-all"
              >
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    typeColors[activity.type] ||
                    "text-slate-400 bg-slate-500/20"
                  }`}
                >
                  {activity.type.replace(/_/g, " ")}
                </span>
                <div className="flex-1">
                  <p className="text-sm text-white font-medium">
                    {activity.title}
                  </p>
                  {activity.description && (
                    <p className="text-sm text-slate-400 mt-1">
                      {activity.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    {activity.user && (
                      <>
                        <span className="text-xs text-slate-500">
                          {activity.user.name || activity.user.email}
                        </span>
                        <span className="text-xs text-slate-700">•</span>
                      </>
                    )}
                    <span className="text-xs text-slate-500">
                      {formatRelativeTime(activity.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
