"use client";

/**
 * Tasks Client Component
 */

import { useState } from "react";
import { SectionCard } from "@/components/admin/SectionCard";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { updateTaskStatus, createTask, assignTask } from "@/server/actions";
import { Plus, CheckSquare, Clock, AlertCircle } from "lucide-react";
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

  const columns: Column<Task>[] = [
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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="glass-container-static p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <CheckSquare className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <div className="text-xs text-slate-400">Total Tasks</div>
            </div>
          </div>
        </div>

        <div className="glass-container-static p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{stats.todo}</div>
              <div className="text-xs text-slate-400">To Do</div>
            </div>
          </div>
        </div>

        <div className="glass-container-static p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{stats.inProgress}</div>
              <div className="text-xs text-slate-400">In Progress</div>
            </div>
          </div>
        </div>

        <div className="glass-container-static p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <CheckSquare className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{stats.done}</div>
              <div className="text-xs text-slate-400">Completed</div>
            </div>
          </div>
        </div>

        <div className="glass-container-static p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{stats.overdue}</div>
              <div className="text-xs text-slate-400">Overdue</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`
              px-3 py-1.5 rounded-lg text-sm font-medium transition-all
              ${
                filter === "all"
                  ? "bg-blue-500/20 text-blue-400"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/40"
              }
            `}
          >
            All ({tasks.length})
          </button>
          <button
            onClick={() => setFilter("TODO")}
            className={`
              px-3 py-1.5 rounded-lg text-sm font-medium transition-all
              ${
                filter === "TODO"
                  ? "bg-blue-500/20 text-blue-400"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/40"
              }
            `}
          >
            To Do ({stats.todo})
          </button>
          <button
            onClick={() => setFilter("IN_PROGRESS")}
            className={`
              px-3 py-1.5 rounded-lg text-sm font-medium transition-all
              ${
                filter === "IN_PROGRESS"
                  ? "bg-blue-500/20 text-blue-400"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/40"
              }
            `}
          >
            In Progress ({stats.inProgress})
          </button>
          <button
            onClick={() => setFilter("DONE")}
            className={`
              px-3 py-1.5 rounded-lg text-sm font-medium transition-all
              ${
                filter === "DONE"
                  ? "bg-blue-500/20 text-blue-400"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/40"
              }
            `}
          >
            Done ({stats.done})
          </button>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-all">
          <Plus className="w-4 h-4" />
          New Task
        </button>
      </div>

      {/* Tasks Table */}
      <SectionCard>
        <DataTable
          data={filteredTasks}
          columns={columns}
          searchPlaceholder="Search tasks..."
          onRowClick={(task) => router.push(`/admin/tasks/${task.id}`)}
        />
      </SectionCard>
    </div>
  );
}
