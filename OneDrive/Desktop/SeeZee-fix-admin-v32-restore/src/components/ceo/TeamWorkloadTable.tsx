"use client";

import { UserRole } from "@prisma/client";

interface WorkloadItem {
  userId: string;
  name: string;
  role: UserRole;
  activeTasks: number;
  highPriorityTasks: number;
  activeProjects: number;
}

interface TeamWorkloadTableProps {
  workload: WorkloadItem[];
}

const roleColors: Record<UserRole, string> = {
  CEO: "bg-purple-500/20 text-purple-400",
  ADMIN: "bg-blue-500/20 text-blue-400",
  STAFF: "bg-green-500/20 text-green-400",
  DESIGNER: "bg-pink-500/20 text-pink-400",
  DEV: "bg-cyan-500/20 text-cyan-400",
  OUTREACH: "bg-orange-500/20 text-orange-400",
  INTERN: "bg-yellow-500/20 text-yellow-400",
  PARTNER: "bg-indigo-500/20 text-indigo-400",
  CLIENT: "bg-slate-500/20 text-slate-400",
};

export function TeamWorkloadTable({ workload }: TeamWorkloadTableProps) {
  if (workload.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        No team members found
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/5">
            <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">
              Team Member
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">
              Role
            </th>
            <th className="text-center py-3 px-4 text-sm font-medium text-slate-400">
              Active Tasks
            </th>
            <th className="text-center py-3 px-4 text-sm font-medium text-slate-400">
              High Priority
            </th>
            <th className="text-center py-3 px-4 text-sm font-medium text-slate-400">
              Projects
            </th>
            <th className="text-center py-3 px-4 text-sm font-medium text-slate-400">
              Workload
            </th>
          </tr>
        </thead>
        <tbody>
          {workload.map((item) => {
            const totalWorkload = item.activeTasks + item.activeProjects * 3; // Weight projects more
            const workloadLevel =
              totalWorkload < 5
                ? "Low"
                : totalWorkload < 10
                ? "Medium"
                : "High";
            const workloadColor =
              totalWorkload < 5
                ? "text-green-400"
                : totalWorkload < 10
                ? "text-yellow-400"
                : "text-red-400";

            return (
              <tr
                key={item.userId}
                className="border-b border-white/5 hover:bg-white/5 transition-colors"
              >
                <td className="py-3 px-4">
                  <div className="text-sm text-white font-medium">
                    {item.name}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      roleColors[item.role]
                    }`}
                  >
                    {item.role}
                  </span>
                </td>
                <td className="py-3 px-4 text-center text-sm text-white">
                  {item.activeTasks}
                </td>
                <td className="py-3 px-4 text-center text-sm text-white">
                  {item.highPriorityTasks}
                </td>
                <td className="py-3 px-4 text-center text-sm text-white">
                  {item.activeProjects}
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={`text-sm font-medium ${workloadColor}`}>
                    {workloadLevel}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
