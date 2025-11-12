/**
 * CEO Task Assignment Page
 */

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SectionCard } from "@/components/admin/SectionCard";
import { Crown, Rocket, CheckCircle2, Users, Zap, Sparkles } from "lucide-react";
import AssignTaskModal from "@/components/ceo/AssignTaskModal";
import { TeamAssignmentModal } from "@/components/ceo/TeamAssignmentModal";

export default function CEOTasksPage() {
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);

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
                  Task Assignment Center
                </h1>
              </div>
              <p className="text-slate-400 text-lg ml-[60px]">
                Create and assign tasks to team members efficiently
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

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <SectionCard title="Quick Actions">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  Create New Task
                </h3>
                <p className="text-sm text-slate-400 mb-4">
                  Assign tasks to team members quickly
                </p>
                <div className="flex items-center gap-1 text-xs text-green-400 font-medium">
                  Open <Rocket className="w-3 h-3" />
                </div>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAssignmentModal(true)}
              className="group relative overflow-hidden p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-slate-900 border border-blue-500/20 hover:border-blue-500/40 transition-all text-left shadow-lg"
            >
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors ring-1 ring-blue-500/30">
                    <Users className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white group-hover:text-blue-300 transition-colors">
                  Assign Resources
                </h3>
                <p className="text-sm text-slate-400 mb-4">
                  Assign learning resources, tools, or tasks
                </p>
                <div className="flex items-center gap-1 text-xs text-blue-400 font-medium">
                  Open <Sparkles className="w-3 h-3" />
                </div>
              </div>
            </motion.button>

            <motion.a
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              href="/admin/tasks"
              className="group relative overflow-hidden p-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-slate-900 border border-purple-500/20 hover:border-purple-500/40 transition-all text-left shadow-lg"
            >
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors ring-1 ring-purple-500/30">
                    <Zap className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white group-hover:text-purple-300 transition-colors">
                  View All Tasks
                </h3>
                <p className="text-sm text-slate-400 mb-4">
                  Manage and track all team tasks
                </p>
                <div className="flex items-center gap-1 text-xs text-purple-400 font-medium">
                  View <Rocket className="w-3 h-3" />
                </div>
              </div>
            </motion.a>
          </div>
        </SectionCard>
      </motion.div>

      {/* Modals */}
      {showTaskModal && (
        <AssignTaskModal
          isOpen={showTaskModal}
          onClose={() => setShowTaskModal(false)}
          onSuccess={() => setShowTaskModal(false)}
        />
      )}
      
      {showAssignmentModal && (
        <TeamAssignmentModal onClose={() => setShowAssignmentModal(false)} />
      )}
    </div>
  );
}

