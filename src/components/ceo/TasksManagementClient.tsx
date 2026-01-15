"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  User,
  Calendar,
  Filter,
  Plus,
  BarChart3,
  Users,
  TrendingUp,
} from "lucide-react";

type TaskStatus = "TODO" | "IN_PROGRESS" | "SUBMITTED" | "AWAITING_PAYOUT" | "DONE";
type Priority = "LOW" | "MEDIUM" | "HIGH";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  dueDate: Date | null;
  createdAt: Date;
  completedAt: Date | null;
  assignedTo: {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
  } | null;
  createdBy: {
    id: string;
    name: string | null;
  } | null;
}

interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
}

interface Stats {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
  overdue: number;
  byPriority: {
    high: number;
    medium: number;
    low: number;
  };
  byUser: Record<string, number>;
}

interface TasksManagementClientProps {
  tasks: Task[];
  users: User[];
  stats: Stats;
}

export function TasksManagementClient({ tasks, users, stats }: TasksManagementClientProps) {
  const [filter, setFilter] = useState<"all" | TaskStatus>("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | Priority>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    if (filter !== "all" && task.status !== filter) return false;
    if (priorityFilter !== "all" && task.priority !== priorityFilter) return false;
    if (assigneeFilter !== "all") {
      if (assigneeFilter === "unassigned" && task.assignedTo) return false;
      if (assigneeFilter !== "unassigned" && task.assignedTo?.id !== assigneeFilter)
        return false;
    }
    return true;
  });

  // Calculate completion rate
  const completionRate = stats.total > 0 ? (stats.done / stats.total) * 100 : 0;

  // Get top performers (users with most completed tasks)
  const userPerformance = users.map((user) => {
    const userTasks = tasks.filter((t) => t.assignedTo?.id === user.id);
    const completed = userTasks.filter((t) => t.status === "DONE").length;
    return {
      user,
      total: userTasks.length,
      completed,
      completionRate: userTasks.length > 0 ? (completed / userTasks.length) * 100 : 0,
    };
  }).sort((a, b) => b.completed - a.completed);

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case "DONE":
        return <CheckCircle2 className="w-5 h-5 text-green-400" />;
      case "IN_PROGRESS":
        return <Clock className="w-5 h-5 text-blue-400" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case "HIGH":
        return "text-red-400 bg-red-500/10 border-red-500/20";
      case "MEDIUM":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
      default:
        return "text-gray-400 bg-gray-500/10 border-gray-500/20";
    }
  };

  const isOverdue = (task: Task) => {
    if (!task.dueDate || task.status === "DONE") return false;
    return new Date(task.dueDate) < new Date();
  };

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            Task Management
          </h1>
          <p className="text-gray-400 mt-2">
            Oversee all tasks, assignments, and team performance
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg font-semibold flex items-center gap-2 shadow-lg shadow-red-500/20"
        >
          <Plus className="w-5 h-5" />
          Create Task
        </motion.button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          icon={<BarChart3 className="w-6 h-6" />}
          label="Total Tasks"
          value={stats.total}
          color="blue"
        />
        <StatCard
          icon={<Circle className="w-6 h-6" />}
          label="To Do"
          value={stats.todo}
          color="gray"
        />
        <StatCard
          icon={<Clock className="w-6 h-6" />}
          label="In Progress"
          value={stats.inProgress}
          color="yellow"
        />
        <StatCard
          icon={<CheckCircle2 className="w-6 h-6" />}
          label="Completed"
          value={stats.done}
          color="green"
        />
        <StatCard
          icon={<AlertTriangle className="w-6 h-6" />}
          label="Overdue"
          value={stats.overdue}
          color="red"
        />
      </div>

      {/* Priority Breakdown & Team Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Breakdown */}
        <div className="glass-card p-6 rounded-xl border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            Priority Breakdown
          </h3>
          <div className="space-y-4">
            <PriorityBar
              label="High Priority"
              count={stats.byPriority.high}
              total={stats.total - stats.done}
              color="red"
            />
            <PriorityBar
              label="Medium Priority"
              count={stats.byPriority.medium}
              total={stats.total - stats.done}
              color="yellow"
            />
            <PriorityBar
              label="Low Priority"
              count={stats.byPriority.low}
              total={stats.total - stats.done}
              color="gray"
            />
          </div>
        </div>

        {/* Team Performance */}
        <div className="glass-card p-6 rounded-xl border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Top Performers
          </h3>
          <div className="space-y-3">
            {userPerformance.slice(0, 5).map((perf) => (
              <div
                key={perf.user.id}
                className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    {perf.user.name?.[0] || "U"}
                  </div>
                  <div>
                    <p className="text-white font-medium">{perf.user.name || "Unknown"}</p>
                    <p className="text-sm text-gray-400">
                      {perf.completed} / {perf.total} tasks
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-bold">
                    {perf.completionRate.toFixed(0)}%
                  </p>
                  <p className="text-xs text-gray-400">completion</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-6 rounded-xl border border-white/10">
        <div className="flex items-center gap-4 flex-wrap">
          <Filter className="w-5 h-5 text-gray-400" />
          
          {/* Status Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Status</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Completed</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as any)}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Priorities</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {/* Assignee Filter */}
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Assignees</option>
            <option value="unassigned">Unassigned</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name || user.email}
              </option>
            ))}
          </select>

          <span className="text-gray-400 ml-auto">
            Showing {filteredTasks.length} of {tasks.length} tasks
          </span>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`glass-card p-6 rounded-xl border ${
              isOverdue(task) ? "border-red-500/30 bg-red-500/5" : "border-white/10"
            }`}
          >
            <div className="flex items-start gap-4">
              {getStatusIcon(task.status)}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="text-lg font-semibold text-white">{task.title}</h3>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(
                      task.priority
                    )}`}
                  >
                    {task.priority}
                  </span>
                </div>

                {task.description && (
                  <p className="text-gray-400 mb-3">{task.description}</p>
                )}

                <div className="flex items-center gap-4 flex-wrap text-sm">
                  {task.assignedTo && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <User className="w-4 h-4" />
                      <span>{task.assignedTo.name || task.assignedTo.email}</span>
                    </div>
                  )}

                  {task.dueDate && (
                    <div
                      className={`flex items-center gap-2 ${
                        isOverdue(task) ? "text-red-400" : "text-gray-400"
                      }`}
                    >
                      <Calendar className="w-4 h-4" />
                      <span>
                        {isOverdue(task) && "Overdue: "}
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  <span className="text-gray-500">
                    Created {new Date(task.createdAt).toLocaleDateString()}
                  </span>

                  {task.completedAt && (
                    <span className="text-green-400">
                      ✓ Completed {new Date(task.completedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {filteredTasks.length === 0 && (
          <div className="text-center py-12 glass-card rounded-xl border border-white/10">
            <p className="text-gray-400">No tasks found matching your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  const colorClasses = {
    blue: "from-blue-500 to-cyan-500",
    gray: "from-gray-500 to-gray-600",
    yellow: "from-yellow-500 to-orange-500",
    green: "from-green-500 to-emerald-500",
    red: "from-red-500 to-rose-500",
  };

  return (
    <div className="glass-card p-6 rounded-xl border border-white/10">
      <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} mb-3`}>
        {icon}
      </div>
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  );
}

function PriorityBar({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  
  const colorClasses = {
    red: "bg-red-500",
    yellow: "bg-yellow-500",
    gray: "bg-gray-500",
  };

  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className="text-gray-300">{label}</span>
        <span className="text-white font-semibold">{count}</span>
      </div>
      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClasses[color as keyof typeof colorClasses]} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
