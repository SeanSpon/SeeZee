"use client";

import { useState } from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";
import { formatCurrency } from "@/lib/ui";
import { TeamWorkloadTable } from "./TeamWorkloadTable";
import { TeamAssignmentModal } from "./TeamAssignmentModal";
import AssignTaskModal from "./AssignTaskModal";

interface CEODashboardClientProps {
  metrics: any;
  workload: any[];
  utilization: any;
}

export function CEODashboardClient({
  metrics,
  workload,
  utilization,
}: CEODashboardClientProps) {
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);

  return (
    <div className="space-y-6 pb-8">
      {/* Premium Header with Animated Gradient */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl"
      >
        {/* Animated background gradient */}
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
                  className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500"
                >
                  <Crown className="w-6 h-6 text-white" />
                </motion.div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
                  Executive Command Center
                </h1>
              </div>
              <p className="text-slate-400 text-lg ml-[60px]">
                Real-time business intelligence and team orchestration
              </p>
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

      {/* Premium KPI Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Revenue Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            whileHover={{ scale: 1.02, y: -4 }}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 via-slate-900/90 to-slate-950 border border-amber-500/20 p-6 shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 via-amber-500/0 to-amber-500/5 group-hover:from-amber-500/10 group-hover:via-amber-500/5 transition-all duration-500" />
            <motion.div
              className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/20 rounded-full blur-3xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 ring-1 ring-amber-500/30">
                  <DollarSign className="w-6 h-6 text-amber-400" />
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${
                  metrics.revenue.trend >= 0 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {metrics.revenue.trend >= 0 ? (
                    <ArrowUpRight className="w-3 h-3" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3" />
                  )}
                  {Math.abs(Math.round(metrics.revenue.trend))}%
                </div>
              </div>
              <p className="text-sm font-medium text-slate-400 mb-2">Total Revenue</p>
              <p className="text-3xl font-bold text-white mb-1">{formatCurrency(metrics.revenue.total)}</p>
              <p className="text-xs text-slate-500">vs last period</p>
            </div>
          </motion.div>

          {/* Active Projects Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            whileHover={{ scale: 1.02, y: -4 }}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500/10 via-slate-900/90 to-slate-950 border border-cyan-500/20 p-6 shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 via-cyan-500/0 to-cyan-500/5 group-hover:from-cyan-500/10 group-hover:via-cyan-500/5 transition-all duration-500" />
            <motion.div
              className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
            />
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 ring-1 ring-cyan-500/30">
                  <Activity className="w-6 h-6 text-cyan-400" />
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-cyan-500/20 text-cyan-400">
                  <Flame className="w-3 h-3" />
                  Live
                </div>
              </div>
              <p className="text-sm font-medium text-slate-400 mb-2">Active Projects</p>
              <p className="text-3xl font-bold text-white mb-1">{metrics.projects.active}</p>
              <p className="text-xs text-slate-500">in progress</p>
            </div>
          </motion.div>

          {/* Conversion Rate Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            whileHover={{ scale: 1.02, y: -4 }}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 via-slate-900/90 to-slate-950 border border-purple-500/20 p-6 shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-purple-500/0 to-purple-500/5 group-hover:from-purple-500/10 group-hover:via-purple-500/5 transition-all duration-500" />
            <motion.div
              className="absolute -top-12 -right-12 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 4, repeat: Infinity, delay: 1 }}
            />
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 ring-1 ring-purple-500/30">
                  <Target className="w-6 h-6 text-purple-400" />
                </div>
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <BarChart3 className="w-4 h-4 text-purple-400" />
                </div>
              </div>
              <p className="text-sm font-medium text-slate-400 mb-2">Conversion Rate</p>
              <p className="text-3xl font-bold text-white mb-1">{Math.round(metrics.leads.conversionRate)}%</p>
              <p className="text-xs text-slate-500">lead to client</p>
            </div>
          </motion.div>

          {/* Task Completion Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            whileHover={{ scale: 1.02, y: -4 }}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500/10 via-slate-900/90 to-slate-950 border border-green-500/20 p-6 shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 via-green-500/0 to-green-500/5 group-hover:from-green-500/10 group-hover:via-green-500/5 transition-all duration-500" />
            <motion.div
              className="absolute -top-12 -right-12 w-32 h-32 bg-green-500/20 rounded-full blur-3xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 4, repeat: Infinity, delay: 1.5 }}
            />
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/10 ring-1 ring-green-500/30">
                  <CheckCircle2 className="w-6 h-6 text-green-400" />
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-green-500/20 text-green-400">
                  <TrendingUp className="w-3 h-3" />
                  High
                </div>
              </div>
              <p className="text-sm font-medium text-slate-400 mb-2">Task Completion</p>
              <p className="text-3xl font-bold text-white mb-1">{Math.round(metrics.tasks.completionRate)}%</p>
              <p className="text-xs text-slate-500">completion rate</p>
            </div>
          </motion.div>
        </div>
      )}

      {/* Resource Utilization */}
      {utilization && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          {/* Team Utilization */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/10 via-slate-900/90 to-slate-950 border border-blue-500/20 p-6 shadow-2xl">
            <motion.div
              className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 4, repeat: Infinity, delay: 2 }}
            />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 ring-1 ring-blue-500/30">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Team Utilization</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-400">Active</span>
                  <span className="text-sm text-white font-medium">
                    {utilization.users.active} / {utilization.users.total}
                  </span>
                </div>
                <div className="relative w-full bg-slate-800/50 rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${utilization.users.utilization}%` }}
                    transition={{ delay: 0.6, duration: 1, ease: "easeOut" }}
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                  />
                </div>
                <p className="text-xs text-blue-400 font-medium">
                  {Math.round(utilization.users.utilization)}% capacity
                </p>
              </div>
            </div>
          </div>

          {/* Learning Resources */}
          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 via-slate-900/90 to-slate-950 border border-purple-500/20 p-6 shadow-2xl"
          >
            <motion.div
              className="absolute -top-12 -right-12 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 4, repeat: Infinity, delay: 2.5 }}
            />
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 ring-1 ring-purple-500/30">
                  <BookOpen className="w-6 h-6 text-purple-400" />
                </div>
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <PieChart className="w-4 h-4 text-purple-400" />
                </div>
              </div>
              <p className="text-sm font-medium text-slate-400 mb-2">Learning Resources</p>
              <p className="text-3xl font-bold text-white mb-1">{utilization.resources.learning}</p>
              <p className="text-xs text-slate-500">available courses</p>
            </div>
          </motion.div>

          {/* Tools Available */}
          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500/10 via-slate-900/90 to-slate-950 border border-cyan-500/20 p-6 shadow-2xl"
          >
            <motion.div
              className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 4, repeat: Infinity, delay: 3 }}
            />
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 ring-1 ring-cyan-500/30">
                  <Wrench className="w-6 h-6 text-cyan-400" />
                </div>
                <div className="p-2 rounded-lg bg-cyan-500/10">
                  <LineChart className="w-4 h-4 text-cyan-400" />
                </div>
              </div>
              <p className="text-sm font-medium text-slate-400 mb-2">Tools Available</p>
              <p className="text-3xl font-bold text-white mb-1">{utilization.resources.tools}</p>
              <p className="text-xs text-slate-500">in catalog</p>
            </div>
          </motion.div>

          {/* Active Automations */}
          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 via-slate-900/90 to-slate-950 border border-amber-500/20 p-6 shadow-2xl"
          >
            <motion.div
              className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/20 rounded-full blur-3xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 4, repeat: Infinity, delay: 3.5 }}
            />
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 ring-1 ring-amber-500/30">
                  <Zap className="w-6 h-6 text-amber-400" />
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-amber-500/20 text-amber-400">
                  <Sparkles className="w-3 h-3" />
                  Active
                </div>
              </div>
              <p className="text-sm font-medium text-slate-400 mb-2">Automations</p>
              <p className="text-3xl font-bold text-white mb-1">{utilization.resources.automations}</p>
              <p className="text-xs text-slate-500">running workflows</p>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Financial Overview */}
      {metrics && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <SectionCard title="Revenue Breakdown">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-slate-400">Received</span>
                  <span className="text-sm text-green-400 font-semibold">
                    {formatCurrency(metrics.revenue.total)}
                  </span>
                </div>
                <div className="relative w-full bg-slate-800/50 rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${(metrics.revenue.total / (metrics.revenue.total + metrics.revenue.pending)) * 100}%`
                    }}
                    transition={{ delay: 0.7, duration: 1, ease: "easeOut" }}
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-slate-400">Pending</span>
                  <span className="text-sm text-yellow-400 font-semibold">
                    {formatCurrency(metrics.revenue.pending)}
                  </span>
                </div>
                <div className="relative w-full bg-slate-800/50 rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${(metrics.revenue.pending / (metrics.revenue.total + metrics.revenue.pending)) * 100}%`
                    }}
                    transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full"
                  />
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Project Performance">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors">
                <span className="text-sm text-slate-400">In Progress</span>
                <span className="text-sm text-white font-bold text-lg">
                  {metrics.projects.active}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors">
                <span className="text-sm text-slate-400">Completed</span>
                <span className="text-sm text-white font-bold text-lg">
                  {metrics.projects.completed}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
                <span className="text-sm text-cyan-400 font-medium">Avg Value</span>
                <span className="text-sm text-white font-bold text-lg">
                  {formatCurrency(metrics.projects.avgValue)}
                </span>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Recent Performance">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors">
                <span className="text-sm text-slate-400">Last 30 Days</span>
                <span className="text-sm text-white font-bold text-lg">
                  {formatCurrency(metrics.revenue.recent)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                <span className="text-sm text-purple-400 font-medium">Trend</span>
                <span
                  className={`text-sm font-bold text-lg flex items-center gap-1 ${
                    metrics.revenue.trend >= 0
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {metrics.revenue.trend >= 0 ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  {metrics.revenue.trend >= 0 ? "+" : ""}
                  {Math.round(metrics.revenue.trend)}%
                </span>
              </div>
            </div>
          </SectionCard>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <SectionCard title="Quick Actions">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <motion.a
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              href="/ceo/training"
              className="group relative overflow-hidden p-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-slate-900 border border-purple-500/20 hover:border-purple-500/40 transition-all shadow-lg"
            >
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors ring-1 ring-purple-500/30">
                    <BookOpen className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white group-hover:text-purple-300 transition-colors">
                  Training
                </h3>
                <p className="text-sm text-slate-400 mb-4">
                  Create and assign training materials
                </p>
                <div className="flex items-center gap-1 text-xs text-purple-400 font-medium">
                  Manage hub <ArrowUpRight className="w-3 h-3" />
                </div>
              </div>
            </motion.a>

            <motion.a
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              href="/ceo/resources"
              className="group relative overflow-hidden p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-slate-900 border border-blue-500/20 hover:border-blue-500/40 transition-all shadow-lg"
            >
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors ring-1 ring-blue-500/30">
                    <BookOpen className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white group-hover:text-blue-300 transition-colors">
                  Resources
                </h3>
                <p className="text-sm text-slate-400 mb-4">
                  Share docs and materials
                </p>
                <div className="flex items-center gap-1 text-xs text-blue-400 font-medium">
                  View all <ArrowUpRight className="w-3 h-3" />
                </div>
              </div>
            </motion.a>

            <motion.a
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              href="/ceo/tools"
              className="group relative overflow-hidden p-6 rounded-xl bg-gradient-to-br from-cyan-500/10 to-slate-900 border border-cyan-500/20 hover:border-cyan-500/40 transition-all shadow-lg"
            >
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-cyan-500/20 group-hover:bg-cyan-500/30 transition-colors ring-1 ring-cyan-500/30">
                    <Wrench className="w-6 h-6 text-cyan-400" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white group-hover:text-cyan-300 transition-colors">
                  Tools
                </h3>
                <p className="text-sm text-slate-400 mb-4">
                  Manage software catalog
                </p>
                <div className="flex items-center gap-1 text-xs text-cyan-400 font-medium">
                  Browse <ArrowUpRight className="w-3 h-3" />
                </div>
              </div>
            </motion.a>

            <motion.button
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowTaskModal(true)}
              className="group relative overflow-hidden p-6 rounded-xl bg-gradient-to-br from-green-500/10 to-slate-900 border border-green-500/20 hover:border-green-500/40 transition-all text-left shadow-lg"
            >
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-green-500/20 group-hover:bg-green-500/30 transition-colors ring-1 ring-green-500/30">
                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white group-hover:text-green-300 transition-colors">
                  Assign Tasks
                </h3>
                <p className="text-sm text-slate-400 mb-4">
                  Create and assign quickly
                </p>
                <div className="flex items-center gap-1 text-xs text-green-400 font-medium">
                  Open <Rocket className="w-3 h-3" />
                </div>
              </div>
            </motion.button>
          </div>
        </SectionCard>
      </motion.div>

      {/* Team Workload */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <SectionCard title="Team Workload Distribution">
          <TeamWorkloadTable workload={workload} />
        </SectionCard>
      </motion.div>

      {/* Modals */}
      {showAssignmentModal && (
        <TeamAssignmentModal onClose={() => setShowAssignmentModal(false)} />
      )}
      
      <AssignTaskModal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        onSuccess={() => setShowTaskModal(false)}
      />
    </div>
  );
}
