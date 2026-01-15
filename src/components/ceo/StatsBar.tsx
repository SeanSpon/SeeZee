"use client";

import { CheckCircle2, Clock, Circle } from "lucide-react";

interface StatsBarProps {
  totalAssigned: number;
  inProgress: number;
  completed: number;
  notStarted: number;
}

export default function StatsBar({
  totalAssigned,
  inProgress,
  completed,
  notStarted,
}: StatsBarProps) {
  const completionRate =
    totalAssigned > 0 ? Math.round((completed / totalAssigned) * 100) : 0;

  return (
    <div className="glass p-4 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-slate-400">Completion Overview</h3>
        <div className="text-2xl font-bold text-purple-400">{completionRate}%</div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-4">
        <div className="h-full flex">
          <div
            className="bg-green-500"
            style={{ width: `${(completed / totalAssigned) * 100}%` }}
          />
          <div
            className="bg-yellow-500"
            style={{ width: `${(inProgress / totalAssigned) * 100}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-3">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Circle className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold">{totalAssigned}</div>
          <div className="text-xs text-slate-500">Assigned</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Circle className="w-4 h-4 text-slate-400 fill-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-400">{notStarted}</div>
          <div className="text-xs text-slate-500">Not Started</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Clock className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="text-2xl font-bold text-yellow-400">{inProgress}</div>
          <div className="text-xs text-slate-500">In Progress</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-green-400">{completed}</div>
          <div className="text-xs text-slate-500">Completed</div>
        </div>
      </div>
    </div>
  );
}
