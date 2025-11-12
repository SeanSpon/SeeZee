"use client";

/**
 * Tasks Client Component with Bulk Operations
 */

import { useState } from "react";
import { SectionCard } from "@/components/admin/SectionCard";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { updateTaskStatus, createTask, assignTask, bulkUpdateTaskStatus, bulkAssignTasks, bulkDeleteTasks } from "@/server/actions";
import { Plus, CheckSquare, Clock, AlertCircle, Trash2, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";

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
  } | null;
  createdBy: {
    id: string;
    name: string | null;
    email: string | null;
  };
};

interface TasksClientProps {
  initialTasks: Task[];
  stats: {
    total: number;
    todo: number;
    inProgress: number;
    done: number;
    overdue: number;
  };
}

const statusColors: Record<string, string> = {
  TODO: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  IN_PROGRESS: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  DONE: "bg-green-500/20 text-green-400 border-green-500/30",
};

const priorityColors: Record<string, string> = {
  LOW: "bg-slate-500/20 text-slate-400",
  MEDIUM: "bg-yellow-500/20 text-yellow-400",
  HIGH: "bg-red-500/20 text-red-400",
};

export function TasksClient({ initialTasks, stats }: TasksClientProps) {
  const router = useRouter();
  const [tasks, setTasks] = useState(initialTasks);
  const [filter, setFilter] = useState<"all" | "TODO" | "IN_PROGRESS" | "DONE">("all");
  const [updating, setUpdating] = useState<string | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    dueDate: "",
  });

  const filteredTasks = tasks.filter((t) => {
    if (filter === "all") return true;
    return t.status === filter;
  });

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    setUpdating(taskId);
    const result = await updateTaskStatus(taskId, newStatus as any);

    if (result.success) {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
      router.refresh();
    }
    setUpdating(null);
  };

  const handleBulkStatusUpdate = async (status: string) => {
    if (selectedTasks.length === 0) return;
    setBulkActionLoading(true);
    const result = await bulkUpdateTaskStatus(selectedTasks, status as any);
    if (result.success) {
      setSelectedTasks([]);
      router.refresh();
    }
    setBulkActionLoading(false);
  };

  const handleBulkDelete = async () => {
    if (selectedTasks.length === 0) return;
    if (!confirm(`Delete ${selectedTasks.length} task(s)?`)) return;
    setBulkActionLoading(true);
    const result = await bulkDeleteTasks(selectedTasks);
    if (result.success) {
      setSelectedTasks([]);
      router.refresh();
    }
    setBulkActionLoading(false);
  };

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  const toggleAllTasks = () => {
    if (selectedTasks.length === filteredTasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(filteredTasks.map((t) => t.id));
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setBulkActionLoading(true);
    
    const result = await createTask({
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority as any,
      dueDate: newTask.dueDate ? new Date(newTask.dueDate) : undefined,
    });

    if (result.success) {
      setShowCreateModal(false);
      setNewTask({ title: "", description: "", priority: "MEDIUM", dueDate: "" });
      router.refresh();
    }
    setBulkActionLoading(false);
  };

  const columns: Column<Task>[] = [
    {
      key: "select",
      label: "",
      render: (task) => (
        <input
          type="checkbox"
          checked={selectedTasks.includes(task.id)}
          onChange={() => toggleTaskSelection(task.id)}
          onClick={(e) => e.stopPropagation()}
          className="rounded border-white/20 bg-slate-800"
        />
      ),
    },
    {
      key: "title",
      label: "Task",
      sortable: true,
      render: (task) => (
        <div>
          <div className="font-medium text-white">{task.title}</div>
          {task.description && (
            <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">
              {task.description}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "priority",
      label: "Priority",
      render: (task) => (
        <span
          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
            priorityColors[task.priority] || priorityColors.MEDIUM
          }`}
        >
          {task.priority}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (task) => (
        <select
          value={task.status}
          onChange={(e) => handleStatusChange(task.id, e.target.value)}
          disabled={updating === task.id}
          className={`
            px-2 py-1 rounded-full text-xs font-medium border
            bg-transparent cursor-pointer
            ${statusColors[task.status] || statusColors.TODO}
            ${updating === task.id ? "opacity-50 cursor-wait" : ""}
          `}
        >
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="DONE">Done</option>
        </select>
      ),
    },
    {
      key: "assignedTo",
      label: "Assignee",
      render: (task) => (
        <div className="text-sm text-slate-300">
          {task.assignedTo?.name || task.assignedTo?.email || "Unassigned"}
        </div>
      ),
    },
    {
      key: "dueDate",
      label: "Due Date",
      render: (task) => {
        if (!task.dueDate) return <span className="text-slate-500">-</span>;
        const due = new Date(task.dueDate);
        const isOverdue = due < new Date() && task.status !== "DONE";
        return (
          <div
            className={`text-sm ${
              isOverdue ? "text-red-400 font-medium" : "text-slate-300"
            }`}
          >
            {due.toLocaleDateString()}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="rounded-2xl border-2 border-gray-700 glass-effect p-6 text-white hover:border-trinity-red/50 transition-all duration-300 group hover:shadow-large hover:-translate-y-1">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs uppercase tracking-[0.25em] text-gray-400 font-semibold">Total Tasks</p>
            <div className="w-10 h-10 bg-trinity-red/20 rounded-lg flex items-center justify-center border border-trinity-red/30">
              <CheckSquare className="w-5 h-5 text-trinity-red" />
            </div>
          </div>
          <p className="text-4xl font-heading font-bold text-white mb-1">{stats.total}</p>
          <p className="text-xs text-gray-500">All tasks</p>
        </div>

        <div className="rounded-2xl border-2 border-gray-700 glass-effect p-6 text-white hover:border-trinity-red/50 transition-all duration-300 group hover:shadow-large hover:-translate-y-1">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs uppercase tracking-[0.25em] text-gray-400 font-semibold">To Do</p>
            <div className="w-10 h-10 bg-gray-500/20 rounded-lg flex items-center justify-center border border-gray-500/30">
              <Clock className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          <p className="text-4xl font-heading font-bold text-white mb-1">{stats.todo}</p>
          <p className="text-xs text-gray-500">Pending</p>
        </div>

        <div className="rounded-2xl border-2 border-gray-700 glass-effect p-6 text-white hover:border-trinity-red/50 transition-all duration-300 group hover:shadow-large hover:-translate-y-1">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs uppercase tracking-[0.25em] text-gray-400 font-semibold">In Progress</p>
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center border border-blue-500/30">
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <p className="text-4xl font-heading font-bold text-white mb-1">{stats.inProgress}</p>
          <p className="text-xs text-gray-500">Active</p>
        </div>

        <div className="rounded-2xl border-2 border-gray-700 glass-effect p-6 text-white hover:border-trinity-red/50 transition-all duration-300 group hover:shadow-large hover:-translate-y-1">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs uppercase tracking-[0.25em] text-gray-400 font-semibold">Completed</p>
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center border border-green-500/30">
              <CheckSquare className="w-5 h-5 text-green-400" />
            </div>
          </div>
          <p className="text-4xl font-heading font-bold text-white mb-1">{stats.done}</p>
          <p className="text-xs text-gray-500">Finished</p>
        </div>

        <div className="rounded-2xl border-2 border-gray-700 glass-effect p-6 text-white hover:border-trinity-red/50 transition-all duration-300 group hover:shadow-large hover:-translate-y-1">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs uppercase tracking-[0.25em] text-gray-400 font-semibold">Overdue</p>
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center border border-red-500/30">
              <AlertCircle className="w-5 h-5 text-red-400" />
            </div>
          </div>
          <p className="text-4xl font-heading font-bold text-white mb-1">{stats.overdue}</p>
          <p className="text-xs text-gray-500">Needs attention</p>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {selectedTasks.length > 0 ? (
            <>
              <span className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 text-sm font-medium">
                {selectedTasks.length} selected
              </span>
              <button
                onClick={() => handleBulkStatusUpdate("DONE")}
                disabled={bulkActionLoading}
                className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 text-sm font-medium transition-all disabled:opacity-50"
              >
                <CheckSquare className="w-4 h-4 inline mr-1" />
                Mark Done
              </button>
              <button
                onClick={() => handleBulkStatusUpdate("IN_PROGRESS")}
                disabled={bulkActionLoading}
                className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 text-sm font-medium transition-all disabled:opacity-50"
              >
                In Progress
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={bulkActionLoading}
                className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 text-sm font-medium transition-all disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4 inline mr-1" />
                Delete
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setFilter("all")}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-all border-2
                  ${
                    filter === "all"
                      ? "bg-trinity-red/20 text-trinity-red border-trinity-red/50"
                      : "text-gray-400 border-gray-700 hover:text-white hover:border-gray-600"
                  }
                `}
              >
                All ({tasks.length})
              </button>
              <button
                onClick={() => setFilter("TODO")}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-all border-2
                  ${
                    filter === "TODO"
                      ? "bg-trinity-red/20 text-trinity-red border-trinity-red/50"
                      : "text-gray-400 border-gray-700 hover:text-white hover:border-gray-600"
                  }
                `}
              >
                To Do ({stats.todo})
              </button>
              <button
                onClick={() => setFilter("IN_PROGRESS")}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-all border-2
                  ${
                    filter === "IN_PROGRESS"
                      ? "bg-trinity-red/20 text-trinity-red border-trinity-red/50"
                      : "text-gray-400 border-gray-700 hover:text-white hover:border-gray-600"
                  }
                `}
              >
                In Progress ({stats.inProgress})
              </button>
              <button
                onClick={() => setFilter("DONE")}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-all border-2
                  ${
                    filter === "DONE"
                      ? "bg-trinity-red/20 text-trinity-red border-trinity-red/50"
                      : "text-gray-400 border-gray-700 hover:text-white hover:border-gray-600"
                  }
                `}
              >
                Done ({stats.done})
              </button>
            </>
          )}
        </div>

        <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg border-2 border-trinity-red/40 bg-trinity-red/10 text-trinity-red hover:bg-trinity-red hover:text-white text-sm font-medium transition-all hover:shadow-large"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus className="w-4 h-4" />
          New Task
        </button>
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowCreateModal(false)}>
          <div className="bg-slate-900 border border-white/10 rounded-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-white mb-4">Create New Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Title</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  required
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white"
                  placeholder="Task title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white"
                  rows={3}
                  placeholder="Task description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Due Date</label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bulkActionLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors disabled:opacity-50"
                >
                  {bulkActionLoading ? "Creating..." : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tasks Table */}
      <div className="glass-effect rounded-2xl border-2 border-gray-700 p-6 hover:border-trinity-red/30 transition-all duration-300">
        <DataTable
          data={filteredTasks}
          columns={columns}
          searchPlaceholder="Search tasks..."
          onRowClick={(task) => router.push(`/admin/tasks/${task.id}`)}
        />
      </div>
    </div>
  );
}
