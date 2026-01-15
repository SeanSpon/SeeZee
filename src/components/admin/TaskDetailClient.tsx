"use client";

/**
 * Task Detail Client Component
 * Full task view with editing, comments, and activity history
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SectionCard } from "@/components/admin/SectionCard";
import {
  ArrowLeft,
  Clock,
  User,
  Calendar,
  AlertCircle,
  CheckCircle,
  Edit2,
  Trash2,
  Save,
  X,
  MessageSquare,
  Activity,
  Flag,
} from "lucide-react";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { updateTaskStatus, assignTask, deleteTask } from "@/server/actions";
import { toast } from "@/hooks/use-toast";

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  assignedTo: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    role: string;
  } | null;
  createdBy: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    role: string;
  };
};

type ActivityLog = {
  id: string;
  type: string;
  title: string;
  description: string | null;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  } | null;
};

type TeamMember = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
};

interface TaskDetailClientProps {
  task: Task;
  activities: ActivityLog[];
  teamMembers: TeamMember[];
  currentUser: {
    id: string;
    name: string | null;
    email: string;
    role: string;
  };
}

const statusOptions = [
  { value: "TODO", label: "To Do", color: "bg-slate-500/20 text-slate-400 border-slate-500/30" },
  { value: "IN_PROGRESS", label: "In Progress", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  { value: "DONE", label: "Done", color: "bg-green-500/20 text-green-400 border-green-500/30" },
];

const priorityOptions = [
  { value: "LOW", label: "Low", color: "bg-slate-500/20 text-slate-400 border-slate-500/30" },
  { value: "MEDIUM", label: "Medium", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  { value: "HIGH", label: "High", color: "bg-red-500/20 text-red-400 border-red-500/30" },
];

export function TaskDetailClient({
  task,
  activities,
  teamMembers,
  currentUser,
}: TaskDetailClientProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const currentStatus = statusOptions.find((s) => s.value === task.status) || statusOptions[0];
  const currentPriority = priorityOptions.find((p) => p.value === task.priority) || priorityOptions[1];

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE";
  const canEdit = currentUser.role === "CEO" || currentUser.role === "CFO" || task.createdBy.id === currentUser.id;

  const handleStatusChange = async (newStatus: string) => {
    setLoading(true);
    const result = await updateTaskStatus(task.id, newStatus as any);
    
    if (result.success) {
      toast(`Task status updated to ${statusOptions.find((s) => s.value === newStatus)?.label}`, "success");
      router.refresh();
    } else {
      toast("Failed to update task status", "error");
    }
    setLoading(false);
  };

  const handleAssigneeChange = async (assigneeId: string) => {
    setLoading(true);
    const result = await assignTask(task.id, assigneeId);
    
    if (result.success) {
      const assignee = teamMembers.find((m) => m.id === assigneeId);
      toast(`Task assigned to ${assignee?.name || assignee?.email}`, "success");
      router.refresh();
    } else {
      toast("Failed to assign task", "error");
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this task? This action cannot be undone.")) {
      return;
    }

    setLoading(true);
    const result = await deleteTask(task.id);
    
    if (result.success) {
      toast("Task deleted successfully", "success");
      router.push("/admin/tasks");
    } else {
      toast("Failed to delete task", "error");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link
            href="/admin/tasks"
            className="p-2 rounded-lg hover:bg-slate-800/60 text-slate-400 hover:text-white transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-white">{task.title}</h1>
              {isOverdue && (
                <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-sm font-medium flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  Overdue
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                Created by {task.createdBy.name || task.createdBy.email}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>

        {canEdit && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30 font-medium transition-all flex items-center gap-2"
            >
              {isEditing ? (
                <>
                  <X className="w-4 h-4" />
                  Cancel
                </>
              ) : (
                <>
                  <Edit2 className="w-4 h-4" />
                  Edit
                </>
              )}
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 font-medium transition-all disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task Details */}
          <SectionCard title="Task Details">
            <div className="space-y-6">
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Description
                </label>
                {task.description ? (
                  <div className="p-4 rounded-lg bg-slate-900/40 border border-white/5">
                    <p className="text-sm text-slate-300 whitespace-pre-wrap">
                      {task.description}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic">No description provided</p>
                )}
              </div>

              {/* Status and Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Status
                  </label>
                  {isEditing ? (
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      disabled={loading}
                      className="w-full px-4 py-2 rounded-lg bg-slate-900/60 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className={`inline-flex px-3 py-2 rounded-lg border font-medium ${currentStatus.color}`}>
                      {currentStatus.label}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Priority
                  </label>
                  <span className={`inline-flex px-3 py-2 rounded-lg border font-medium ${currentPriority.color}`}>
                    <Flag className="w-4 h-4 mr-2" />
                    {currentPriority.label}
                  </span>
                </div>
              </div>

              {/* Due Date */}
              {task.dueDate && (
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Due Date
                  </label>
                  <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${
                    isOverdue 
                      ? "bg-red-500/20 text-red-400 border-red-500/30" 
                      : "bg-slate-900/40 text-slate-300 border-white/10"
                  }`}>
                    <Calendar className="w-4 h-4" />
                    {format(new Date(task.dueDate), "MMMM d, yyyy 'at' h:mm a")}
                  </div>
                </div>
              )}

              {/* Completed At */}
              {task.completedAt && (
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Completed At
                  </label>
                  <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/20 text-green-400 border border-green-500/30">
                    <CheckCircle className="w-4 h-4" />
                    {format(new Date(task.completedAt), "MMMM d, yyyy 'at' h:mm a")}
                  </div>
                </div>
              )}
            </div>
          </SectionCard>

          {/* Activity History */}
          <SectionCard
            title="Activity History"
            description={`${activities.length} activities`}
          >
            <div className="space-y-3">
              {activities.length > 0 ? (
                activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-4 rounded-lg bg-slate-900/40 border border-white/5"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0 border border-blue-500/30">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white mb-1">
                        {activity.title}
                      </p>
                      {activity.description && (
                        <p className="text-xs text-slate-400 mb-1">
                          {activity.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        {activity.user && (
                          <span>{activity.user.name || activity.user.email}</span>
                        )}
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <Activity className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                  <p className="text-sm">No activity history</p>
                </div>
              )}
            </div>
          </SectionCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Assignee */}
          <SectionCard title="Assignee">
            {isEditing ? (
              <select
                value={task.assignedTo?.id || ""}
                onChange={(e) => handleAssigneeChange(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2 rounded-lg bg-slate-900/60 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="">Unassigned</option>
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name || member.email} ({member.role})
                  </option>
                ))}
              </select>
            ) : task.assignedTo ? (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/40 border border-white/5">
                {task.assignedTo.image ? (
                  <img
                    src={task.assignedTo.image}
                    alt={task.assignedTo.name || task.assignedTo.email || "User"}
                    className="w-10 h-10 rounded-full border-2 border-blue-500/30"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center border-2 border-blue-500/30">
                    <User className="w-5 h-5" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">
                    {task.assignedTo.name || task.assignedTo.email}
                  </p>
                  <p className="text-xs text-slate-400 capitalize">
                    {task.assignedTo.role.toLowerCase()}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">Unassigned</p>
            )}
          </SectionCard>

          {/* Quick Actions */}
          <SectionCard title="Quick Actions">
            <div className="space-y-2">
              {task.status !== "DONE" && (
                <button
                  onClick={() => handleStatusChange("DONE")}
                  disabled={loading}
                  className="w-full px-4 py-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30 font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark as Done
                </button>
              )}
              {task.status === "TODO" && (
                <button
                  onClick={() => handleStatusChange("IN_PROGRESS")}
                  disabled={loading}
                  className="w-full px-4 py-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30 font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Clock className="w-4 h-4" />
                  Start Working
                </button>
              )}
              <Link
                href="/admin/calendar"
                className="w-full px-4 py-2 rounded-lg bg-slate-900/60 text-slate-300 hover:bg-slate-900/80 border border-white/10 font-medium transition-all flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                View in Calendar
              </Link>
            </div>
          </SectionCard>

          {/* Task Meta */}
          <SectionCard title="Task Information">
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Created</span>
                <span className="text-white font-medium">
                  {format(new Date(task.createdAt), "MMM d, yyyy")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Task ID</span>
                <span className="text-white font-mono text-xs">
                  {task.id.slice(0, 8)}...
                </span>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
