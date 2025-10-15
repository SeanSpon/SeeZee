/**
 * System Logs - Activity, System, Security
 */

"use client";

import { useState } from "react";
import { SectionCard } from "@/components/admin/SectionCard";
import { formatRelativeTime } from "@/lib/ui";

interface LogEntry {
  id: string;
  type: "activity" | "system" | "security";
  level: "info" | "warning" | "error";
  message: string;
  user?: string;
  timestamp: Date;
}

const mockLogs: LogEntry[] = [
  {
    id: "log-1",
    type: "activity",
    level: "info",
    message: "User Sean logged in",
    user: "Sean",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: "log-2",
    type: "system",
    level: "info",
    message: "Database backup completed successfully",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: "log-3",
    type: "security",
    level: "warning",
    message: "Failed login attempt from unknown IP",
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
  },
  {
    id: "log-4",
    type: "activity",
    level: "info",
    message: "Invoice #32 created by Zach",
    user: "Zach",
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
  },
];

const levelColors = {
  info: "text-blue-400 bg-blue-500/20",
  warning: "text-yellow-400 bg-yellow-500/20",
  error: "text-red-400 bg-red-500/20",
};

export default function LogsPage() {
  const [filter, setFilter] = useState<"all" | "activity" | "system" | "security">("all");

  const filteredLogs = filter === "all" 
    ? mockLogs 
    : mockLogs.filter((log) => log.type === filter);

  return (
    <div className="space-y-6">
      <div className="admin-page-header">
        <h1 className="admin-page-title">System Logs</h1>
        <p className="admin-page-subtitle">
          Monitor activity, system events, and security
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/5">
        {["all", "activity", "system", "security"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab as any)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-all capitalize ${
              filter === tab
                ? "border-blue-500 text-white"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Logs */}
      <SectionCard>
        <div className="space-y-2">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-4 p-3 rounded-lg bg-slate-900/40 border border-white/5 hover:bg-slate-900/60 transition-all"
            >
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  levelColors[log.level]
                }`}
              >
                {log.level.toUpperCase()}
              </span>
              <div className="flex-1">
                <p className="text-sm text-white">{log.message}</p>
                <div className="flex items-center gap-2 mt-1">
                  {log.user && (
                    <>
                      <span className="text-xs text-slate-500">{log.user}</span>
                      <span className="text-xs text-slate-700">•</span>
                    </>
                  )}
                  <span className="text-xs text-slate-500">
                    {formatRelativeTime(log.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}


