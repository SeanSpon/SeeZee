"use client";

/**
 * Dashboard Client Component
 */

import { StatCard } from "@/components/admin/StatCard";
import { SectionCard } from "@/components/admin/SectionCard";
import { 
  Briefcase, 
  Users, 
  DollarSign, 
  FileText, 
  Wrench,
  Plus,
  CheckCircle,
  Send,
  TrendingUp,
  Clock,
  AlertCircle,
  ExternalLink,
  MessageSquare,
  Zap,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

type Activity = {
  id: string;
  type: string;
  title: string;
  description: string | null;
  metadata: any;
  userId: string | null;
  entityType: string | null;
  entityId: string | null;
  read: boolean;
  readAt: Date | null;
  createdAt: Date;
  user?: {
    id: string;
    email: string;
    name: string | null;
  } | null;
};

type Lead = {
  id: string;
  name: string;
  email: string;
  status: string;
  createdAt: Date;
};

interface DashboardClientProps {
  stats: {
    activeProjects: number;
    newLeads: number;
    openInvoices: number;
    activePlans: number;
    openTasks: number;
  };
  activities: Activity[];
  leads: Lead[];
  taskStats: {
    total: number;
    todo: number;
    inProgress: number;
    done: number;
    overdue: number;
  };
  maintenanceStats: {
    total: number;
    upcoming: number;
    overdue: number;
    completed: number;
    active: number;
  };
}

const activityIcons: Record<string, { icon: any; color: string }> = {
  LEAD_NEW: { icon: Users, color: "blue" },
  LEAD_UPDATED: { icon: Users, color: "blue" },
  TASK_CREATED: { icon: CheckCircle, color: "purple" },
  TASK_COMPLETED: { icon: CheckCircle, color: "green" },
  PROJECT_CREATED: { icon: Briefcase, color: "emerald" },
  MAINTENANCE_SCHEDULED: { icon: Wrench, color: "orange" },
  SYSTEM_ALERT: { icon: AlertCircle, color: "red" },
};

export function DashboardClient({
  stats,
  activities,
  leads,
  taskStats,
  maintenanceStats,
}: DashboardClientProps) {
  // Calculate alerts
  const newLeadsCount = leads.filter((l) => l.status === "NEW").length;
  const tasksThisWeek = taskStats.todo; // Simplified

  return (
    <div className="space-y-12 max-w-[1800px]">
      {/* Header */}
      <div className="admin-page-header">
        <h1 className="admin-page-title">Dashboard</h1>
        <p className="admin-page-subtitle">
          Welcome back! Here's what's happening today.
        </p>
      </div>

      {/* Live KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
        <StatCard
          label="Active Projects"
          value={stats.activeProjects}
          icon={<Briefcase className="w-5 h-5" />}
          trend={{ value: 15, label: "from last month" }}
        />
        <StatCard
          label="New Leads"
          value={stats.newLeads}
          icon={<Users className="w-5 h-5" />}
          trend={{ value: 22, label: "this week" }}
        />
        <StatCard
          label="Open Invoices"
          value={stats.openInvoices}
          icon={<FileText className="w-5 h-5" />}
          trend={{ value: -12, label: "vs last month" }}
        />
        <StatCard
          label="Active Plans"
          value={stats.activePlans}
          icon={<Wrench className="w-5 h-5" />}
        />
        <StatCard
          label="Open Tasks"
          value={stats.openTasks}
          icon={<Clock className="w-5 h-5" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <SectionCard
            title="Quick Actions"
            description="Common tasks to get things done faster"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Link
                href="/admin/pipeline/invoices"
                className="flex items-center gap-3 p-5 rounded-xl bg-slate-900/40 border border-white/5 hover:bg-slate-900/60 hover:border-blue-500/30 hover:scale-[1.02] transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform border border-blue-500/20">
                  <Plus className="w-6 h-6" />
                </div>
                <div className="text-left flex-1">
                  <p className="text-sm font-semibold text-white mb-0.5">Create Invoice</p>
                  <p className="text-xs text-slate-400">Bill a client</p>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
              </Link>

              <Link
                href="/admin/pipeline/leads"
                className="flex items-center gap-3 p-5 rounded-xl bg-slate-900/40 border border-white/5 hover:bg-slate-900/60 hover:border-green-500/30 hover:scale-[1.02] transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-600/20 text-green-400 flex items-center justify-center group-hover:scale-110 transition-transform border border-green-500/20">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div className="text-left flex-1">
                  <p className="text-sm font-semibold text-white mb-0.5">Approve Lead</p>
                  <p className="text-xs text-slate-400">Convert to project</p>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
              </Link>

              <Link
                href="/admin/tasks"
                className="flex items-center gap-3 p-5 rounded-xl bg-slate-900/40 border border-white/5 hover:bg-slate-900/60 hover:border-purple-500/30 hover:scale-[1.02] transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-600/20 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform border border-purple-500/20">
                  <Send className="w-6 h-6" />
                </div>
                <div className="text-left flex-1">
                  <p className="text-sm font-semibold text-white mb-0.5">Assign Task</p>
                  <p className="text-xs text-slate-400">Delegate work</p>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
              </Link>
            </div>
          </SectionCard>
        </div>

        {/* Revenue This Month */}
        <SectionCard
          title="Revenue"
          description="This month"
        >
          <div className="space-y-4">
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-white">$42.5k</span>
              <span className="flex items-center gap-1 text-sm font-medium text-green-400 mb-1">
                <TrendingUp className="w-4 h-4" />
                +18%
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Paid</span>
                <span className="text-white font-medium">$38,200</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Pending</span>
                <span className="text-yellow-400 font-medium">$4,300</span>
              </div>
              <div className="pt-2 border-t border-white/5">
                <Link
                  href="/admin/executive/finances"
                  className="text-blue-400 hover:text-blue-300 text-xs font-medium flex items-center gap-1"
                >
                  View Finances
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Activity Feed & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity - 2 cols */}
        <div className="lg:col-span-2">
          <SectionCard
            title="Recent Activity"
            description="Latest updates across your workspace"
            action={
              <Link
                href="/admin/feed"
                className="text-sm text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
              >
                View All
                <ExternalLink className="w-3 h-3" />
              </Link>
            }
          >
            <div className="space-y-4">
              {activities.length > 0 ? (
                activities.map((activity) => {
                  const iconConfig = activityIcons[activity.type] || activityIcons.SYSTEM_ALERT;
                  const Icon = iconConfig.icon;
                  
                  return (
                    <div
                      key={activity.id}
                      className="flex items-start gap-5 p-5 rounded-xl bg-slate-900/40 border border-white/5 hover:border-white/10 transition-all"
                    >
                      <div className={`w-11 h-11 rounded-xl bg-${iconConfig.color}-500/20 text-${iconConfig.color}-400 flex items-center justify-center flex-shrink-0 border border-${iconConfig.color}-500/20`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white mb-1">
                          {activity.title}
                        </p>
                        {activity.description && (
                          <p className="text-xs text-slate-400 mb-1.5">
                            {activity.description}
                          </p>
                        )}
                        <p className="text-xs text-slate-500">
                          {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </SectionCard>
        </div>

        {/* Priority Alerts - 1 col */}
        <SectionCard
          title="Priority Alerts"
          description="Items needing attention"
        >
          <div className="space-y-4">
            {maintenanceStats.overdue > 0 && (
              <div className="p-5 rounded-xl bg-red-500/10 border border-red-500/30">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-400 mb-1">
                      {maintenanceStats.overdue} Overdue Maintenance
                    </p>
                    <p className="text-xs text-red-400/70 mb-2">
                      Requires immediate attention
                    </p>
                    <Link
                      href="/admin/maintenance"
                      className="text-xs text-red-400 hover:text-red-300 font-medium"
                    >
                      Review →
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {newLeadsCount > 0 && (
              <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-400 mb-1">
                      {newLeadsCount} Leads Awaiting Response
                    </p>
                    <p className="text-xs text-yellow-400/70 mb-2">
                      New inquiries need attention
                    </p>
                    <Link
                      href="/admin/pipeline/leads"
                      className="text-xs text-yellow-400 hover:text-yellow-300 font-medium"
                    >
                      Respond →
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {taskStats.overdue > 0 && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-400 mb-1">
                      {taskStats.overdue} Tasks Overdue
                    </p>
                    <p className="text-xs text-red-400/70 mb-2">
                      Past their due date
                    </p>
                    <Link
                      href="/admin/tasks"
                      className="text-xs text-red-400 hover:text-red-300 font-medium"
                    >
                      View Tasks →
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {tasksThisWeek > 0 && (
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-400 mb-1">
                      {tasksThisWeek} Tasks To Do
                    </p>
                    <p className="text-xs text-blue-400/70 mb-2">
                      Assigned to your team
                    </p>
                    <Link
                      href="/admin/tasks"
                      className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                    >
                      View Tasks →
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {newLeadsCount === 0 && taskStats.overdue === 0 && maintenanceStats.overdue === 0 && (
              <div className="text-center py-8 text-green-400">
                <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm font-medium">All caught up!</p>
                <p className="text-xs text-slate-400 mt-1">No urgent items</p>
              </div>
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
