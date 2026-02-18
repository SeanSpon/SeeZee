"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  FiDollarSign,
  FiTrendingUp,
  FiActivity,
  FiCheckSquare,
  FiFolder,
  FiUsers,
  FiArrowRight,
  FiTarget,
  FiCreditCard,
  FiCalendar,
  FiBarChart2,
  FiServer,
  FiSettings,
  FiStar,
  FiDatabase,
  FiGitBranch,
  FiBookOpen,
} from "react-icons/fi";
import { SectionCard } from "@/components/admin/SectionCard";
import { ActivityFeed, type ActivityItem } from "@/components/admin/dashboard/ActivityFeed";
import { RevenueChart } from "@/components/admin/dashboard/RevenueChart";
import { AlertsPanel, type Alert } from "@/components/admin/dashboard/AlertsPanel";

/* ────────── Types ────────── */

interface MetricItem {
  label: string;
  value: string;
  subtext?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}

interface TaskSummary {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
  overdue: number;
}

interface LeadByStage {
  stage: string;
  count: number;
  color: string;
}

interface ProjectByStatus {
  status: string;
  count: number;
  color: string;
}

interface InvoiceRow {
  id: string;
  number: string;
  client: string;
  amount: number;
  status: string;
  dueDate: string | null;
}

interface TeamMember {
  userId: string;
  name: string;
  role: string;
  activeTasks: number;
  highPriorityTasks: number;
  activeProjects: number;
}

interface QuickNavItem {
  href: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
}

export interface SuperDashboardProps {
  stats: {
    totalRevenue: number;
    thisMonthRevenue: number;
    thisMonthExpenses: number;
    netProfit: number;
    activeProjects: number;
    totalClients: number;
    unpaidInvoices: number;
    maintenanceMRR: number;
    maintenanceARR: number;
    pendingChangeRequests: number;
  };
  taskStats: TaskSummary;
  activities: ActivityItem[];
  revenueData: { month: string; revenue: number; invoices: number }[];
  leadsByStage: LeadByStage[];
  projectsByStatus: ProjectByStatus[];
  recentInvoices: InvoiceRow[];
  alerts: Alert[];
  // CEO/CFO gated - optional
  teamWorkload?: TeamMember[];
  cashFlow?: {
    operatingCashFlow: number;
    burnRate: number;
    runway: number;
    healthScore: number;
  };
  isCeoOrCfo: boolean;
}

/* ────────── Helpers ────────── */

const fmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const QUICK_NAV: QuickNavItem[] = [
  { href: "/admin/projects", label: "Projects", description: "Active work", icon: FiFolder, color: "#ef4444" },
  { href: "/admin/tasks", label: "Tasks", description: "Assignments", icon: FiCheckSquare, color: "#3b82f6" },
  { href: "/admin/pipeline", label: "Pipeline", description: "Deal flow", icon: FiTrendingUp, color: "#8b5cf6" },
  { href: "/admin/finance", label: "Finance", description: "Revenue & costs", icon: FiDollarSign, color: "#10b981" },
  { href: "/admin/clients", label: "Clients", description: "Relationships", icon: FiUsers, color: "#f59e0b" },
  { href: "/admin/calendar", label: "Calendar", description: "Schedule", icon: FiCalendar, color: "#ec4899" },
  { href: "/admin/service-plans", label: "Service Plans", description: "Maintenance", icon: FiServer, color: "#06b6d4" },
  { href: "/admin/team", label: "Team", description: "Members", icon: FiUsers, color: "#f97316" },
  { href: "/admin/ceo", label: "CEO Hub", description: "Executive view", icon: FiStar, color: "#eab308" },
  { href: "/admin/analytics", label: "Analytics", description: "Metrics", icon: FiBarChart2, color: "#a855f7" },
  { href: "/admin/database", label: "Database", description: "Data mgmt", icon: FiDatabase, color: "#64748b" },
  { href: "/admin/git", label: "Git", description: "Repo mgmt", icon: FiGitBranch, color: "#22c55e" },
];

/* ────────── Component ────────── */

export function SuperDashboardClient({
  stats,
  taskStats,
  activities,
  revenueData,
  leadsByStage,
  projectsByStatus,
  recentInvoices,
  alerts,
  teamWorkload,
  cashFlow,
  isCeoOrCfo,
}: SuperDashboardProps) {
  const openTasks = taskStats.todo + taskStats.inProgress;
  const totalLeads = leadsByStage.reduce((s, l) => s + l.count, 0);

  const metrics: MetricItem[] = [
    {
      label: "Revenue",
      value: fmt.format(stats.thisMonthRevenue),
      subtext: `${fmt.format(stats.totalRevenue)} all time`,
      icon: FiDollarSign,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
    },
    {
      label: "Expenses",
      value: fmt.format(stats.thisMonthExpenses),
      subtext: "This month",
      icon: FiCreditCard,
      color: "text-red-400",
      bgColor: "bg-red-500/10",
    },
    {
      label: "Net Profit",
      value: fmt.format(stats.netProfit),
      subtext: stats.netProfit >= 0 ? "Profitable" : "Negative",
      icon: FiTrendingUp,
      color: stats.netProfit >= 0 ? "text-emerald-400" : "text-red-400",
      bgColor: stats.netProfit >= 0 ? "bg-emerald-500/10" : "bg-red-500/10",
    },
    {
      label: "Active Projects",
      value: String(stats.activeProjects),
      subtext: `${stats.totalClients} clients`,
      icon: FiFolder,
      color: "text-sky-400",
      bgColor: "bg-sky-500/10",
    },
    {
      label: "Open Tasks",
      value: String(openTasks),
      subtext: `${taskStats.overdue} overdue`,
      icon: FiCheckSquare,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
    },
    {
      label: "Pipeline Leads",
      value: String(totalLeads),
      subtext: `${stats.maintenanceMRR > 0 ? fmt.format(stats.maintenanceMRR) + " MRR" : "No MRR"}`,
      icon: FiTarget,
      color: "text-violet-400",
      bgColor: "bg-violet-500/10",
    },
  ];

  return (
    <div className="space-y-8">
      {/* ── Row 1: Metrics Strip ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-white/10 bg-gradient-to-br from-[#1e293b]/60 to-[#0f172a]/60 backdrop-blur-xl p-4 hover:border-white/20 transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${m.bgColor}`}>
                <m.icon className={`h-4 w-4 ${m.color}`} />
              </div>
              <span className="text-xs text-slate-400 font-medium">{m.label}</span>
            </div>
            <p className="text-xl font-bold text-white">{m.value}</p>
            {m.subtext && <p className="text-xs text-slate-500 mt-1">{m.subtext}</p>}
          </motion.div>
        ))}
      </div>

      {/* ── Row 2: Revenue Chart (2/3) + Task Summary (1/3) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart data={revenueData} />
        </div>
        <div className="space-y-6">
          <SectionCard title="Task Summary" delay={0.1}>
            <div className="space-y-3">
              {[
                { label: "To Do", count: taskStats.todo, color: "bg-slate-500" },
                { label: "In Progress", count: taskStats.inProgress, color: "bg-sky-500" },
                { label: "Done", count: taskStats.done, color: "bg-emerald-500" },
                { label: "Overdue", count: taskStats.overdue, color: "bg-red-500" },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${row.color}`} />
                    <span className="text-sm text-slate-300">{row.label}</span>
                  </div>
                  <span className="text-sm font-semibold text-white">{row.count}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Total</span>
                  <span className="text-sm font-bold text-white">{taskStats.total}</span>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Quick Actions" delay={0.15}>
            <div className="space-y-2">
              {[
                { label: "New Task", href: "/admin/tasks", icon: FiCheckSquare },
                { label: "New Invoice", href: "/admin/finance/transactions", icon: FiDollarSign },
                { label: "Add Lead", href: "/admin/pipeline", icon: FiTrendingUp },
              ].map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                >
                  <action.icon className="h-4 w-4 text-slate-500" />
                  {action.label}
                  <FiArrowRight className="h-3 w-3 ml-auto text-slate-600" />
                </Link>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>

      {/* ── Row 3: Projects + Pipeline + Activity Feed (3-col) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <SectionCard title="Projects Overview" delay={0.2}>
          <div className="space-y-3">
            {projectsByStatus.length > 0 ? (
              projectsByStatus.map((p) => (
                <div key={p.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="text-sm text-slate-300">{p.status}</span>
                  </div>
                  <span className="text-sm font-semibold text-white">{p.count}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No projects yet</p>
            )}
          </div>
          <Link
            href="/admin/projects"
            className="mt-4 flex items-center gap-1 text-xs text-[#22d3ee] hover:text-[#06b6d4] transition-colors font-medium"
          >
            View all projects <FiArrowRight className="h-3 w-3" />
          </Link>
        </SectionCard>

        <SectionCard title="Pipeline Snapshot" delay={0.25}>
          <div className="space-y-3">
            {leadsByStage.length > 0 ? (
              leadsByStage.map((l) => {
                const pct = totalLeads > 0 ? (l.count / totalLeads) * 100 : 0;
                return (
                  <div key={l.stage}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-300">{l.stage}</span>
                      <span className="text-xs text-slate-400">{l.count}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: l.color }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-slate-500">No leads yet</p>
            )}
          </div>
          <Link
            href="/admin/pipeline"
            className="mt-4 flex items-center gap-1 text-xs text-[#22d3ee] hover:text-[#06b6d4] transition-colors font-medium"
          >
            View pipeline <FiArrowRight className="h-3 w-3" />
          </Link>
        </SectionCard>

        <div>
          <ActivityFeed activities={activities} />
        </div>
      </div>

      {/* ── Row 4: Recent Invoices + Team/Alerts (2-col) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Recent Invoices" delay={0.3}>
          {recentInvoices.length > 0 ? (
            <div className="space-y-2">
              {recentInvoices.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3 hover:border-white/10 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white truncate">{inv.number}</p>
                    <p className="text-xs text-slate-400 truncate">{inv.client}</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="text-sm font-semibold text-white">{fmt.format(inv.amount)}</p>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        inv.status === "PAID"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : inv.status === "OVERDUE"
                          ? "bg-red-500/10 text-red-400"
                          : "bg-amber-500/10 text-amber-400"
                      }`}
                    >
                      {inv.status}
                    </span>
                  </div>
                </div>
              ))}
              <Link
                href="/admin/finance/transactions"
                className="mt-2 flex items-center gap-1 text-xs text-[#22d3ee] hover:text-[#06b6d4] transition-colors font-medium"
              >
                View all invoices <FiArrowRight className="h-3 w-3" />
              </Link>
            </div>
          ) : (
            <p className="text-sm text-slate-500">No invoices yet</p>
          )}
        </SectionCard>

        <div>
          {isCeoOrCfo && teamWorkload && teamWorkload.length > 0 ? (
            <SectionCard title="Team Workload" delay={0.35}>
              <div className="space-y-3">
                {teamWorkload.map((member) => (
                  <div
                    key={member.userId}
                    className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{member.name}</p>
                      <p className="text-xs text-slate-400">{member.role}</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span>{member.activeTasks} tasks</span>
                      <span>{member.activeProjects} projects</span>
                      {member.highPriorityTasks > 0 && (
                        <span className="text-red-400 font-medium">
                          {member.highPriorityTasks} urgent
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          ) : (
            <AlertsPanel alerts={alerts} />
          )}
        </div>
      </div>

      {/* ── Row 5: QuickNav Grid ── */}
      <SectionCard title="Quick Navigation" description="Jump to any admin section" delay={0.4}>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {QUICK_NAV.map((nav, i) => (
            <Link
              key={nav.href}
              href={nav.href}
              className="group flex flex-col items-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] p-4 hover:border-white/15 hover:bg-white/[0.05] transition-all text-center"
            >
              <div
                className="p-2.5 rounded-lg transition-colors"
                style={{ backgroundColor: `${nav.color}15` }}
              >
                <nav.icon className="h-5 w-5" style={{ color: nav.color }} />
              </div>
              <div>
                <p className="text-sm font-medium text-white group-hover:text-[#22d3ee] transition-colors">
                  {nav.label}
                </p>
                <p className="text-[11px] text-slate-500">{nav.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
