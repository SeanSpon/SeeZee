"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  FiArrowRight,
  FiCalendar,
  FiCheckCircle,
  FiClipboard,
  FiDollarSign,
  FiFileText,
  FiFolder,
  FiLayers,
  FiMessageSquare,
  FiTrendingUp,
} from "react-icons/fi";
import ActivityFeed, {
  ActivityItem,
} from "@/components/admin/dashboard/ActivityFeed";
import StatsCards, {
  AdminStats,
} from "@/components/admin/dashboard/StatsCards";

interface DashboardTask {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate?: string | null;
}

interface DashboardLead {
  id: string;
  company?: string | null;
  name?: string | null;
  status?: string | null;
  createdAt?: string | null;
}

interface DashboardClientProps {
  stats: AdminStats;
  activities: ActivityItem[];
  topTasks: DashboardTask[];
  recentLeads: DashboardLead[];
  metrics: {
    newLeads: number;
    openTasks: number;
    pipelineProjects: number;
  };
}

const quickActions = [
  {
    href: "/admin/pipeline",
    label: "View Pipeline",
    description: "Manage leads and track deal flow",
    icon: FiTrendingUp,
    accent: "from-trinity-red/20 via-trinity-red/10 to-transparent text-trinity-red",
  },
  {
    href: "/admin/projects",
    label: "Create Project",
    description: "Spin up a new client initiative",
    icon: FiFolder,
    accent: "from-trinity-red/20 via-trinity-red/10 to-transparent text-trinity-red",
  },
  {
    href: "/admin/invoices",
    label: "Generate Invoice",
    description: "Bill a client in seconds",
    icon: FiFileText,
    accent: "from-trinity-red/20 via-trinity-red/10 to-transparent text-trinity-red",
  },
];

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function DashboardClient({
  stats,
  activities,
  topTasks,
  recentLeads,
  metrics,
}: DashboardClientProps) {
  return (
    <div className="space-y-10">
      <header className="space-y-3 relative">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-trinity-red glow-on-hover inline-block mb-2">
              Command Center
            </span>
            <h1 className="text-4xl font-heading font-bold gradient-text">
              Admin Dashboard
            </h1>
          </div>
          <Link
            href="/admin/pipeline"
            className="inline-flex items-center gap-2 rounded-lg border-2 border-trinity-red/40 bg-trinity-red/10 px-5 py-2.5 text-sm font-medium text-trinity-red transition-all hover:bg-trinity-red hover:text-white hover:shadow-large hover:border-trinity-red"
          >
            Pipeline Overview
            <FiArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <p className="max-w-2xl text-base text-gray-300 leading-relaxed">
          Overview of your business operations and performance
        </p>
      </header>

      <StatsCards stats={stats} />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <ActivityFeed activities={activities} />

          <section className="rounded-2xl border-2 border-gray-700 glass-effect p-6 hover:border-trinity-red/30 transition-all duration-300 hover:shadow-large">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-heading font-semibold text-white">Top Tasks</h2>
                <p className="text-sm text-gray-300">High-priority assignments needing attention</p>
              </div>
              <Link
                href="/admin/tasks"
                className="text-sm text-trinity-red transition hover:text-trinity-maroon font-semibold"
              >
                View all →
              </Link>
            </div>
            <div className="mt-5 space-y-3">
              {topTasks.length > 0 ? (
                topTasks.map((task) => {
                  const statusLabel =
                    task.status === "DONE"
                      ? "Completed"
                      : task.status === "IN_PROGRESS"
                      ? "In Progress"
                      : "To Do";

                  const priorityTint =
                    task.priority === "HIGH"
                      ? "bg-gray-800 text-gray-300"
                      : task.priority === "MEDIUM"
                      ? "bg-gray-800 text-gray-300"
                      : "bg-gray-800 text-gray-300";

                  return (
                    <motion.div
                      key={task.id}
                      whileHover={{ scale: 1.01, y: -2 }}
                      className="flex flex-col gap-3 rounded-xl border-2 border-gray-700 glass-effect p-4 transition-all hover:border-trinity-red/40 hover:shadow-medium"
                    >
                      <div className="flex items-center justify-between">
                        <Link
                          href={`/admin/tasks/${task.id}`}
                          className="text-sm font-semibold text-white hover:text-trinity-red transition"
                        >
                          {task.title}
                        </Link>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                          task.priority === "HIGH" 
                            ? "bg-red-500/20 text-red-400 border-red-500/30" 
                            : task.priority === "MEDIUM"
                            ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                            : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                        <span className="inline-flex items-center gap-1 rounded-full border border-gray-700/70 px-2 py-0.5 text-gray-300">
                          <FiClipboard className="h-3.5 w-3.5" />
                          {statusLabel}
                        </span>
                        {task.dueDate && (
                          <span className="inline-flex items-center gap-1">
                            <FiCalendar className="h-3.5 w-3.5" />
                            Due {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="rounded-xl border border-dashed border-gray-700 bg-gray-800/30 p-8 text-center text-sm text-gray-400">
                  No active tasks — looks like you're all caught up!
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border-2 border-gray-700 glass-effect p-6 hover:border-trinity-red/30 transition-all duration-300 hover:shadow-large">
            <h2 className="text-xl font-heading font-semibold text-white">Quick Actions</h2>
            <p className="text-sm text-gray-300">Essential workflows, one tap away</p>
            <div className="mt-5 space-y-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="group flex items-center gap-3 rounded-xl border-2 border-gray-700 glass-effect p-4 transition-all hover:border-trinity-red/50 hover:bg-gray-800/70 hover:shadow-medium hover:-translate-y-0.5"
                  >
                    <span
                      className={`grid h-11 w-11 place-items-center rounded-lg bg-gradient-to-br ${action.accent}`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white group-hover:text-trinity-red">
                        {action.label}
                      </p>
                      <p className="text-xs text-gray-400">{action.description}</p>
                    </div>
                    <FiArrowRight className="h-4 w-4 text-gray-600 transition group-hover:text-trinity-red" />
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border-2 border-gray-700 glass-effect p-6 hover:border-trinity-red/30 transition-all duration-300 hover:shadow-large">
            <h2 className="text-xl font-heading font-semibold text-white">Pipeline Snapshot</h2>
            <div className="mt-4 space-y-4 text-sm text-gray-300">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-gray-400">
                  <FiMessageSquare className="h-4 w-4 text-trinity-red" /> New Leads
                </span>
                <span className="font-semibold text-white">{metrics.newLeads}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-gray-400">
                  <FiCheckCircle className="h-4 w-4 text-trinity-red" /> Active Tasks
                </span>
                <span className="font-semibold text-white">{metrics.openTasks}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-gray-400">
                  <FiLayers className="h-4 w-4 text-trinity-red" /> Projects in Pipeline
                </span>
                <span className="font-semibold text-white">{metrics.pipelineProjects}</span>
              </div>
            </div>
            <div className="mt-6 rounded-xl border border-gray-800/80 bg-gray-800/40 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-gray-500">
                Recent Leads
              </p>
              <div className="mt-3 space-y-2">
                {recentLeads.length > 0 ? (
                  recentLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="flex items-center justify-between rounded-lg border border-gray-800/80 bg-gray-900/40 px-3 py-2 text-xs text-gray-300"
                    >
                      <div className="flex-1 truncate">
                        {lead.company || lead.name || "Unknown"}
                      </div>
                      <span className="ml-3 rounded-full bg-gray-800/80 px-2 py-0.5 text-[10px] uppercase tracking-wide text-gray-400">
                        {lead.status ?? "NEW"}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500">No recent leads</p>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-2xl border-2 border-gray-700 glass-effect p-6 hover:border-trinity-red/30 transition-all duration-300 hover:shadow-large">
            <h2 className="text-xl font-heading font-semibold text-white">Revenue Pulse</h2>
            <p className="text-sm text-gray-400">
              Paid invoices continue to drive runway for growth.
            </p>
            <div className="mt-4 space-y-3 text-sm text-gray-300">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-gray-400">
                  <FiDollarSign className="h-4 w-4 text-trinity-red" /> Paid this month
                </span>
                <span className="font-semibold text-white">
                  {currencyFormatter.format(stats.totalRevenue ?? 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Open invoices</span>
                <span className="font-semibold text-white">{stats.unpaidInvoices ?? 0}</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default DashboardClient;
