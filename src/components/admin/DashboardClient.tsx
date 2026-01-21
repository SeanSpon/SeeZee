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
    accent: "from-trinity-red/20 via-trinity-red/10 to-transparent text-trinity-red",
  },
  {
    href: "/admin/projects",
    label: "Projects",
    description: "Active client work",
    icon: FiFolder,
    accent: "from-blue-500/20 via-blue-500/10 to-transparent text-blue-400",
  },
  {
    href: "/admin/invoices",
    label: "Invoices",
    description: "Billing & payments",
    icon: FiFileText,
    accent: "from-emerald-500/20 via-emerald-500/10 to-transparent text-emerald-400",
  },
];

// Marketing & Growth Actions
const marketingActions = [
  {
    href: "/admin/leads",
    label: "🗺️ Leads & Finder",
    description: "Discover prospects",
    icon: FiMapPin,
    accent: "from-green-500/20 via-green-500/10 to-transparent text-green-400",
  },
  {
    href: "/admin/marketing",
    label: "📧 Email Hub",
    description: "Campaigns & templates",
    icon: FiMail,
    accent: "from-purple-500/20 via-purple-500/10 to-transparent text-purple-400",
  },
];

// Team Tools
const teamTools = [
  {
    href: "/admin/team",
    label: "👥 Team",
    description: "Members & workload",
    icon: FiUsers,
    accent: "from-blue-500/20 via-blue-500/10 to-transparent text-blue-400",
  },
  {
    href: "/admin/tasks",
    label: "✅ Tasks",
    description: "Assignments & to-dos",
    icon: FiCheckCircle,
    accent: "from-cyan-500/20 via-cyan-500/10 to-transparent text-cyan-400",
  },
  {
    href: "/admin/calendar",
    label: "📅 Calendar",
    description: "Schedule & meetings",
    icon: FiCalendar,
    accent: "from-amber-500/20 via-amber-500/10 to-transparent text-amber-400",
  },
  {
    href: "/admin/recordings",
    label: "🎙️ Recordings",
    description: "AI transcriptions",
    icon: FiMic,
    accent: "from-pink-500/20 via-pink-500/10 to-transparent text-pink-400",
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
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="space-y-3">
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-slate-400 font-medium tracking-wide uppercase"
            >
              {getCurrentDate()}
            </motion.p>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl lg:text-4xl font-heading font-bold"
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-300">
                Welcome back, {userName}
              </span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-base text-slate-400 max-w-xl"
            >
              Here's what's happening with your business today.
            </motion.p>
          </div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center gap-3"
          >
            <Link
              href="/admin/leads"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] px-5 py-3 text-sm font-medium text-white transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:shadow-lg backdrop-blur-sm"
            >
              <FiMapPin className="h-4 w-4" />
              Find Leads
            </Link>
            <Link
              href="/admin/projects"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#ef4444] to-[#dc2626] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#ef4444]/25 transition-all duration-300 hover:shadow-xl hover:shadow-[#ef4444]/40 hover:-translate-y-1 hover:scale-105"
            >
              <FiPlus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
              New Project
            </Link>
          </motion.div>
        </div>
      </header>

      <StatsCards stats={stats} />

      {/* Revenue Chart */}
      <RevenueChart data={revenueData} isLoading={isLoadingRevenue} />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <ActivityFeed activities={activities} />

          <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1e293b]/80 via-[#1e293b]/60 to-[#0f172a]/60 backdrop-blur-xl p-6 transition-all duration-500 hover:border-white/20 hover:shadow-2xl hover:shadow-[#22d3ee]/10 group relative overflow-hidden">
            {/* Animated gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#22d3ee]/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out"></div>
            <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-heading font-semibold text-white flex items-center gap-2">
                  <FiClipboard className="w-5 h-5 text-[#22d3ee]" />
                  Top Tasks
                </h2>
                <p className="text-sm text-slate-400 mt-1">High-priority assignments needing attention</p>
              </div>
              <Link
                href="/admin/tasks"
                className="text-sm text-[#22d3ee] transition hover:text-[#06b6d4] font-semibold flex items-center gap-1 group/link"
              >
                View all 
                <FiArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
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

                  return (
                    <motion.div
                      key={task.id}
                      whileHover={{ y: -6, scale: 1.02 }}
                      className="group/task flex flex-col gap-3 rounded-xl border border-white/10 bg-gradient-to-br from-[#0f172a]/80 to-[#1e293b]/40 p-4 transition-all duration-300 hover:border-[#22d3ee]/30 hover:bg-[#1e293b]/60 hover:shadow-lg hover:shadow-[#22d3ee]/5 relative overflow-hidden"
                    >
                      {/* Hover glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-[#22d3ee]/0 via-[#22d3ee]/5 to-[#22d3ee]/0 opacity-0 group-hover/task:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative z-10">
                      <div className="flex items-center justify-between">
                        <Link
                          href={`/admin/tasks/${task.id}`}
                          className="text-sm font-semibold text-white hover:text-[#22d3ee] transition flex items-center gap-2"
                        >
                          <FiCheckCircle className="w-4 h-4 text-slate-400 group-hover/task:text-[#22d3ee] transition" />
                          {task.title}
                        </Link>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium border shadow-sm ${
                          task.priority === "HIGH" 
                            ? "bg-[#ef4444]/20 text-[#f87171] border-[#ef4444]/30 shadow-[#ef4444]/20" 
                            : task.priority === "MEDIUM"
                            ? "bg-[#f59e0b]/20 text-[#fbbf24] border-[#f59e0b]/30 shadow-[#f59e0b]/20"
                            : "bg-[#22d3ee]/20 text-[#22d3ee] border-[#22d3ee]/30 shadow-[#22d3ee]/20"
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-slate-300">
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
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="rounded-xl border border-dashed border-white/10 bg-[#0f172a]/40 p-8 text-center text-sm text-slate-400">
                  No active tasks — looks like you're all caught up!
                </div>
              )}
            </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          {/* Core Business Section */}
          <section className="rounded-2xl border border-white/10 bg-[#1e293b]/60 backdrop-blur-xl p-6 transition-all duration-300 hover:border-white/20 hover:shadow-xl">
            <div className="mb-5">
              <h2 className="text-xl font-heading font-semibold text-white">Core Business</h2>
              <p className="text-sm text-slate-400">Essential workflows & operations</p>
            </div>
            <div className="space-y-3">
              {coreActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="group flex items-center gap-3 rounded-xl border border-white/10 bg-[#0f172a]/60 p-4 transition-all duration-200 hover:border-[#ef4444]/40 hover:bg-[#1e293b]/60 hover:-translate-y-1"
                  >
                    <span className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${action.accent} border border-white/10`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white group-hover:text-[#ef4444] transition">
                        {action.label}
                      </p>
                      <p className="text-xs text-slate-400">{action.description}</p>
                    </div>
                    <FiArrowRight className="h-4 w-4 text-slate-500 transition group-hover:text-[#ef4444] group-hover:translate-x-1" />
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Marketing & Growth Section */}
          <section className="rounded-2xl border border-white/10 bg-[#1e293b]/60 backdrop-blur-xl p-6 transition-all duration-300 hover:border-white/20 hover:shadow-xl">
            <div className="mb-5">
              <h2 className="text-xl font-heading font-semibold text-white">Marketing & Growth</h2>
              <p className="text-sm text-slate-400">Lead generation & campaigns</p>
            </div>
            <div className="space-y-3">
              {marketingActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="group flex items-center gap-3 rounded-xl border border-white/10 bg-[#0f172a]/60 p-4 transition-all duration-200 hover:border-[#22d3ee]/40 hover:bg-[#1e293b]/60 hover:-translate-y-1"
                  >
                    <span className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${action.accent} border border-white/10`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white group-hover:text-[#22d3ee] transition">
                        {action.label}
                      </p>
                      <p className="text-xs text-slate-400">{action.description}</p>
                    </div>
                    <FiArrowRight className="h-4 w-4 text-slate-500 transition group-hover:text-[#22d3ee] group-hover:translate-x-1" />
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Team Tools Grid */}
          <section className="rounded-2xl border border-white/10 bg-[#1e293b]/60 backdrop-blur-xl p-6 transition-all duration-300 hover:border-white/20 hover:shadow-xl">
            <div className="mb-5">
              <h2 className="text-xl font-heading font-semibold text-white">Team Tools</h2>
              <p className="text-sm text-slate-400">Collaboration & productivity</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {teamTools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    className="group flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-[#0f172a]/60 p-4 transition-all duration-200 hover:border-white/20 hover:bg-[#1e293b]/60 hover:-translate-y-1 text-center"
                  >
                    <span className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${tool.accent} border border-white/10`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <p className="text-xs font-semibold text-white group-hover:text-cyan-400 transition">
                      {tool.label}
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-[#1e293b]/60 backdrop-blur-xl p-6 transition-all duration-300 hover:border-white/20 hover:shadow-xl">
            <h2 className="text-xl font-heading font-semibold text-white">Pipeline Snapshot</h2>
            <div className="mt-4 space-y-4 text-sm">
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <span className="inline-flex items-center gap-2 text-slate-400">
                  <div className="p-1.5 rounded-lg bg-[#22d3ee]/20">
                    <FiMessageSquare className="h-4 w-4 text-[#22d3ee]" />
                  </div>
                  New Leads
                </span>
                <span className="font-bold text-xl text-white">{metrics.newLeads}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <span className="inline-flex items-center gap-2 text-slate-400">
                  <div className="p-1.5 rounded-lg bg-[#10b981]/20">
                    <FiCheckCircle className="h-4 w-4 text-[#10b981]" />
                  </div>
                  Active Tasks
                </span>
                <span className="font-bold text-xl text-white">{metrics.openTasks}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <span className="inline-flex items-center gap-2 text-slate-400">
                  <div className="p-1.5 rounded-lg bg-[#3b82f6]/20">
                    <FiLayers className="h-4 w-4 text-[#3b82f6]" />
                  </div>
                  Projects in Pipeline
                </span>
                <span className="font-bold text-xl text-white">{metrics.pipelineProjects}</span>
              </div>
            </div>
            <div className="mt-6 rounded-xl border border-white/10 bg-[#0f172a]/60 p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500 font-semibold">
                  Recent Leads
                </p>
                <Link
                  href="/admin/leads"
                  className="text-[10px] text-[#22d3ee] hover:text-[#06b6d4] transition uppercase tracking-wider font-medium"
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
                      className="flex items-center justify-between gap-2 rounded-lg border border-white/5 bg-white/5 px-3 py-2.5 text-xs hover:bg-white/10 hover:border-white/10 transition-colors group"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate group-hover:text-[#22d3ee] transition">
                          {lead.company || lead.name || "Unknown Lead"}
                        </p>
                        {lead.name && lead.company && (
                          <p className="text-slate-500 text-[10px] truncate mt-0.5">
                            {lead.name}
                          </p>
                        )}
                      </div>
                      <span className={`shrink-0 ml-2 rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide font-medium ${
                        lead.status === "NEW" 
                          ? "bg-[#22d3ee]/20 text-[#22d3ee]" 
                          : lead.status === "QUALIFIED"
                          ? "bg-[#10b981]/20 text-[#10b981]"
                          : "bg-white/10 text-slate-400"
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
                      className="inline-block mt-2 text-xs text-[#22d3ee] hover:text-[#06b6d4] transition font-medium"
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

          <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 backdrop-blur-xl p-6 transition-all duration-300 hover:border-white/20 hover:shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-[#10b981]/20">
                <FiDollarSign className="h-5 w-5 text-[#10b981]" />
              </div>
              <div>
                <h2 className="text-xl font-heading font-semibold text-white">Financial Snapshot</h2>
                <p className="text-sm text-slate-400">This month's overview</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Revenue (This Month)</p>
                <p className="text-3xl font-bold text-[#10b981]">
                  {currencyFormatter.format(stats.thisMonthRevenue ?? stats.totalRevenue ?? 0)}
                </p>
              </div>
              {stats.thisMonthExpenses !== undefined && (
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Expenses (This Month)</p>
                  <p className="text-2xl font-bold text-[#ef4444]">
                    -{currencyFormatter.format(stats.thisMonthExpenses)}
                  </p>
                </div>
              )}
              {stats.netProfit !== undefined && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-[#22d3ee]/20 to-[#06b6d4]/10 border border-[#22d3ee]/30">
                  <p className="text-xs uppercase tracking-wider text-[#22d3ee] mb-1 font-semibold">Net Profit (This Month)</p>
                  <p className={`text-3xl font-bold ${stats.netProfit >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                    {currencyFormatter.format(stats.netProfit)}
                  </p>
                </div>
              )}
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <span className="text-slate-400">Open invoices</span>
                <span className="font-bold text-lg text-white">{stats.unpaidInvoices ?? 0}</span>
              </div>
              <Link 
                href="/admin/finance"
                className="block w-full text-center py-2 rounded-lg bg-[#22d3ee]/10 border border-[#22d3ee]/30 text-[#22d3ee] hover:bg-[#22d3ee]/20 transition-colors text-sm font-medium"
              >
                View Full Finance Dashboard →
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default DashboardClient;
