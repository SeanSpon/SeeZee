"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { 
  FiCalendar, 
  FiUser, 
  FiFolder, 
  FiCheck, 
  FiClock,
  FiAlertCircle,
  FiPlus,
  FiGithub,
  FiExternalLink,
  FiEdit,
  FiTrash2,
  FiFilter
} from "react-icons/fi";
import { AlertCircle, CheckCircle2, Clock, Target } from "lucide-react";

interface TodoTask {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  projectId: string | null;
  assignedToId: string | null;
  assignedToRole: string | null;
  changeRequestId: string | null;
  estimatedHours: number | null;
  actualHours: number | null;
  createdAt: string;
  assignedTo: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  } | null;
  project: {
    id: string;
    name: string;
  } | null;
}

interface TodosClientProps {
  tasks: TodoTask[];
  userId: string;
  userRole: string;
  projects: { id: string; name: string; githubRepo: string | null }[];
  staffUsers: { id: string; name: string | null; email: string; image: string | null; role: string }[];
}

type FilterType = "mine" | "available" | "all";

const priorityColors = {
  HIGH: "bg-red-500/20 text-red-400 border-red-500/30",
  MEDIUM: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  LOW: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

const statusColors = {
  TODO: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  IN_PROGRESS: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  SUBMITTED: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  DONE: "bg-green-500/20 text-green-400 border-green-500/30",
};

export function TodosClient({ tasks, userId, userRole, projects, staffUsers }: TodosClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [filter, setFilter] = useState<FilterType>("mine");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    projectId: "",
    priority: "MEDIUM",
    dueDate: "",
    assignedToId: userId, // Default to current user
  });

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    if (filter === "mine") {
      return task.assignedToId === userId;
    } else if (filter === "available") {
      return (
        task.assignedToId === null && 
        (task.assignedToRole === userRole || task.assignedToRole === null)
      );
    }
    return true; // "all"
  });

  // Group by status
  const todoTasks = filteredTasks.filter(t => t.status === "TODO");
  const inProgressTasks = filteredTasks.filter(t => t.status === "IN_PROGRESS");
  const submittedTasks = filteredTasks.filter(t => t.status === "SUBMITTED");

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) return;

    startTransition(async () => {
      try {
        const response = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: newTask.title,
            description: newTask.description || null,
            projectId: newTask.projectId || null,
            priority: newTask.priority,
            dueDate: newTask.dueDate ? new Date(newTask.dueDate).toISOString() : null,
            assignedToId: newTask.assignedToId || null,
          }),
        });

        if (response.ok) {
          setNewTask({ title: "", description: "", projectId: "", priority: "MEDIUM", dueDate: "", assignedToId: userId });
          setShowCreateForm(false);
          router.refresh();
        } else {
          const errorData = await response.json();
          console.error("Failed to create task:", errorData);
          alert(errorData.error || "Failed to create task");
        }
      } catch (error) {
        console.error("Failed to create task:", error);
      }
    });
  };

  const handleUpdateStatus = async (taskId: string, newStatus: string) => {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/tasks/${taskId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });

        if (response.ok) {
          router.refresh();
        }
      } catch (error) {
        console.error("Failed to update task:", error);
      }
    });
  };

  const handleClaimTask = async (taskId: string) => {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/tasks/${taskId}/assign`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ assignedToId: userId }),
        });

        if (response.ok) {
          router.refresh();
        }
      } catch (error) {
        console.error("Failed to claim task:", error);
      }
    });
  };

  const TaskCard = ({ task }: { task: TodoTask }) => {
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE";
    const canClaim = task.assignedToId === null;
    const isMine = task.assignedToId === userId;
    
    return (
      <div
        className="group relative bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all cursor-pointer"
        onClick={() => router.push(`/admin/tasks/${task.id}`)}
      >
        {/* Priority Badge */}
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-0.5 rounded text-xs font-medium border ${priorityColors[task.priority as keyof typeof priorityColors] || priorityColors.MEDIUM}`}>
            {task.priority}
          </span>
        </div>

        {/* Title & Description */}
        <div className="pr-20">
          <h3 className="text-sm font-semibold text-white mb-1 line-clamp-2">
            {task.title}
          </h3>
          {task.description && (
            <p className="text-xs text-gray-400 line-clamp-2 mb-3">
              {task.description}
            </p>
          )}
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap gap-3 text-xs text-gray-400 mb-3">
          {task.project && (
            <div className="flex items-center gap-1">
              <FiFolder className="w-3 h-3" />
              <span>{task.project.name}</span>
            </div>
          )}
          
          {task.assignedTo && (
            <div className="flex items-center gap-1">
              <FiUser className="w-3 h-3" />
              <span>{task.assignedTo.name || task.assignedTo.email}</span>
            </div>
          )}

          {task.dueDate && (
            <div className={`flex items-center gap-1 ${isOverdue ? "text-red-400" : ""}`}>
              <FiCalendar className="w-3 h-3" />
              <span>{new Date(task.dueDate).toLocaleDateString()}</span>
              {isOverdue && <FiAlertCircle className="w-3 h-3" />}
            </div>
          )}

          {task.estimatedHours && (
            <div className="flex items-center gap-1">
              <FiClock className="w-3 h-3" />
              <span>{task.estimatedHours}h est.</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColors[task.status as keyof typeof statusColors] || statusColors.TODO}`}>
              {task.status.replace("_", " ")}
            </span>
            
            {task.changeRequestId && (
              <span className="px-2 py-1 rounded-full text-xs font-medium border border-purple-500/30 bg-purple-500/20 text-purple-400">
                Change Request
              </span>
            )}
          </div>

          {canClaim && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClaimTask(task.id);
              }}
              disabled={isPending}
              className="px-3 py-1 text-xs font-medium bg-trinity-red hover:bg-trinity-red/80 text-white rounded transition-colors disabled:opacity-50"
            >
              Claim
            </button>
          )}

          {isMine && task.status === "TODO" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleUpdateStatus(task.id, "IN_PROGRESS");
              }}
              disabled={isPending}
              className="px-3 py-1 text-xs font-medium bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors disabled:opacity-50"
            >
              Start
            </button>
          )}

          {isMine && task.status === "IN_PROGRESS" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleUpdateStatus(task.id, "SUBMITTED");
              }}
              disabled={isPending}
              className="px-3 py-1 text-xs font-medium bg-green-500 hover:bg-green-600 text-white rounded transition-colors disabled:opacity-50"
            >
              Submit
            </button>
          )}
        </div>

        {/* GitHub Link if project has repo */}
        {task.project && projects.find(p => p.id === task.project?.id)?.githubRepo && (
          <a
            href={`https://github.com/${projects.find(p => p.id === task.project?.id)?.githubRepo}/issues`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <FiGithub className="w-4 h-4 text-gray-400 hover:text-white" />
          </a>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats & Filters */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Stats */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-500/20 border border-slate-500/30 rounded-lg">
            <Target className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-400">{todoTasks.length} Todo</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-400">{inProgressTasks.length} In Progress</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg">
            <AlertCircle className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-purple-400">{submittedTasks.length} Submitted</span>
          </div>
        </div>

        {/* Filters & Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-1">
            <button
              onClick={() => setFilter("mine")}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                filter === "mine" ? "bg-trinity-red text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              My Tasks
            </button>
            <button
              onClick={() => setFilter("available")}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                filter === "available" ? "bg-trinity-red text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              Available
            </button>
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                filter === "all" ? "bg-trinity-red text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              All
            </button>
          </div>

          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-2 px-4 py-2 bg-trinity-red hover:bg-trinity-red/80 text-white rounded-lg transition-colors text-sm font-medium"
          >
            <FiPlus className="w-4 h-4" />
            Quick Add
          </button>
        </div>
      </div>

      {/* Quick Create Form */}
      {showCreateForm && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">Create New Task</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="What needs to be done?"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-trinity-red"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Add details..."
                rows={3}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-trinity-red resize-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Assign To
              </label>
              <select
                value={newTask.assignedToId}
                onChange={(e) => setNewTask({ ...newTask, assignedToId: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-trinity-red [&>option]:bg-gray-900 [&>option]:text-white"
              >
                <option value={userId}>Me (default)</option>
                <option value="">Unassigned</option>
                {/* Exclude current user from staff list since they're already shown as "Me (default)" */}
                {staffUsers.filter(u => u.id !== userId).map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name || user.email} ({user.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Project
              </label>
              <select
                value={newTask.projectId}
                onChange={(e) => setNewTask({ ...newTask, projectId: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-trinity-red [&>option]:bg-gray-900 [&>option]:text-white"
              >
                <option value="">No project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Priority
              </label>
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-trinity-red [&>option]:bg-gray-900 [&>option]:text-white"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Due Date
              </label>
              <input
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-trinity-red"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 justify-end">
            <button
              onClick={() => {
                setShowCreateForm(false);
                setNewTask({ title: "", description: "", projectId: "", priority: "MEDIUM", dueDate: "", assignedToId: userId });
              }}
              className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateTask}
              disabled={!newTask.title.trim() || isPending}
              className="px-4 py-2 text-sm font-medium bg-trinity-red hover:bg-trinity-red/80 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? "Creating..." : "Create Task"}
            </button>
          </div>
        </div>
      )}

      {/* Tasks Grid */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <Target className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-sm">
            {filter === "mine" && "No tasks assigned to you yet"}
            {filter === "available" && "No available tasks to claim"}
            {filter === "all" && "No tasks found"}
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="mt-4 text-sm text-trinity-red hover:text-trinity-red/80"
          >
            Create your first task
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}



