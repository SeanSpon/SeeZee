"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target,
  CheckCircle,
  Circle,
  ChevronDown,
  ChevronRight,
  Clock,
  User,
  AlertCircle,
  Calendar,
  Plus,
  MoreHorizontal,
  Loader2,
  Flag,
  Sparkles,
} from "lucide-react";
import { AITaskGenerator } from "./AITaskGenerator";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: Date | string | null;
  estimatedHours: number | null;
  completedAt: Date | string | null;
  assignedTo?: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  milestoneId?: string | null;
  aiGenerated?: boolean;
}

interface Milestone {
  id: string;
  name: string; // Using name to match data from parent
  title?: string;
  description: string | null;
  dueDate: Date | string | null;
  completed: boolean;
  completedAt?: Date | string | null;
}

interface MilestoneTasksViewProps {
  projectId: string;
  milestones: Milestone[];
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onMilestoneComplete?: (milestoneId: string) => void;
  onAddTask?: (milestoneId?: string) => void;
  onRefresh?: () => void;
  isAdmin?: boolean;
}

export function MilestoneTasksView({
  projectId,
  milestones,
  tasks,
  onTaskClick,
  onMilestoneComplete,
  onAddTask,
  onRefresh,
  isAdmin = false,
}: MilestoneTasksViewProps) {
  const [expandedMilestones, setExpandedMilestones] = useState<Set<string>>(
    new Set(milestones.filter((m) => !m.completed).map((m) => m.id))
  );

  const toggleMilestone = (milestoneId: string) => {
    setExpandedMilestones((prev) => {
      const next = new Set(prev);
      if (next.has(milestoneId)) {
        next.delete(milestoneId);
      } else {
        next.add(milestoneId);
      }
      return next;
    });
  };

  // Group tasks by milestone
  const tasksByMilestone: Record<string, Task[]> = {};
  const unassignedTasks: Task[] = [];

  tasks.forEach((task) => {
    if (task.milestoneId) {
      if (!tasksByMilestone[task.milestoneId]) {
        tasksByMilestone[task.milestoneId] = [];
      }
      tasksByMilestone[task.milestoneId].push(task);
    } else {
      unassignedTasks.push(task);
    }
  });

  // Calculate milestone progress
  const getMilestoneProgress = (milestoneId: string) => {
    const milestoneTasks = tasksByMilestone[milestoneId] || [];
    if (milestoneTasks.length === 0) return 0;
    const completed = milestoneTasks.filter((t) => t.status === "DONE" || t.completedAt).length;
    return Math.round((completed / milestoneTasks.length) * 100);
  };

  const priorityColors: Record<string, string> = {
    LOW: "text-blue-400",
    MEDIUM: "text-amber-400",
    HIGH: "text-red-400",
  };

  const statusColors: Record<string, { bg: string; text: string }> = {
    TODO: { bg: "bg-slate-500/20", text: "text-slate-400" },
    IN_PROGRESS: { bg: "bg-blue-500/20", text: "text-blue-400" },
    SUBMITTED: { bg: "bg-purple-500/20", text: "text-purple-400" },
    DONE: { bg: "bg-emerald-500/20", text: "text-emerald-400" },
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString();
  };

  const isOverdue = (date: Date | string | null) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* AI Task Generator */}
      {isAdmin && (
        <div className="flex items-center justify-between">
          <AITaskGenerator
            projectId={projectId}
            milestones={milestones}
            onTasksCreated={onRefresh}
          />
        </div>
      )}

      {/* Milestones with Tasks */}
      <div className="space-y-4">
        {milestones.map((milestone) => {
          const isExpanded = expandedMilestones.has(milestone.id);
          const milestoneTasks = tasksByMilestone[milestone.id] || [];
          const progress = getMilestoneProgress(milestone.id);
          const hasOverdueTasks = milestoneTasks.some(
            (t) => isOverdue(t.dueDate) && !t.completedAt
          );

          return (
            <div
              key={milestone.id}
              className={`rounded-xl border overflow-hidden ${
                milestone.completed
                  ? "bg-white/5 border-white/10"
                  : "bg-white/5 border-white/10"
              }`}
            >
              {/* Milestone Header */}
              <button
                onClick={() => toggleMilestone(milestone.id)}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-white/5 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  {milestone.completed ? (
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center border-2 border-emerald-500/30">
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center border-2 border-purple-500/30">
                      <Target className="w-5 h-5 text-purple-400" />
                    </div>
                  )}
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white group-hover:text-purple-300 transition-colors">
                        {milestone.name}
                      </h3>
                      {milestone.completed && (
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded-full uppercase">
                          Done
                        </span>
                      )}
                      {hasOverdueTasks && !milestone.completed && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500/20 text-red-300 text-[10px] font-bold rounded-full uppercase">
                          <AlertCircle className="w-3 h-3" />
                          Overdue
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-white/50 mt-1">
                      <span className="font-medium">{milestoneTasks.length} task{milestoneTasks.length !== 1 ? "s" : ""}</span>
                      {milestone.dueDate && (
                        <>
                          <span className="text-white/20">•</span>
                          <span
                            className={
                              !milestone.completed && isOverdue(milestone.dueDate)
                                ? "text-red-400 font-medium"
                                : "text-white/50"
                            }
                          >
                            Due {formatDate(milestone.dueDate)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Progress Bar */}
                  {!milestone.completed && milestoneTasks.length > 0 && (
                    <div className="hidden md:flex items-center gap-3 min-w-[140px]">
                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            progress === 100 ? 'bg-emerald-500' : 'bg-purple-500'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-white w-12 text-right">
                        {progress}%
                      </span>
                    </div>
                  )}
                  {milestone.completed && (
                    <span className="hidden md:block text-sm font-semibold text-emerald-400">
                      Completed
                    </span>
                  )}
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-white/50 group-hover:text-white transition-colors" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-white/50 group-hover:text-white transition-colors" />
                  )}
                </div>
              </button>

              {/* Tasks */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-white/10"
                  >
                    {milestoneTasks.length === 0 ? (
                      <div className="px-4 py-8 text-center bg-gradient-to-b from-white/5 to-transparent">
                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                          <Target className="w-6 h-6 text-white/30" />
                        </div>
                        <p className="text-sm text-white/50 mb-4 font-medium">No tasks for this milestone yet</p>
                        {isAdmin && (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => onAddTask?.(milestone.id)}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 hover:border-purple-500/50 text-purple-300 hover:text-white text-sm font-medium rounded-lg transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                              Add Task to Milestone
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="divide-y divide-white/5">
                        {milestoneTasks.map((task) => {
                          const statusConfig = statusColors[task.status] || statusColors.TODO;
                          const taskIsOverdue = isOverdue(task.dueDate) && !task.completedAt;

                          return (
                            <div
                              key={task.id}
                              onClick={() => onTaskClick?.(task)}
                              className={`px-4 py-3 flex items-center gap-3 hover:bg-white/5 cursor-pointer transition-colors group ${
                                task.completedAt ? "opacity-60" : ""
                              }`}
                            >
                              {/* Status Indicator */}
                              <div
                                className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 ${statusConfig.bg} ${
                                  task.completedAt ? statusConfig.bg : 'border-white/10'
                                }`}
                              >
                                {task.completedAt ? (
                                  <CheckCircle className={`w-4 h-4 ${statusConfig.text}`} />
                                ) : (
                                  <Circle className={`w-4 h-4 ${statusConfig.text}`} />
                                )}
                              </div>

                              {/* Task Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`text-sm font-medium group-hover:text-purple-300 transition-colors ${
                                      task.completedAt ? "text-white/40" : "text-white"
                                    }`}
                                  >
                                    {task.title}
                                  </span>
                                  {task.aiGenerated && (
                                    <span className="flex items-center gap-1 px-1.5 py-0.5 bg-purple-500/20 rounded text-[9px] text-purple-300 font-bold uppercase" title="AI Generated">
                                      <Sparkles className="w-2.5 h-2.5" />
                                      AI
                                    </span>
                                  )}
                                </div>
                                {task.description && (
                                  <p className="text-xs text-white/40 truncate mt-1">
                                    {task.description}
                                  </p>
                                )}
                              </div>

                              {/* Meta Info */}
                              <div className="flex items-center gap-3 text-xs text-white/40">
                                {task.priority && (
                                  <Flag
                                    className={`w-3 h-3 ${priorityColors[task.priority] || "text-white/40"}`}
                                  />
                                )}
                                {task.estimatedHours && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {task.estimatedHours}h
                                  </span>
                                )}
                                {task.dueDate && (
                                  <span
                                    className={`flex items-center gap-1 ${
                                      taskIsOverdue ? "text-red-400" : ""
                                    }`}
                                  >
                                    <Calendar className="w-3 h-3" />
                                    {formatDate(task.dueDate)}
                                  </span>
                                )}
                                {task.assignedTo && (
                                  <span className="flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    {task.assignedTo.name?.split(" ")[0] || "Assigned"}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {/* Add Task Button */}
                        {isAdmin && (
                          <button
                            onClick={() => onAddTask?.(milestone.id)}
                            className="w-full px-4 py-3 flex items-center justify-center gap-2 text-sm font-medium text-purple-300 hover:text-white bg-purple-500/5 hover:bg-purple-500/10 border-t border-white/5 hover:border-purple-500/20 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                            Add task to {milestone.name}
                          </button>
                        )}
                      </div>
                    )}

                    {/* Complete Milestone Button */}
                    {isAdmin && !milestone.completed && milestoneTasks.length > 0 && progress === 100 && (
                      <div className="px-4 py-4 bg-gradient-to-r from-emerald-500/10 to-green-500/10 border-t-2 border-emerald-500/30">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-emerald-400" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-emerald-300">All tasks complete!</p>
                            <p className="text-xs text-emerald-400/60">Ready to mark this milestone as done</p>
                          </div>
                        </div>
                        <button
                          onClick={() => onMilestoneComplete?.(milestone.id)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-lg transition-all shadow-lg shadow-emerald-500/20"
                        >
                          <CheckCircle className="w-5 h-5" />
                          Mark Milestone Complete
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Unassigned Tasks */}
      {unassignedTasks.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10">
            <h3 className="font-semibold text-white/70">Unassigned Tasks</h3>
            <p className="text-xs text-white/40">Tasks not linked to any milestone</p>
          </div>
          <div className="divide-y divide-white/5">
            {unassignedTasks.map((task) => {
              const statusConfig = statusColors[task.status] || statusColors.TODO;
              const taskIsOverdue = isOverdue(task.dueDate) && !task.completedAt;

              return (
                <div
                  key={task.id}
                  onClick={() => onTaskClick?.(task)}
                  className={`px-4 py-3 flex items-center gap-3 hover:bg-white/5 cursor-pointer transition-colors ${
                    task.completedAt ? "opacity-60" : ""
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center ${statusConfig.bg}`}
                  >
                    {task.completedAt ? (
                      <CheckCircle className={`w-3 h-3 ${statusConfig.text}`} />
                    ) : (
                      <Circle className={`w-3 h-3 ${statusConfig.text}`} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span
                      className={`text-sm ${
                        task.completedAt ? "text-white/50 line-through" : "text-white"
                      }`}
                    >
                      {task.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-white/40">
                    {task.dueDate && (
                      <span className={taskIsOverdue ? "text-red-400" : ""}>
                        {formatDate(task.dueDate)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
