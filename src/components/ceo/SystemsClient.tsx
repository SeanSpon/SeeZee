"use client";

import { motion } from "framer-motion";
import { SectionCard } from "@/components/admin/SectionCard";
import {
  Settings,
  Database,
  Users,
  Building2,
  Briefcase,
  CreditCard,
  Target,
  CheckCircle2,
  Server,
  Activity,
  HardDrive,
  Zap,
  AlertCircle,
  Clock,
  FileText,
  Bell,
} from "lucide-react";
import { formatCurrency } from "@/lib/ui";
import Link from "next/link";

interface SystemsClientProps {
  stats: {
    users: {
      total: number;
      admins: number;
      staff: number;
      clients: number;
      activeThisMonth: number;
    };
    organizations: {
      total: number;
      withProjects: number;
      withInvoices: number;
    };
    projects: {
      total: number;
      active: number;
      completed: number;
      byStatus: Record<string, number>;
    };
    invoices: {
      total: number;
      paid: number;
      pending: number;
      overdue: number;
      totalValue: number;
    };
    leads: {
      total: number;
      new: number;
      qualified: number;
      converted: number;
    };
    tasks: {
      total: number;
      todo: number;
      inProgress: number;
      done: number;
    };
    maintenance: {
      total: number;
      active: number;
      mrr: number;
    };
    files: {
      total: number;
      totalSize: number;
      recentUploads: any[];
    };
    systemLogs: {
      total: number;
      errors: number;
      warnings: number;
      recent: any[];
    };
    notifications: {
      total: number;
      unread: number;
    };
  };
  systemInfo: {
    dbStatus: string;
    dbLatency: number;
    uptime: string;
    nodeVersion: string;
    platform: string;
    memory: {
      used: number;
      total: number;
    };
  };
}

export function SystemsClient({ stats, systemInfo }: SystemsClientProps) {
  const memoryUsagePercent = (systemInfo.memory.used / systemInfo.memory.total) * 100;

  return (
    <div className="space-y-6 pb-8">
      {/* Premium Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-blue-600/20 to-cyan-600/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
        
        <motion.div 
          className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/30 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        />

        <div className="relative z-10 p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500"
              >
                <Settings className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-indigo-200 to-cyan-200 bg-clip-text text-transparent">
                  System Control Center
                </h1>
                <p className="text-slate-400 mt-1">Database overview and system monitoring</p>
              </div>
            </div>
            <Link
              href="/admin/database"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-medium hover:from-indigo-500 hover:to-cyan-500 transition-all shadow-lg"
            >
              Open Database Browser
            </Link>
          </div>
        </div>
      </motion.div>

      {/* System Health */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatusCard
          title="Database"
          status={systemInfo.dbStatus}
          metric={`${systemInfo.dbLatency}ms`}
          icon={Database}
          color={systemInfo.dbStatus === "Online" ? "emerald" : "red"}
        />
        <StatusCard
          title="System Uptime"
          status="Operational"
          metric={systemInfo.uptime}
          icon={Server}
          color="blue"
        />
        <StatusCard
          title="Memory Usage"
          status={memoryUsagePercent < 80 ? "Normal" : "High"}
          metric={`${Math.round(memoryUsagePercent)}%`}
          icon={HardDrive}
          color={memoryUsagePercent < 80 ? "cyan" : "amber"}
        />
        <StatusCard
          title="Notifications"
          status={`${stats.notifications.unread} Unread`}
          metric={`${stats.notifications.total} Total`}
          icon={Bell}
          color="purple"
        />
      </div>

      {/* Database Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SectionCard title="User Management">
          <div className="space-y-4">
            <StatRow label="Total Users" value={stats.users.total} icon={Users} color="blue" />
            <StatRow label="Admins" value={stats.users.admins} icon={Users} color="purple" />
            <StatRow label="Staff" value={stats.users.staff} icon={Users} color="cyan" />
            <StatRow label="Clients" value={stats.users.clients} icon={Users} color="emerald" />
            <div className="pt-3 border-t border-white/10">
              <StatRow 
                label="Active This Month" 
                value={stats.users.activeThisMonth} 
                icon={Activity} 
                color="amber"
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Organizations & Projects">
          <div className="space-y-4">
            <StatRow 
              label="Organizations" 
              value={stats.organizations.total} 
              icon={Building2} 
              color="indigo"
            />
            <StatRow 
              label="With Projects" 
              value={stats.organizations.withProjects} 
              icon={Briefcase} 
              color="blue"
            />
            <div className="pt-3 border-t border-white/10">
              <StatRow 
                label="Total Projects" 
                value={stats.projects.total} 
                icon={Briefcase} 
                color="cyan"
              />
              <StatRow 
                label="Active" 
                value={stats.projects.active} 
                icon={Activity} 
                color="emerald"
              />
              <StatRow 
                label="Completed" 
                value={stats.projects.completed} 
                icon={CheckCircle2} 
                color="green"
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Financial Overview">
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-300">Total Invoice Value</span>
                <CreditCard className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-bold text-white">{formatCurrency(stats.invoices.totalValue)}</p>
            </div>
            <StatRow 
              label="Paid Invoices" 
              value={stats.invoices.paid} 
              icon={CheckCircle2} 
              color="emerald"
            />
            <StatRow 
              label="Pending" 
              value={stats.invoices.pending} 
              icon={Clock} 
              color="amber"
            />
            {stats.invoices.overdue > 0 && (
              <StatRow 
                label="Overdue" 
                value={stats.invoices.overdue} 
                icon={AlertCircle} 
                color="red"
              />
            )}
            <div className="pt-3 border-t border-white/10">
              <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-300">Monthly Recurring</span>
                  <Zap className="w-4 h-4 text-purple-400" />
                </div>
                <p className="text-xl font-bold text-white">{formatCurrency(stats.maintenance.mrr)}/mo</p>
                <p className="text-xs text-slate-500 mt-1">{stats.maintenance.active} active plans</p>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Pipeline & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Sales Pipeline">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/30 border border-white/5">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-indigo-400" />
                <span className="text-sm text-slate-300">Total Leads</span>
              </div>
              <span className="text-2xl font-bold text-white">{stats.leads.total}</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-center">
                <p className="text-2xl font-bold text-white">{stats.leads.new}</p>
                <p className="text-xs text-slate-400 mt-1">New</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 text-center">
                <p className="text-2xl font-bold text-white">{stats.leads.qualified}</p>
                <p className="text-xs text-slate-400 mt-1">Qualified</p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
                <p className="text-2xl font-bold text-white">{stats.leads.converted}</p>
                <p className="text-xs text-slate-400 mt-1">Converted</p>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Task Management">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/30 border border-white/5">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                <span className="text-sm text-slate-300">Total Tasks</span>
              </div>
              <span className="text-2xl font-bold text-white">{stats.tasks.total}</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center">
                <p className="text-2xl font-bold text-white">{stats.tasks.todo}</p>
                <p className="text-xs text-slate-400 mt-1">To Do</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-center">
                <p className="text-2xl font-bold text-white">{stats.tasks.inProgress}</p>
                <p className="text-xs text-slate-400 mt-1">In Progress</p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
                <p className="text-2xl font-bold text-white">{stats.tasks.done}</p>
                <p className="text-xs text-slate-400 mt-1">Done</p>
              </div>
            </div>
            <div className="relative w-full bg-slate-800/50 rounded-full h-2">
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full"
                style={{ width: `${(stats.tasks.done / stats.tasks.total) * 100}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 text-center">
              {Math.round((stats.tasks.done / stats.tasks.total) * 100)}% completion rate
            </p>
          </div>
        </SectionCard>
      </div>

      {/* System Info & Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="System Information">
          <div className="space-y-3">
            <InfoRow label="Node Version" value={systemInfo.nodeVersion} />
            <InfoRow label="Platform" value={systemInfo.platform} />
            <InfoRow 
              label="Memory" 
              value={`${(systemInfo.memory.used / 1024 / 1024).toFixed(0)}MB / ${(systemInfo.memory.total / 1024 / 1024).toFixed(0)}MB`}
            />
            <InfoRow label="DB Latency" value={`${systemInfo.dbLatency}ms`} />
            <InfoRow 
              label="Files Stored" 
              value={`${stats.files.total} files (${(stats.files.totalSize / 1024 / 1024).toFixed(1)}MB)`}
            />
          </div>
        </SectionCard>

        <SectionCard title="Recent System Logs">
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {stats.systemLogs.recent.length > 0 ? (
              stats.systemLogs.recent.map((log: any) => (
                <div key={log.id} className={`p-3 rounded-lg border ${
                  log.level === 'ERROR' ? 'bg-red-500/10 border-red-500/20' :
                  log.level === 'WARN' ? 'bg-amber-500/10 border-amber-500/20' :
                  'bg-slate-800/30 border-white/5'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-semibold ${
                      log.level === 'ERROR' ? 'text-red-400' :
                      log.level === 'WARN' ? 'text-amber-400' :
                      'text-cyan-400'
                    }`}>
                      {log.level || 'INFO'}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 truncate">
                    {log.message || log.action || 'System activity'}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No recent logs</p>
              </div>
            )}
          </div>
          {stats.systemLogs.errors > 0 && (
            <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-sm text-red-400 font-medium">
                  {stats.systemLogs.errors} errors detected
                </span>
              </div>
            </div>
          )}
        </SectionCard>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link
          href="/admin/database"
          className="group p-5 rounded-xl bg-gradient-to-br from-indigo-500/10 to-slate-900 border border-indigo-500/20 hover:border-indigo-500/40 transition-all"
        >
          <Database className="w-8 h-8 text-indigo-400 mb-3" />
          <h3 className="text-lg font-semibold text-white mb-1">Database Browser</h3>
          <p className="text-sm text-slate-400">Query and manage data</p>
        </Link>

        <Link
          href="/admin/users"
          className="group p-5 rounded-xl bg-gradient-to-br from-blue-500/10 to-slate-900 border border-blue-500/20 hover:border-blue-500/40 transition-all"
        >
          <Users className="w-8 h-8 text-blue-400 mb-3" />
          <h3 className="text-lg font-semibold text-white mb-1">User Management</h3>
          <p className="text-sm text-slate-400">Manage team & clients</p>
        </Link>

        <Link
          href="/admin/ceo/systems/logs"
          className="group p-5 rounded-xl bg-gradient-to-br from-cyan-500/10 to-slate-900 border border-cyan-500/20 hover:border-cyan-500/40 transition-all"
        >
          <FileText className="w-8 h-8 text-cyan-400 mb-3" />
          <h3 className="text-lg font-semibold text-white mb-1">System Logs</h3>
          <p className="text-sm text-slate-400">View detailed logs</p>
        </Link>

        <Link
          href="/admin/ceo/systems/automations"
          className="group p-5 rounded-xl bg-gradient-to-br from-purple-500/10 to-slate-900 border border-purple-500/20 hover:border-purple-500/40 transition-all"
        >
          <Zap className="w-8 h-8 text-purple-400 mb-3" />
          <h3 className="text-lg font-semibold text-white mb-1">Automations</h3>
          <p className="text-sm text-slate-400">Workflow automation</p>
        </Link>
      </div>
    </div>
  );
}

// Helper Components
interface StatusCardProps {
  title: string;
  status: string;
  metric: string;
  icon: any;
  color: string;
}

function StatusCard({ title, status, metric, icon: Icon, color }: StatusCardProps) {
  const colorClasses: Record<string, string> = {
    emerald: "from-emerald-500/10 border-emerald-500/20 bg-emerald-500/20 text-emerald-400",
    blue: "from-blue-500/10 border-blue-500/20 bg-blue-500/20 text-blue-400",
    cyan: "from-cyan-500/10 border-cyan-500/20 bg-cyan-500/20 text-cyan-400",
    purple: "from-purple-500/10 border-purple-500/20 bg-purple-500/20 text-purple-400",
    amber: "from-amber-500/10 border-amber-500/20 bg-amber-500/20 text-amber-400",
    red: "from-red-500/10 border-red-500/20 bg-red-500/20 text-red-400",
  };
  
  const classes = colorClasses[color] || colorClasses.blue;
  const [bgFrom, borderColor, bgColor, textColor] = classes.split(' ');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${bgFrom} via-slate-900/90 to-slate-950 border ${borderColor} p-6 shadow-2xl`}
    >
      <div className={`p-3 rounded-xl ${bgColor} mb-4 inline-block`}>
        <Icon className={`w-6 h-6 ${textColor}`} />
      </div>
      <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
      <p className="text-2xl font-bold text-white mb-1">{status}</p>
      <p className="text-xs text-slate-500">{metric}</p>
    </motion.div>
  );
}

interface StatRowProps {
  label: string;
  value: number;
  icon: any;
  color: string;
}

function StatRow({ label, value, icon: Icon, color }: StatRowProps) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors border border-white/5">
      <div className="flex items-center gap-3">
        <Icon className={`w-5 h-5 text-${color}-400`} />
        <span className="text-sm text-slate-300">{label}</span>
      </div>
      <span className="text-lg font-bold text-white">{value}</span>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-white/5">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="text-sm text-white font-medium">{value}</span>
    </div>
  );
}
