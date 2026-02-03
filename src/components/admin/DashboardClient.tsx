"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
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
  FiPlus,
  FiMail,
  FiMapPin,
  FiMic,
  FiPieChart,
  FiUsers,
} from "react-icons/fi";
import ActivityFeed, {
  ActivityItem,
} from "@/components/admin/dashboard/ActivityFeed";
import StatsCards, {
  AdminStats,
} from "@/components/admin/dashboard/StatsCards";
import { RevenueChart } from "@/components/admin/dashboard/RevenueChart";
import { AlertsPanel, Alert } from "@/components/admin/dashboard/AlertsPanel";
import { TeamGitActivity } from "@/components/admin/dashboard/TeamGitActivity";

// Get current date formatted nicely
function getCurrentDate() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

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
  userName: string;
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

// Core Business Actions
const coreActions = [
  {
    href: "/admin/pipeline",
    label: "Pipeline",
    description: "Track deals & conversions",
    icon: FiTrendingUp,
    accent: "bg-sky-500/10 text-sky-400",
  },
  {
    href: "/admin/projects",
    label: "Projects",
    description: "Active client work",
    icon: FiFolder,
    accent: "bg-violet-500/10 text-violet-400",
  },
  {
    href: "/admin/invoices",
    label: "Invoices",
    description: "Billing & payments",
    icon: FiFileText,
    accent: "bg-emerald-500/10 text-emerald-400",
  },
];

// Marketing & Growth Actions
const marketingActions = [
  {
    href: "/admin/leads",
    label: "Leads & Finder",
    description: "Discover prospects",
    icon: FiMapPin,
    accent: "bg-amber-500/10 text-amber-400",
  },
  {
    href: "/admin/marketing",
    label: "Email Hub",
    description: "Campaigns & templates",
    icon: FiMail,
    accent: "bg-violet-500/10 text-violet-400",
  },
];

// Team Tools
const teamTools = [
  {
    href: "/admin/team",
    label: "Team",
    description: "Members & workload",
    icon: FiUsers,
    accent: "bg-sky-500/10 text-sky-400",
  },
  {
    href: "/admin/tasks",
    label: "Tasks",
    description: "Assignments & to-dos",
    icon: FiCheckCircle,
    accent: "bg-emerald-500/10 text-emerald-400",
  },
  {
    href: "/admin/calendar",
    label: "Calendar",
    description: "Schedule & meetings",
    icon: FiCalendar,
    accent: "bg-amber-500/10 text-amber-400",
  },
  {
    href: "/admin/recordings",
    label: "Recordings",
    description: "AI transcriptions",
    icon: FiMic,
    accent: "bg-rose-500/10 text-rose-400",
  },
];

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function DashboardClient({
  userName,
  stats,
  activities,
  topTasks,
  recentLeads,
  metrics,
}: DashboardClientProps) {
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoadingRevenue, setIsLoadingRevenue] = useState(true);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(true);

  useEffect(() => {
    // Fetch revenue data
    async function fetchRevenue() {
      try {
        const res = await fetch("/api/admin/revenue?months=6");
        const data = await res.json();
        if (data.success) {
          setRevenueData(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch revenue:", error);
      } finally {
        setIsLoadingRevenue(false);
      }
    }

    // Fetch alerts
    async function fetchAlerts() {
      try {
        const res = await fetch("/api/admin/alerts");
        const data = await res.json();
        if (data.success) {
          setAlerts(data.alerts);
        }
      } catch (error) {
        console.error("Failed to fetch alerts:", error);
      } finally {
        setIsLoadingAlerts(false);
      }
    }

    fetchRevenue();
    fetchAlerts();
  }, []);

  return (
    <div className="space-y-8 relative">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#ef4444]/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#22d3ee]/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>
      
      <header className="space-y-4 relative z-10">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 md:gap-6">
          <div className="space-y-2 md:space-y-3">
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs md:text-sm text-slate-400 font-medium tracking-wide uppercase"
            >
              {getCurrentDate()}
            </motion.p>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold"
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-300">
                Welcome back, {userName}
              </span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-sm md:text-base text-slate-400 max-w-xl"
            >
              Here's what's happening with your business today.
            </motion.p>
          </div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3"
          >
            <Link
              href="/admin/leads"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-white/[0.08] hover:border-white/[0.12]"
            >
              <FiMapPin className="h-4 w-4" />
              Find Leads
            </Link>
            <Link
              href="/admin/projects"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-sky-400"
            >
              <FiPlus className="h-4 w-4" />
              New Project
            </Link>
          </motion.div>
        </div>
      </header>

      <StatsCards stats={stats} />

      {/* Revenue Chart */}
      <RevenueChart data={revenueData} isLoading={isLoadingRevenue} />

      <div className="grid gap-6 md:gap-8 lg:grid-cols-3">
        <div className="space-y-6 md:space-y-8 lg:col-span-2 order-2 lg:order-1">
          {/* Team GitHub Activity */}
          <TeamGitActivity />

          <ActivityFeed activities={activities} />

          <section className="rounded-xl border border-white/[0.08] bg-slate-900/50 backdrop-blur-xl p-5 transition-all duration-300 hover:border-white/[0.12]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  <FiClipboard className="w-4 h-4 text-sky-400" />
                  Top Tasks
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">High-priority assignments needing attention</p>
              </div>
              <Link
                href="/admin/tasks"
                className="text-xs text-sky-400 transition hover:text-sky-300 font-medium flex items-center gap-1 group/link"
              >
                View all 
                <FiArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
              </Link>
            </div>
            <div className="space-y-2">
              {topTasks.length > 0 ? (
                topTasks.map((task) => {
                  const statusLabel =
                    task.status === "DONE"
                      ? "Completed"
                      : task.status === "IN_PROGRESS"
                      ? "In Progress"
                      : "To Do";

                  return (
                    <motion.div
                      key={task.id}
                      whileHover={{ y: -2 }}
                      className="group/task flex flex-col gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 transition-all duration-200 hover:border-white/[0.1] hover:bg-white/[0.04]"
                    >
                      <div className="flex items-center justify-between">
                        <Link
                          href={`/admin/tasks/${task.id}`}
                          className="text-sm font-medium text-white hover:text-sky-400 transition flex items-center gap-2"
                        >
                          <FiCheckCircle className="w-3.5 h-3.5 text-slate-500 group-hover/task:text-sky-400 transition" />
                          {task.title}
                        </Link>
                        <span className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                          task.priority === "HIGH" 
                            ? "bg-rose-500/10 text-rose-400" 
                            : task.priority === "MEDIUM"
                            ? "bg-amber-500/10 text-amber-400"
                            : "bg-sky-500/10 text-sky-400"
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                        <span className="inline-flex items-center gap-1 rounded bg-white/[0.04] px-1.5 py-0.5 text-slate-400">
                          <FiClipboard className="h-3 w-3" />
                          {statusLabel}
                        </span>
                        {task.dueDate && (
                          <span className="inline-flex items-center gap-1">
                            <FiCalendar className="h-3 w-3" />
                            Due {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="rounded-lg border border-dashed border-white/[0.08] bg-white/[0.02] p-8 text-center text-sm text-slate-500">
                  No active tasks — looks like you're all caught up!
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-4 md:space-y-6 order-1 lg:order-2">
          {/* Core Business Section */}
          <section className="rounded-xl border border-white/[0.08] bg-slate-900/50 backdrop-blur-xl p-5 transition-all duration-300 hover:border-white/[0.12]">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-white">Core Business</h2>
              <p className="text-xs text-slate-500 mt-0.5">Essential workflows & operations</p>
            </div>
            <div className="space-y-2">
              {coreActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="group flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 transition-all duration-200 hover:border-white/[0.1] hover:bg-white/[0.04]"
                  >
                    <span className={`grid h-9 w-9 place-items-center rounded-lg ${action.accent}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">
                        {action.label}
                      </p>
                      <p className="text-[11px] text-slate-500">{action.description}</p>
                    </div>
                    <FiArrowRight className="h-4 w-4 text-slate-600 transition group-hover:text-slate-400 group-hover:translate-x-0.5" />
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Marketing & Growth Section */}
          <section className="rounded-xl border border-white/[0.08] bg-slate-900/50 backdrop-blur-xl p-5 transition-all duration-300 hover:border-white/[0.12]">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-white">Marketing & Growth</h2>
              <p className="text-xs text-slate-500 mt-0.5">Lead generation & campaigns</p>
            </div>
            <div className="space-y-2">
              {marketingActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="group flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 transition-all duration-200 hover:border-white/[0.1] hover:bg-white/[0.04]"
                  >
                    <span className={`grid h-9 w-9 place-items-center rounded-lg ${action.accent}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">
                        {action.label}
                      </p>
                      <p className="text-[11px] text-slate-500">{action.description}</p>
                    </div>
                    <FiArrowRight className="h-4 w-4 text-slate-600 transition group-hover:text-slate-400 group-hover:translate-x-0.5" />
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Team Tools Grid */}
          <section className="rounded-xl border border-white/[0.08] bg-slate-900/50 backdrop-blur-xl p-5 transition-all duration-300 hover:border-white/[0.12]">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-white">Team Tools</h2>
              <p className="text-xs text-slate-500 mt-0.5">Collaboration & productivity</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {teamTools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    className="group flex flex-col items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 transition-all duration-200 hover:border-white/[0.1] hover:bg-white/[0.04] text-center"
                  >
                    <span className={`grid h-8 w-8 place-items-center rounded-lg ${tool.accent}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <p className="text-xs font-medium text-white">
                      {tool.label}
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="rounded-xl border border-white/[0.08] bg-slate-900/50 backdrop-blur-xl p-5 transition-all duration-300 hover:border-white/[0.12]">
            <h2 className="text-base font-semibold text-white mb-4">Pipeline Snapshot</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03]">
                <span className="inline-flex items-center gap-2 text-slate-400">
                  <div className="p-1.5 rounded-md bg-sky-500/10">
                    <FiMessageSquare className="h-3.5 w-3.5 text-sky-400" />
                  </div>
                  New Leads
                </span>
                <span className="font-semibold text-lg text-white">{metrics.newLeads}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03]">
                <span className="inline-flex items-center gap-2 text-slate-400">
                  <div className="p-1.5 rounded-md bg-emerald-500/10">
                    <FiCheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                  </div>
                  Active Tasks
                </span>
                <span className="font-semibold text-lg text-white">{metrics.openTasks}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03]">
                <span className="inline-flex items-center gap-2 text-slate-400">
                  <div className="p-1.5 rounded-md bg-violet-500/10">
                    <FiLayers className="h-3.5 w-3.5 text-violet-400" />
                  </div>
                  Projects in Pipeline
                </span>
                <span className="font-semibold text-lg text-white">{metrics.pipelineProjects}</span>
              </div>
            </div>
            <div className="mt-5 rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] uppercase tracking-[0.15em] text-slate-500 font-semibold">
                  Recent Leads
                </p>
                <Link
                  href="/admin/leads"
                  className="text-[10px] text-sky-400 hover:text-sky-300 transition uppercase tracking-wider font-medium"
                >
                  View All
                </Link>
              </div>
              <div className="mt-3 space-y-2">
                {recentLeads.length > 0 ? (
                  recentLeads.map((lead) => (
                    <Link
                      key={lead.id}
                      href={`/admin/leads/${lead.id}`}
                      className="flex items-center justify-between gap-2 rounded-md border border-white/[0.04] bg-white/[0.02] px-3 py-2 text-xs hover:bg-white/[0.04] hover:border-white/[0.08] transition-colors group"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate group-hover:text-sky-400 transition">
                          {lead.company || lead.name || "Unknown Lead"}
                        </p>
                        {lead.name && lead.company && (
                          <p className="text-slate-500 text-[10px] truncate mt-0.5">
                            {lead.name}
                          </p>
                        )}
                      </div>
                      <span className={`shrink-0 ml-2 rounded px-1.5 py-0.5 text-[10px] uppercase tracking-wide font-semibold ${
                        lead.status === "NEW" 
                          ? "bg-sky-500/10 text-sky-400" 
                          : lead.status === "QUALIFIED"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-white/[0.08] text-slate-400"
                      }`}>
                        {lead.status ?? "NEW"}
                      </span>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <p className="text-xs text-slate-500">No recent leads</p>
                    <Link
                      href="/admin/leads"
                      className="inline-block mt-2 text-xs text-sky-400 hover:text-sky-300 transition font-medium"
                    >
                      Add your first lead →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Alerts Panel */}
          <AlertsPanel alerts={alerts} isLoading={isLoadingAlerts} />

          {/* Maintenance Business Metrics */}
          <section className="rounded-xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-violet-500/5 backdrop-blur-xl p-5 transition-all duration-300 hover:border-violet-500/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-violet-500/20">
                <FiLayers className="h-4 w-4 text-violet-400" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">Maintenance Business</h2>
                <p className="text-xs text-slate-500">Recurring revenue & support</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-white/[0.05]">
                <p className="text-[11px] uppercase tracking-[0.15em] text-slate-500 mb-1">Active Plans</p>
                <p className="text-2xl font-semibold text-violet-400">
                  {stats.activePlans ?? 0}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-white/[0.05]">
                <p className="text-[11px] uppercase tracking-[0.15em] text-slate-500 mb-1">Monthly Recurring Revenue</p>
                <p className="text-2xl font-semibold text-emerald-400">
                  {currencyFormatter.format((stats.maintenanceMRR ?? 0) / 100)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-white/[0.05]">
                <p className="text-[11px] uppercase tracking-[0.15em] text-slate-500 mb-1">Total Hours Available</p>
                <p className="text-xl font-semibold text-sky-400">
                  {stats.totalHoursAvailable ?? 0}h
                </p>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.05]">
                <span className="text-slate-400 text-sm">Pending Requests</span>
                <span className="font-semibold text-lg text-white">{stats.pendingChangeRequests ?? 0}</span>
              </div>
              <Link 
                href="/admin/maintenance"
                className="block w-full text-center py-2 rounded-lg bg-violet-500/20 border border-violet-500/30 text-violet-400 hover:bg-violet-500/25 transition-colors text-sm font-medium"
              >
                View Maintenance Hub →
              </Link>
            </div>
          </section>

          {/* Financial Overview */}
          <section className="rounded-xl border border-white/[0.08] bg-slate-900/50 backdrop-blur-xl p-5 transition-all duration-300 hover:border-white/[0.12]">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <FiDollarSign className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">Financial Overview</h2>
                <p className="text-xs text-slate-500">Invoices & expenses</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-white/[0.03]">
                <p className="text-[11px] uppercase tracking-[0.15em] text-slate-500 mb-1">Invoice Revenue (This Month)</p>
                <p className="text-2xl font-semibold text-emerald-400">
                  {currencyFormatter.format(stats.thisMonthRevenue ?? 0)}
                </p>
              </div>
              {stats.thisMonthExpenses !== undefined && (
                <div className="p-3 rounded-lg bg-white/[0.03]">
                  <p className="text-[11px] uppercase tracking-[0.15em] text-slate-500 mb-1">Expenses (This Month)</p>
                  <p className="text-xl font-semibold text-rose-400">
                    -{currencyFormatter.format(stats.thisMonthExpenses)}
                  </p>
                </div>
              )}
              {stats.netProfit !== undefined && (
                <div className="p-3 rounded-lg bg-sky-500/5 border border-sky-500/20">
                  <p className="text-[11px] uppercase tracking-[0.15em] text-sky-400 mb-1 font-semibold">Net Profit (This Month)</p>
                  <p className={`text-2xl font-semibold ${stats.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {currencyFormatter.format(stats.netProfit)}
                  </p>
                </div>
              )}
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03]">
                <span className="text-slate-400 text-sm">Open Invoices</span>
                <span className="font-semibold text-lg text-white">{stats.unpaidInvoices ?? 0}</span>
              </div>
              <Link 
                href="/admin/finance"
                className="block w-full text-center py-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 hover:bg-sky-500/15 transition-colors text-sm font-medium"
              >
                View Finance Dashboard →
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default DashboardClient;
