"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SectionCard } from "@/components/admin/SectionCard";
import {
  DollarSign,
  TrendingUp,
  Users,
  Target,
  CheckCircle2,
  Activity,
  BookOpen,
  Wrench,
  Zap,
  Sparkles,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Flame,
  Rocket,
  Crown,
  PieChart,
  LineChart,
  Settings,
  FileText,
  Clock,
  CreditCard,
  AlertCircle,
  Link as LinkIcon,
  Building2,
  Globe,
  Shield,
  Database,
  Wifi,
  WifiOff,
  Bell,
  TrendingDown,
  Package,
  UserCheck,
  Briefcase,
  CircleDollarSign,
  Percent,
  Calendar,
  MessageSquare,
  GitBranch,
  Heart,
  Mail,
  Phone,
  Star,
  Award,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/ui";
import { TeamManagementClient } from "./TeamManagementClient";
import { LearningHubManagementClient } from "./LearningHubManagementClient";
import AssignTaskModal from "./AssignTaskModal";
import { TeamAssignmentModal } from "./TeamAssignmentModal";

interface CEODashboardClientProps {
  metrics: any;
  workload: any[];
  utilization: any;
  leads?: any[];
  projects?: any[];
  invoices?: any[];
  taskStats?: any;
  activities?: any[];
  availableTasks?: any[];
  availableResources?: any[];
  availableTools?: any[];
  users?: any[];
}

type DashboardTab = "overview" | "financials" | "operations" | "team" | "learning" | "analytics";

export function CEODashboardClient({
  metrics,
  workload,
  utilization,
  leads = [],
  projects = [],
  invoices = [],
  taskStats = { total: 0, todo: 0, inProgress: 0, done: 0, overdue: 0 },
  activities = [],
  availableTasks = [],
  availableResources = [],
  availableTools = [],
  users = [],
}: CEODashboardClientProps) {
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");

  // Calculate comprehensive executive metrics
  const totalRevenue = metrics?.revenue?.total || 0;
  const pendingRevenue = metrics?.revenue?.pending || 0;
  const revenueTrend = metrics?.revenue?.trend || 0;
  const recentRevenue = metrics?.revenue?.recent || 0;
  
  const activeProjectsCount = metrics?.projects?.active || 0;
  const completedProjectsCount = metrics?.projects?.completed || 0;
  const totalProjectsCount = projects?.length || 0;
  const avgProjectValue = metrics?.projects?.avgValue || 0;
  
  const conversionRate = metrics?.leads?.conversionRate || 0;
  const completionRate = metrics?.tasks?.completionRate || 0;
  
  const activeTeamMembers = users?.length || 0;
  const teamUtilization = utilization?.users?.utilization || 0;
  
  const newLeadsCount = leads?.filter((l: any) => l?.status === "NEW").length || 0;
  const totalLeadsCount = leads?.length || 0;
  const qualifiedLeadsCount = leads?.filter((l: any) => l?.status === "QUALIFIED").length || 0;
  
  const overdueInvoices = invoices?.filter((i: any) => i?.status === "OVERDUE").length || 0;
  const pendingInvoices = invoices?.filter((i: any) => i?.status === "SENT").length || 0;
  const paidInvoices = invoices?.filter((i: any) => i?.status === "PAID").length || 0;
  
  const activeTasks = (taskStats?.todo || 0) + (taskStats?.inProgress || 0);
  const overdueTasks = taskStats?.overdue || 0;
  const completedTasks = taskStats?.done || 0;

  // Navigation tabs configuration
  const tabs = [
    { id: "overview" as DashboardTab, label: "Executive Overview", icon: Crown, color: "purple" },
    { id: "financials" as DashboardTab, label: "Financial Health", icon: CircleDollarSign, color: "emerald" },
    { id: "operations" as DashboardTab, label: "Operations", icon: Briefcase, color: "blue" },
    { id: "analytics" as DashboardTab, label: "Analytics", icon: BarChart3, color: "cyan" },
    { id: "team" as DashboardTab, label: "Team", icon: Users, color: "amber" },
    { id: "learning" as DashboardTab, label: "Learning", icon: BookOpen, color: "rose" },
  ];

  // Get tab color classes
  const getTabColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      purple: "border-purple-500 text-purple-500 bg-purple-500/10",
      emerald: "border-emerald-500 text-emerald-500 bg-emerald-500/10",
      blue: "border-blue-500 text-blue-500 bg-blue-500/10",
      cyan: "border-cyan-500 text-cyan-500 bg-cyan-500/10",
      amber: "border-amber-500 text-amber-500 bg-amber-500/10",
      rose: "border-rose-500 text-rose-500 bg-rose-500/10",
    };
    return colors[color] || colors.purple;
  };

  // Render Team Management tab
  if (activeTab === "team") {
    return (
      <div className="space-y-6 pb-8">
        {renderHeader()}
        <TeamManagementClient
          workload={workload}
          users={users}
          availableTasks={availableTasks}
          availableResources={availableResources}
          availableTools={availableTools}
        />
      </div>
    );
  }

  // Render Learning Hub tab
  if (activeTab === "learning") {
    return (
      <div className="space-y-6 pb-8">
        {renderHeader()}
        <LearningHubManagementClient
          resources={availableResources}
          tools={availableTools}
        />
      </div>
    );
  }

  // Render Financial Health tab
  if (activeTab === "financials") {
    return (
      <div className="space-y-6 pb-8">
        {renderHeader()}
        {renderFinancialsTab()}
      </div>
    );
  }

  // Render Operations tab
  if (activeTab === "operations") {
    return (
      <div className="space-y-6 pb-8">
        {renderHeader()}
        {renderOperationsTab()}
      </div>
    );
  }

  // Render Analytics tab
  if (activeTab === "analytics") {
    return (
      <div className="space-y-6 pb-8">
        {renderHeader()}
        {renderAnalyticsTab()}
      </div>
    );
  }

  // Header component
  function renderHeader() {
    return (
      <div className="space-y-4">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl"
        >
          {/* Animated background gradients */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-blue-600/20 to-cyan-600/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
          
          {/* Animated glow orbs */}
          <motion.div 
            className="absolute -top-24 -left-24 w-48 h-48 bg-purple-500/30 rounded-full blur-3xl"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute -bottom-24 -right-24 w-48 h-48 bg-cyan-500/30 rounded-full blur-3xl"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />

          <div className="relative z-10 p-8 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 shadow-lg shadow-purple-500/50"
                  >
                    <Crown className="w-7 h-7 text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
                      CEO Executive Dashboard
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                      Complete business intelligence and control center
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowTaskModal(true)}
                  className="relative group px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 text-white font-medium shadow-lg shadow-purple-500/25 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative flex items-center gap-2">
                    <Rocket className="w-4 h-4" />
                    Assign Tasks
                  </span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAssignmentModal(true)}
                  className="relative group px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-500 to-blue-600 text-white font-medium shadow-lg shadow-cyan-500/25 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Assign Resources
                  </span>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 border-b border-white/10">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-lg border-2 transition-all whitespace-nowrap ${
                  isActive
                    ? getTabColorClasses(tab.color)
                    : "border-transparent text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium text-sm">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Financials Tab Content
  function renderFinancialsTab() {
    return (
      <div className="space-y-6">
        {/* Financial KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <FinancialKPICard
            title="Total Revenue"
            value={formatCurrency(totalRevenue)}
            trend={revenueTrend}
            subtitle="All time"
            icon={DollarSign}
            color="emerald"
          />
          <FinancialKPICard
            title="Pending Revenue"
            value={formatCurrency(pendingRevenue)}
            subtitle={`${pendingInvoices + overdueInvoices} invoices`}
            icon={Clock}
            color="amber"
            alert={overdueInvoices > 0}
          />
          <FinancialKPICard
            title="Recent Revenue"
            value={formatCurrency(recentRevenue)}
            subtitle="Last 30 days"
            icon={TrendingUp}
            color="blue"
          />
          <FinancialKPICard
            title="Avg Project Value"
            value={formatCurrency(avgProjectValue)}
            subtitle="Per project"
            icon={Target}
            color="purple"
          />
        </div>

        {/* Revenue Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SectionCard title="Revenue Distribution">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-slate-400">Paid</span>
                  <span className="text-sm text-emerald-400 font-semibold">
                    {formatCurrency(totalRevenue)}
                  </span>
                </div>
                <div className="relative w-full bg-slate-800/50 rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${(totalRevenue / (totalRevenue + pendingRevenue)) * 100}%`
                    }}
                    transition={{ delay: 0.3, duration: 1, ease: "easeOut" }}
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full"
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-slate-400">Pending</span>
                  <span className="text-sm text-amber-400 font-semibold">
                    {formatCurrency(pendingRevenue)}
                  </span>
                </div>
                <div className="relative w-full bg-slate-800/50 rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${(pendingRevenue / (totalRevenue + pendingRevenue)) * 100}%`
                    }}
                    transition={{ delay: 0.4, duration: 1, ease: "easeOut" }}
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full"
                  />
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Invoice Status">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm text-slate-300">Paid</span>
                </div>
                <span className="text-lg font-bold text-white">{paidInvoices}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-amber-400" />
                  <span className="text-sm text-slate-300">Pending</span>
                </div>
                <span className="text-lg font-bold text-white">{pendingInvoices}</span>
              </div>
              {overdueInvoices > 0 && (
                <div className="flex justify-between items-center p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <span className="text-sm text-slate-300">Overdue</span>
                  </div>
                  <span className="text-lg font-bold text-red-400">{overdueInvoices}</span>
                </div>
              )}
            </div>
          </SectionCard>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/invoices"
            className="group p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-slate-900 border border-emerald-500/20 hover:border-emerald-500/40 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <CreditCard className="w-6 h-6 text-emerald-400" />
              <ArrowUpRight className="w-4 h-4 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">Manage Invoices</h3>
            <p className="text-sm text-slate-400">View and send invoices</p>
          </Link>

          <Link
            href="/admin/ceo/finances"
            className="group p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-slate-900 border border-blue-500/20 hover:border-blue-500/40 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="w-6 h-6 text-blue-400" />
              <ArrowUpRight className="w-4 h-4 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">Financial Reports</h3>
            <p className="text-sm text-slate-400">Detailed analytics</p>
          </Link>

          <Link
            href="/admin/subscriptions"
            className="group p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-slate-900 border border-purple-500/20 hover:border-purple-500/40 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <Package className="w-6 h-6 text-purple-400" />
              <ArrowUpRight className="w-4 h-4 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">Subscriptions</h3>
            <p className="text-sm text-slate-400">Recurring revenue</p>
          </Link>
        </div>
      </div>
    );
  }

  // Operations Tab Content
  function renderOperationsTab() {
    return (
      <div className="space-y-6">
        {/* Operations KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <OperationsKPICard
            title="Active Projects"
            value={activeProjectsCount}
            subtitle={`${totalProjectsCount} total`}
            icon={Briefcase}
            color="cyan"
          />
          <OperationsKPICard
            title="Completed Projects"
            value={completedProjectsCount}
            subtitle={`${Math.round((completedProjectsCount / totalProjectsCount) * 100) || 0}% completion rate`}
            icon={CheckCircle2}
            color="emerald"
          />
          <OperationsKPICard
            title="Active Tasks"
            value={activeTasks}
            subtitle={`${overdueTasks} overdue`}
            icon={Target}
            color="blue"
            alert={overdueTasks > 0}
          />
          <OperationsKPICard
            title="Team Members"
            value={activeTeamMembers}
            subtitle={`${Math.round(teamUtilization)}% utilized`}
            icon={Users}
            color="purple"
          />
        </div>

        {/* Project & Task Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SectionCard title="Project Pipeline">
            <div className="space-y-4">
              <Link
                href="/admin/pipeline"
                className="group flex items-center justify-between p-4 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-all border border-white/5 hover:border-cyan-500/20"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-500/20">
                    <Activity className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Total Leads</p>
                    <p className="text-xs text-slate-400">{newLeadsCount} new this week</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-white">{totalLeadsCount}</span>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                </div>
              </Link>

              <Link
                href="/admin/pipeline/projects"
                className="group flex items-center justify-between p-4 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-all border border-white/5 hover:border-blue-500/20"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <Briefcase className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Active Projects</p>
                    <p className="text-xs text-slate-400">{completedProjectsCount} completed</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-white">{activeProjectsCount}</span>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
                </div>
              </Link>
            </div>
          </SectionCard>

          <SectionCard title="Task Management">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/30 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <Clock className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">In Progress</p>
                    <p className="text-xs text-slate-400">Active tasks</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-white">{taskStats?.inProgress || 0}</span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/30 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/20">
                    <AlertCircle className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">To Do</p>
                    <p className="text-xs text-slate-400">Pending tasks</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-white">{taskStats?.todo || 0}</span>
              </div>

              {overdueTasks > 0 && (
                <div className="flex items-center justify-between p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-500/20">
                      <AlertCircle className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Overdue</p>
                      <p className="text-xs text-red-400">Requires attention</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-red-400">{overdueTasks}</span>
                </div>
              )}
            </div>
          </SectionCard>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link
            href="/admin/tasks"
            className="group p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-slate-900 border border-blue-500/20 hover:border-blue-500/40 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 className="w-6 h-6 text-blue-400" />
              <ArrowUpRight className="w-4 h-4 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">All Tasks</h3>
            <p className="text-sm text-slate-400">Manage team tasks</p>
          </Link>

          <Link
            href="/admin/ceo/team-management"
            className="group p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-slate-900 border border-purple-500/20 hover:border-purple-500/40 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <Users className="w-6 h-6 text-purple-400" />
              <ArrowUpRight className="w-4 h-4 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">Team</h3>
            <p className="text-sm text-slate-400">Manage members</p>
          </Link>

          <Link
            href="/admin/ceo/systems"
            className="group p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-slate-900 border border-cyan-500/20 hover:border-cyan-500/40 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <Settings className="w-6 h-6 text-cyan-400" />
              <ArrowUpRight className="w-4 h-4 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">Systems</h3>
            <p className="text-sm text-slate-400">Automations & logs</p>
          </Link>

          <Link
            href="/admin/database"
            className="group p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-slate-900 border border-emerald-500/20 hover:border-emerald-500/40 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <Database className="w-6 h-6 text-emerald-400" />
              <ArrowUpRight className="w-4 h-4 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">Database</h3>
            <p className="text-sm text-slate-400">View all data</p>
          </Link>
        </div>
      </div>
    );
  }

  // Analytics Tab Content
  function renderAnalyticsTab() {
    return (
      <div className="space-y-6">
        {/* Analytics KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <AnalyticsKPICard
            title="Conversion Rate"
            value={`${Math.round(conversionRate)}%`}
            subtitle="Lead to client"
            icon={Target}
            color="purple"
          />
          <AnalyticsKPICard
            title="Completion Rate"
            value={`${Math.round(completionRate)}%`}
            subtitle="Task efficiency"
            icon={CheckCircle2}
            color="emerald"
          />
          <AnalyticsKPICard
            title="Team Utilization"
            value={`${Math.round(teamUtilization)}%`}
            subtitle="Resource capacity"
            icon={Users}
            color="blue"
          />
          <AnalyticsKPICard
            title="Revenue Growth"
            value={`${revenueTrend >= 0 ? '+' : ''}${Math.round(revenueTrend)}%`}
            subtitle="vs last period"
            icon={revenueTrend >= 0 ? TrendingUp : TrendingDown}
            color={revenueTrend >= 0 ? "emerald" : "red"}
          />
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SectionCard title="Business Performance">
            <div className="space-y-4">
              <MetricRow
                label="Active Clients"
                value={activeProjectsCount}
                total={totalProjectsCount}
                color="cyan"
              />
              <MetricRow
                label="Qualified Leads"
                value={qualifiedLeadsCount}
                total={totalLeadsCount}
                color="purple"
              />
              <MetricRow
                label="Completed Tasks"
                value={completedTasks}
                total={completedTasks + activeTasks}
                color="emerald"
              />
              <MetricRow
                label="Paid Invoices"
                value={paidInvoices}
                total={paidInvoices + pendingInvoices + overdueInvoices}
                color="blue"
              />
            </div>
          </SectionCard>

          <SectionCard title="Resource Utilization">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-slate-400">Learning Resources</span>
                  <span className="text-sm text-white font-medium">{utilization?.resources?.learning || 0}</span>
                </div>
                <div className="relative w-full bg-slate-800/50 rounded-full h-2">
                  <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" style={{width: '75%'}} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-slate-400">Tools Available</span>
                  <span className="text-sm text-white font-medium">{utilization?.resources?.tools || 0}</span>
                </div>
                <div className="relative w-full bg-slate-800/50 rounded-full h-2">
                  <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" style={{width: '85%'}} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-slate-400">Active Automations</span>
                  <span className="text-sm text-white font-medium">{utilization?.resources?.automations || 0}</span>
                </div>
                <div className="relative w-full bg-slate-800/50 rounded-full h-2">
                  <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" style={{width: '60%'}} />
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/ceo/analytics"
            className="group p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-slate-900 border border-purple-500/20 hover:border-purple-500/40 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="w-6 h-6 text-purple-400" />
              <ArrowUpRight className="w-4 h-4 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">Detailed Analytics</h3>
            <p className="text-sm text-slate-400">View full reports</p>
          </Link>

          <Link
            href="/admin/reports"
            className="group p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-slate-900 border border-blue-500/20 hover:border-blue-500/40 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-6 h-6 text-blue-400" />
              <ArrowUpRight className="w-4 h-4 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">Export Reports</h3>
            <p className="text-sm text-slate-400">Download data</p>
          </Link>

          <Link
            href="/admin/feed"
            className="group p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-slate-900 border border-cyan-500/20 hover:border-cyan-500/40 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-6 h-6 text-cyan-400" />
              <ArrowUpRight className="w-4 h-4 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">Activity Feed</h3>
            <p className="text-sm text-slate-400">Recent updates</p>
          </Link>
        </div>
      </div>
    );
  }

  // Overview Tab (Default)
  return (
    <div className="space-y-6 pb-8">
      {renderHeader()}

      {/* Executive Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ExecutiveKPICard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          trend={revenueTrend}
          subtitle={`+${formatCurrency(recentRevenue)} this month`}
          icon={DollarSign}
          color="emerald"
        />
        <ExecutiveKPICard
          title="Active Projects"
          value={activeProjectsCount}
          subtitle={`${completedProjectsCount} completed`}
          icon={Briefcase}
          color="cyan"
          badge={{ text: "Live", icon: Flame }}
        />
        <ExecutiveKPICard
          title="Conversion Rate"
          value={`${Math.round(conversionRate)}%`}
          subtitle="Lead to client"
          icon={Target}
          color="purple"
        />
        <ExecutiveKPICard
          title="Team Performance"
          value={`${Math.round(completionRate)}%`}
          subtitle={`${activeTeamMembers} members`}
          icon={Users}
          color="blue"
        />
      </div>

      {/* Business Health Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SectionCard title="Business Health">
            <div className="grid grid-cols-2 gap-4">
              <HealthMetric
                label="Revenue Status"
                value="Healthy"
                percentage={85}
                color="emerald"
                icon={DollarSign}
              />
              <HealthMetric
                label="Pipeline Status"
                value="Strong"
                percentage={75}
                color="blue"
                icon={Activity}
              />
              <HealthMetric
                label="Team Capacity"
                value="Optimal"
                percentage={teamUtilization}
                color="purple"
                icon={Users}
              />
              <HealthMetric
                label="Client Satisfaction"
                value="Excellent"
                percentage={92}
                color="amber"
                icon={Star}
              />
            </div>
          </SectionCard>
        </div>

        <SectionCard title="Critical Alerts">
          {overdueInvoices > 0 && (
            <div className="mb-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-white">Overdue Invoices</p>
                  <p className="text-xs text-slate-400 mt-1">{overdueInvoices} invoices need attention</p>
                </div>
              </div>
            </div>
          )}
          {overdueTasks > 0 && (
            <div className="mb-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-white">Overdue Tasks</p>
                  <p className="text-xs text-slate-400 mt-1">{overdueTasks} tasks past deadline</p>
                </div>
              </div>
            </div>
          )}
          {newLeadsCount > 0 && (
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-start gap-3">
                <UserCheck className="w-5 h-5 text-green-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-white">New Leads</p>
                  <p className="text-xs text-slate-400 mt-1">{newLeadsCount} leads this week</p>
                </div>
              </div>
            </div>
          )}
          {overdueInvoices === 0 && overdueTasks === 0 && newLeadsCount === 0 && (
            <div className="text-center py-8">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm text-slate-400">All systems operational</p>
            </div>
          )}
        </SectionCard>
      </div>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickAccessCard
          title="Pipeline"
          description="Manage leads & projects"
          href="/admin/pipeline"
          icon={Activity}
          color="indigo"
          stats={`${totalLeadsCount} leads, ${activeProjectsCount} active`}
        />
        <QuickAccessCard
          title="Finances"
          description="Revenue & invoicing"
          href="/admin/ceo/finances"
          icon={DollarSign}
          color="emerald"
          stats={formatCurrency(totalRevenue)}
        />
        <QuickAccessCard
          title="Team"
          description="Member management"
          href="/admin/ceo/team-management"
          icon={Users}
          color="purple"
          stats={`${activeTeamMembers} members`}
        />
        <QuickAccessCard
          title="Systems"
          description="Automations & logs"
          href="/admin/ceo/systems"
          icon={Settings}
          color="cyan"
          stats={`${utilization?.resources?.automations || 0} active`}
        />
      </div>

      {/* Recent Activity */}
      {activities && activities.length > 0 && (
        <SectionCard title="Recent Activity">
          <div className="space-y-3">
            {activities.slice(0, 6).map((activity: any, idx: number) => (
              <div
                key={activity.id || idx}
                className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors border border-white/5"
              >
                <div className="p-2 rounded-lg bg-cyan-500/20">
                  <Activity className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{activity.title}</p>
                  <p className="text-xs text-slate-400 mt-1">{activity.description || "No description"}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {activity.createdAt ? new Date(activity.createdAt).toLocaleDateString() : "Recently"}
                  </p>
                </div>
              </div>
            ))}
            <Link
              href="/admin/feed"
              className="block text-center text-sm text-cyan-400 hover:text-cyan-300 transition-colors pt-2"
            >
              View all activity →
            </Link>
          </div>
        </SectionCard>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showTaskModal && (
          <AssignTaskModal
            isOpen={showTaskModal}
            onClose={() => setShowTaskModal(false)}
            onSuccess={() => setShowTaskModal(false)}
          />
        )}
        {showAssignmentModal && (
          <TeamAssignmentModal
            onClose={() => setShowAssignmentModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper Components
interface KPICardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: any;
  color: string;
  trend?: number;
  alert?: boolean;
  badge?: { text: string; icon: any };
}

function ExecutiveKPICard({ title, value, subtitle, icon: Icon, color, trend, badge }: KPICardProps) {
  const colorClasses: Record<string, string> = {
    emerald: "from-emerald-500/10 border-emerald-500/20 text-emerald-400 bg-emerald-500/20 ring-emerald-500/30",
    cyan: "from-cyan-500/10 border-cyan-500/20 text-cyan-400 bg-cyan-500/20 ring-cyan-500/30",
    purple: "from-purple-500/10 border-purple-500/20 text-purple-400 bg-purple-500/20 ring-purple-500/30",
    blue: "from-blue-500/10 border-blue-500/20 text-blue-400 bg-blue-500/20 ring-blue-500/30",
    amber: "from-amber-500/10 border-amber-500/20 text-amber-400 bg-amber-500/20 ring-amber-500/30",
  };
  
  const classes = colorClasses[color] || colorClasses.purple;
  const [bgFrom, borderColor, textColor, bgColor, ringColor] = classes.split(' ');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${bgFrom} via-slate-900/90 to-slate-950 border ${borderColor} p-6 shadow-2xl`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${bgFrom} via-transparent to-transparent group-hover:opacity-50 transition-opacity`} />
      <motion.div
        className={`absolute -top-12 -right-12 w-32 h-32 ${bgFrom} opacity-20 rounded-full blur-3xl`}
        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
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
          {badge && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${bgColor} ${textColor}`}>
              <badge.icon className="w-3 h-3" />
              {badge.text}
            </div>
          )}
        </div>
        <p className="text-sm font-medium text-slate-400 mb-2">{title}</p>
        <p className="text-3xl font-bold text-white mb-1">{value}</p>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>
    </motion.div>
  );
}

function FinancialKPICard({ title, value, subtitle, icon: Icon, color, trend, alert }: KPICardProps) {
  return <ExecutiveKPICard title={title} value={value} subtitle={subtitle} icon={Icon} color={color} trend={trend} />;
}

function OperationsKPICard({ title, value, subtitle, icon, color, alert }: KPICardProps) {
  return <ExecutiveKPICard title={title} value={value} subtitle={subtitle} icon={icon} color={color} />;
}

function AnalyticsKPICard({ title, value, subtitle, icon, color }: KPICardProps) {
  return <ExecutiveKPICard title={title} value={value} subtitle={subtitle} icon={icon} color={color} />;
}

interface MetricRowProps {
  label: string;
  value: number;
  total: number;
  color: string;
}

function MetricRow({ label, value, total, color }: MetricRowProps) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className="text-sm text-slate-400">{label}</span>
        <span className="text-sm text-white font-medium">{value} / {total}</span>
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

interface HealthMetricProps {
  label: string;
  value: string;
  percentage: number;
  color: string;
  icon: any;
}

function HealthMetric({ label, value, percentage, color, icon: Icon }: HealthMetricProps) {
  return (
    <div className="p-4 rounded-xl bg-slate-800/30 border border-white/5">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg bg-${color}-500/20`}>
          <Icon className={`w-5 h-5 text-${color}-400`} />
        </div>
        <div className="flex-1">
          <p className="text-xs text-slate-400">{label}</p>
          <p className="text-sm font-semibold text-white">{value}</p>
        </div>
      </div>
      <div className="relative w-full bg-slate-800/50 rounded-full h-2">
        <div 
          className={`absolute inset-y-0 left-0 bg-gradient-to-r from-${color}-500 to-${color}-600 rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-slate-500 mt-1">{Math.round(percentage)}%</p>
    </div>
  );
}

interface QuickAccessCardProps {
  title: string;
  description: string;
  href: string;
  icon: any;
  color: string;
  stats: string;
}

function QuickAccessCard({ title, description, href, icon: Icon, color, stats }: QuickAccessCardProps) {
  return (
    <Link
      href={href}
      className={`group p-5 rounded-xl bg-gradient-to-br from-${color}-500/10 to-slate-900 border border-${color}-500/20 hover:border-${color}-500/40 transition-all shadow-lg`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2.5 rounded-lg bg-${color}-500/20`}>
          <Icon className={`w-6 h-6 text-${color}-400`} />
        </div>
        <ArrowUpRight className={`w-4 h-4 text-${color}-400 opacity-0 group-hover:opacity-100 transition-opacity`} />
      </div>
      <h3 className="text-base font-semibold text-white mb-1">{title}</h3>
      <p className="text-xs text-slate-400 mb-2">{description}</p>
      <p className={`text-xs font-medium text-${color}-400`}>{stats}</p>
    </Link>
  );
}
