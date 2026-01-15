"use client";

import { motion } from "framer-motion";
import { SectionCard } from "@/components/admin/SectionCard";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Target,
  CheckCircle2,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Crown,
  Briefcase,
  UserCheck,
  Percent,
} from "lucide-react";
import { formatCurrency } from "@/lib/ui";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface AnalyticsClientProps {
  data: {
    revenue: {
      total: number;
      pending: number;
      recent: number;
      trend: number;
      monthly: { month: string; revenue: number }[];
    };
    projects: {
      total: number;
      active: number;
      completed: number;
      avgValue: number;
      byStatus: { status: string; count: number }[];
    };
    leads: {
      total: number;
      converted: number;
      conversionRate: number;
      byStatus: { status: string; count: number }[];
    };
    team: {
      totalMembers: number;
      tasks: {
        total: number;
        completed: number;
        completionRate: number;
      };
    };
    clients: {
      total: number;
      top: { name: string; revenue: number }[];
    };
  };
}

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

export function AnalyticsClient({ data }: AnalyticsClientProps) {
  const { revenue, projects, leads, team, clients } = data;

  return (
    <div className="space-y-6 pb-8">
      {/* Premium Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-blue-600/20 to-cyan-600/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
        
        <motion.div 
          className="absolute -top-24 -left-24 w-48 h-48 bg-purple-500/30 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        />

        <div className="relative z-10 p-8">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500"
            >
              <BarChart3 className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
                Executive Analytics
              </h1>
              <p className="text-slate-400 mt-1">Comprehensive business intelligence and insights</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(revenue.total)}
          trend={revenue.trend}
          icon={DollarSign}
          color="emerald"
        />
        <MetricCard
          title="Active Projects"
          value={projects.active}
          subtitle={`${projects.completed} completed`}
          icon={Briefcase}
          color="blue"
        />
        <MetricCard
          title="Conversion Rate"
          value={`${Math.round(leads.conversionRate)}%`}
          subtitle={`${leads.converted}/${leads.total} leads`}
          icon={Target}
          color="purple"
        />
        <MetricCard
          title="Task Completion"
          value={`${Math.round(team.tasks.completionRate)}%`}
          subtitle={`${team.tasks.completed}/${team.tasks.total} tasks`}
          icon={CheckCircle2}
          color="cyan"
        />
      </div>

      {/* Revenue Chart */}
      <SectionCard title="Revenue Trend (Last 12 Months)">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenue.monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                labelStyle={{ color: '#e2e8f0' }}
                formatter={(value: number) => [formatCurrency(value), 'Revenue']}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#8b5cf6" 
                strokeWidth={3}
                dot={{ fill: '#8b5cf6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Status Distribution */}
        <SectionCard title="Projects by Status">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={projects.byStatus}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.status}: ${entry.count}`}
                >
                  {projects.byStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        {/* Lead Funnel */}
        <SectionCard title="Lead Conversion Funnel">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leads.byStatus} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" stroke="#94a3b8" />
                <YAxis dataKey="status" type="category" stroke="#94a3b8" width={100} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                />
                <Bar dataKey="count" fill="#06b6d4" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      {/* Top Clients */}
      <SectionCard title="Top 10 Clients by Revenue">
        <div className="space-y-3">
          {clients.top.map((client, index) => (
            <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-slate-800/30 border border-white/5">
              <div className="flex items-center gap-3">
                <div className={`flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm ${
                  index === 0 ? 'bg-amber-500/20 text-amber-400' :
                  index === 1 ? 'bg-slate-500/20 text-slate-400' :
                  index === 2 ? 'bg-orange-500/20 text-orange-400' :
                  'bg-slate-700/20 text-slate-500'
                }`}>
                  {index + 1}
                </div>
                <span className="text-white font-medium">{client.name}</span>
              </div>
              <span className="text-emerald-400 font-bold">{formatCurrency(client.revenue)}</span>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Business Health Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SectionCard title="Revenue Health">
          <div className="space-y-4">
            <HealthMetric
              label="Paid Revenue"
              value={formatCurrency(revenue.total)}
              percentage={(revenue.total / (revenue.total + revenue.pending)) * 100}
              color="emerald"
            />
            <HealthMetric
              label="Pending Revenue"
              value={formatCurrency(revenue.pending)}
              percentage={(revenue.pending / (revenue.total + revenue.pending)) * 100}
              color="amber"
            />
            <div className="pt-3 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Recent Trend</span>
                <span className={`flex items-center gap-1 text-sm font-semibold ${
                  revenue.trend >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {revenue.trend >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {Math.abs(Math.round(revenue.trend))}%
                </span>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Project Portfolio">
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <span className="text-sm text-slate-300">Active</span>
              <span className="text-2xl font-bold text-white">{projects.active}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-sm text-slate-300">Completed</span>
              <span className="text-2xl font-bold text-white">{projects.completed}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <span className="text-sm text-slate-300">Avg Value</span>
              <span className="text-lg font-bold text-white">{formatCurrency(projects.avgValue)}</span>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Team Performance">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Team Size</span>
              <span className="text-2xl font-bold text-white">{team.totalMembers}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Task Completion</span>
              <span className="text-xl font-bold text-emerald-400">{Math.round(team.tasks.completionRate)}%</span>
            </div>
            <div className="relative w-full bg-slate-800/50 rounded-full h-3 overflow-hidden">
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full"
                style={{ width: `${team.tasks.completionRate}%` }}
              />
            </div>
            <div className="text-xs text-slate-500 text-center">
              {team.tasks.completed} of {team.tasks.total} tasks completed
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

// Helper Components
interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: number;
  subtitle?: string;
  icon: any;
  color: string;
}

function MetricCard({ title, value, trend, subtitle, icon: Icon, color }: MetricCardProps) {
  const colorClasses: Record<string, string> = {
    emerald: "from-emerald-500/10 border-emerald-500/20 text-emerald-400 bg-emerald-500/20 ring-emerald-500/30",
    blue: "from-blue-500/10 border-blue-500/20 text-blue-400 bg-blue-500/20 ring-blue-500/30",
    purple: "from-purple-500/10 border-purple-500/20 text-purple-400 bg-purple-500/20 ring-purple-500/30",
    cyan: "from-cyan-500/10 border-cyan-500/20 text-cyan-400 bg-cyan-500/20 ring-cyan-500/30",
  };
  
  const classes = colorClasses[color] || colorClasses.purple;
  const [bgFrom, borderColor, textColor, bgColor, ringColor] = classes.split(' ');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${bgFrom} via-slate-900/90 to-slate-950 border ${borderColor} p-6 shadow-2xl`}
    >
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl ${bgColor} ring-1 ${ringColor}`}>
            <Icon className={`w-6 h-6 ${textColor}`} />
          </div>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${
              trend >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(Math.round(trend))}%
            </div>
          )}
        </div>
        <p className="text-sm font-medium text-slate-400 mb-2">{title}</p>
        <p className="text-3xl font-bold text-white mb-1">{value}</p>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>
    </motion.div>
  );
}

interface HealthMetricProps {
  label: string;
  value: string;
  percentage: number;
  color: string;
}

function HealthMetric({ label, value, percentage, color }: HealthMetricProps) {
  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className="text-sm text-slate-400">{label}</span>
        <span className={`text-sm font-semibold text-${color}-400`}>{value}</span>
      </div>
      <div className="relative w-full bg-slate-800/50 rounded-full h-2">
        <div 
          className={`absolute inset-y-0 left-0 bg-gradient-to-r from-${color}-500 to-${color}-600 rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
