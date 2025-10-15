"use client";

/**
 * Maintenance Client Component
 */

import { useState } from "react";
import { StatCard } from "@/components/admin/StatCard";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Wrench, Clock, CheckCircle, TrendingUp } from "lucide-react";
import { updateMaintenanceStatus } from "@/server/actions";
import { useRouter } from "next/navigation";

type MaintenanceSchedule = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  scheduledFor: Date;
  completedAt: Date | null;
  isActive: boolean;
  project: {
    id: string;
    name: string;
  };
};

type Client = {
  id: string;
  name: string;
  maintenanceSchedules?: MaintenanceSchedule[];
};

interface MaintenanceClientProps {
  initialSchedules: MaintenanceSchedule[];
  clients: Client[];
  stats: {
    activePlans: number;
    pending: number;
    resolvedThisWeek: number;
    avgResponseTime: string;
  };
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  IN_PROGRESS: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  COMPLETED: "bg-green-500/20 text-green-400 border-green-500/30",
  CANCELLED: "bg-red-500/20 text-red-400 border-red-500/30",
};

export function MaintenanceClient({ initialSchedules, clients, stats }: MaintenanceClientProps) {
  const router = useRouter();
  const [tab, setTab] = useState<"requests" | "plans">("requests");
  const [schedules, setSchedules] = useState(initialSchedules);
  const [updating, setUpdating] = useState<string | null>(null);

  const handleStatusChange = async (scheduleId: string, newStatus: string) => {
    setUpdating(scheduleId);
    const result = await updateMaintenanceStatus(scheduleId, newStatus as any);

    if (result.success) {
      setSchedules((prev) =>
        prev.map((s) => (s.id === scheduleId ? { ...s, status: newStatus } : s))
      );
      router.refresh();
    }
    setUpdating(null);
  };

  const columns: Column<MaintenanceSchedule>[] = [
    {
      key: "project",
      label: "Client",
      sortable: true,
      render: (schedule) => (
        <div className="font-medium text-white">{schedule.project.name}</div>
      ),
    },
    {
      key: "title",
      label: "Issue",
      sortable: true,
      render: (schedule) => (
        <div>
          <div className="font-medium text-white">{schedule.title}</div>
          {schedule.description && (
            <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">
              {schedule.description}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (schedule) => (
        <select
          value={schedule.status}
          onChange={(e) => handleStatusChange(schedule.id, e.target.value)}
          disabled={updating === schedule.id}
          className={`
            px-2 py-1 rounded-full text-xs font-medium border
            bg-transparent cursor-pointer
            ${statusColors[schedule.status] || statusColors.PENDING}
            ${updating === schedule.id ? "opacity-50 cursor-wait" : ""}
          `}
        >
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      ),
    },
    {
      key: "priority",
      label: "Priority",
      render: (schedule) => (
        <span
          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
            schedule.priority === "HIGH"
              ? "bg-red-500/20 text-red-400"
              : schedule.priority === "MEDIUM"
              ? "bg-yellow-500/20 text-yellow-400"
              : "bg-slate-500/20 text-slate-400"
          }`}
        >
          {schedule.priority}
        </span>
      ),
    },
    {
      key: "scheduledFor",
      label: "Scheduled",
      render: (schedule) => (
        <div className="text-sm text-slate-300">
          {new Date(schedule.scheduledFor).toLocaleDateString()}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Maintenance</h1>
        <p className="admin-page-subtitle">
          Manage maintenance requests and client plans
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Active Plans"
          value={stats.activePlans}
          icon={<Wrench className="w-5 h-5" />}
        />
        <StatCard
          label="Pending Requests"
          value={stats.pending}
          icon={<Clock className="w-5 h-5" />}
        />
        <StatCard
          label="Resolved This Week"
          value={stats.resolvedThisWeek}
          icon={<CheckCircle className="w-5 h-5" />}
          trend={{ value: 20, label: "from last week" }}
        />
        <StatCard
          label="Avg Response Time"
          value={stats.avgResponseTime}
          icon={<TrendingUp className="w-5 h-5" />}
          trend={{ value: -15, label: "improvement" }}
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/5">
        <button
          onClick={() => setTab("requests")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-all ${
            tab === "requests"
              ? "border-blue-500 text-white"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          Requests
        </button>
        <button
          onClick={() => setTab("plans")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-all ${
            tab === "plans"
              ? "border-blue-500 text-white"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          Plans
        </button>
      </div>

      {/* Content */}
      {tab === "requests" ? (
        <DataTable
          data={schedules}
          columns={columns}
          searchPlaceholder="Search requests..."
          onRowClick={(schedule) => router.push(`/admin/maintenance/${schedule.id}`)}
        />
      ) : (
        <div className="glass-container-static p-8 text-center">
          <h3 className="text-lg font-semibold text-white mb-2">Client Plans</h3>
          <p className="text-slate-400 mb-6">
            {clients.length} clients with maintenance plans
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients.map((client) => (
              <div
                key={client.id}
                className="glass-container-static p-4 text-left cursor-pointer hover:border-blue-500/50 transition-all"
                onClick={() => router.push(`/admin/projects/${client.id}`)}
              >
                <h4 className="font-semibold text-white mb-2">{client.name}</h4>
                <p className="text-sm text-slate-400">
                  {client.maintenanceSchedules?.length || 0} scheduled tasks
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
