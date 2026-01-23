"use client";

import { useState, useEffect } from "react";
import { Plus, CheckCircle2, Clock, Calendar, AlertCircle, Upload, X, Edit, Trash2, ListTodo, Target, Sparkles, LayoutGrid } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AITaskGenerator } from "@/components/admin/projects/AITaskGenerator";

interface Milestone {
  id: string;
  name: string; // Using 'name' to match the data from parent
  title?: string;
  description: string | null;
  dueDate: Date | string | null;
  completed: boolean;
}

interface AdminProjectTasksProps {
  projectId: string;
  clientTasks: Array<any>;
  adminTasks: Array<any>;
  milestones?: Milestone[];
}

export function AdminProjectTasks({ projectId, clientTasks, adminTasks, milestones = [] }: AdminProjectTasksProps) {
  const [viewMode, setViewMode] = useState<"list" | "milestone">("list");
  const [taskFilter, setTaskFilter] = useState<"all" | "client" | "admin">("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [tasks, setTasks] = useState({ client: clientTasks, admin: adminTasks });
  const [loading, setLoading] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null);

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    dueDate: "",
    requiresUpload: false,
  });

  useEffect(() => {
    setTasks({ client: clientTasks, admin: adminTasks });
  }, [clientTasks, adminTasks]);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleCreateTask = async () => {
    if (!newTask.title || !newTask.description) {
      alert("Title and description are required");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/admin/tasks/client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          title: newTask.title,
          description: newTask.description,
          type: "general",
          dueDate: newTask.dueDate || null,
          requiresUpload: newTask.requiresUpload,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create task");
      }

      const data = await response.json();
      setTasks((prev) => ({
        ...prev,
        client: [data.task, ...prev.client],
      }));
      setShowCreateForm(false);
      setNewTask({ title: "", description: "", dueDate: "", requiresUpload: false });
      window.location.reload();
    } catch (error: any) {
      alert(error.message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId: string, isClientTask: boolean) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      const endpoint = isClientTask ? `/api/admin/tasks/client?taskId=${taskId}` : `/api/admin/tasks?taskId=${taskId}`;
      const response = await fetch(endpoint, { method: "DELETE" });

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      if (isClientTask) {
        setTasks((prev) => ({
          ...prev,
          client: prev.client.filter((t) => t.id !== taskId),
        }));
      } else {
        setTasks((prev) => ({
          ...prev,
          admin: prev.admin.filter((t) => t.id !== taskId),
        }));
      }
    } catch (error) {
      alert("Failed to delete task");
    }
  };

  const filteredTasks =
    taskFilter === "all"
      ? [...tasks.client, ...tasks.admin]
      : taskFilter === "client"
      ? tasks.client
      : tasks.admin;

  return (
    <div className="space-y-4">
      {/* Header with AI Generator */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-bold text-white mb-1">Tasks</h3>
          <span className="text-sm text-white/60">
            {tasks.client.length} client tasks, {tasks.admin.length} admin tasks
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* AI Task Generator */}
          <AITaskGenerator
            projectId={projectId}
            milestones={milestones}
            onTasksCreated={handleRefresh}
          />
          
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
                viewMode === "list"
                  ? "bg-gray-700 text-white"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <ListTodo className="w-3 h-3" />
              List
            </button>
            <button
              onClick={() => setViewMode("milestone")}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
                viewMode === "milestone"
                  ? "bg-gray-700 text-white"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <Target className="w-3 h-3" />
              Milestones
            </button>
          </div>
          
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Task
          </button>
        </div>
      </div>
      
      {/* Filter Tabs (List View Only) */}
      {viewMode === "list" && (
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setTaskFilter("all")}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              taskFilter === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-white/60 hover:bg-gray-700"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setTaskFilter("client")}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              taskFilter === "client"
                ? "bg-purple-600 text-white"
                : "bg-gray-800 text-white/60 hover:bg-gray-700"
            }`}
          >
            Client ({tasks.client.length})
          </button>
          <button
            onClick={() => setTaskFilter("admin")}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              taskFilter === "admin"
                ? "bg-cyan-600 text-white"
                : "bg-gray-800 text-white/60 hover:bg-gray-700"
            }`}
          >
            Admin ({tasks.admin.length})
          </button>
        </div>
      )}

      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-gray-900 rounded-xl border border-gray-800 mb-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-white">Create Client Task</h4>
            <button
              onClick={() => setShowCreateForm(false)}
              className="text-white/60 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Task title"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              placeholder="Task description"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
            />
            <input
              type="date"
              value={newTask.dueDate}
              onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <label className="flex items-center gap-2 text-white/60">
              <input
                type="checkbox"
                checked={newTask.requiresUpload}
                onChange={(e) => setNewTask({ ...newTask, requiresUpload: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm">Requires file upload</span>
            </label>
            <div className="flex gap-2">
              <button
                onClick={handleCreateTask}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                {loading ? "Creating..." : "Create Task"}
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Milestone View */}
      {viewMode === "milestone" && (
        <div className="space-y-4">
          {milestones.length === 0 ? (
            <div className="text-center py-12 bg-gray-900 rounded-xl border border-gray-800">
              <Target className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/60 mb-2">No milestones defined</p>
              <p className="text-sm text-white/40">Create milestones to organize tasks better</p>
            </div>
          ) : (
            milestones.map((milestone) => {
              const milestoneTasks = [...tasks.client, ...tasks.admin].filter(
                (t) => t.milestoneId === milestone.id
              );
              const completedCount = milestoneTasks.filter(
                (t) => t.status === "completed" || t.status === "DONE" || t.completedAt
              ).length;
              const progress = milestoneTasks.length > 0 
                ? Math.round((completedCount / milestoneTasks.length) * 100) 
                : 0;

              return (
                <div
                  key={milestone.id}
                  className={`rounded-xl border overflow-hidden ${
                    milestone.completed
                      ? "bg-emerald-500/5 border-emerald-500/20"
                      : "bg-gray-900 border-gray-800"
                  }`}
                >
                  {/* Milestone Header */}
                  <div className="px-4 py-3 flex items-center justify-between border-b border-gray-800">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        milestone.completed ? "bg-emerald-500/20" : "bg-purple-500/20"
                      }`}>
                        {milestone.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Target className="w-4 h-4 text-purple-400" />
                        )}
                      </div>
                      <div>
                        <h4 className={`font-semibold ${
                          milestone.completed ? "text-white/50 line-through" : "text-white"
                        }`}>
                          {milestone.name}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-white/40">
                          <span>{milestoneTasks.length} tasks</span>
                          {milestone.dueDate && (
                            <span>Due {new Date(milestone.dueDate).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {!milestone.completed && milestoneTasks.length > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-white/40">{progress}%</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Milestone Tasks */}
                  {milestoneTasks.length === 0 ? (
                    <div className="px-4 py-6 text-center">
                      <p className="text-sm text-white/40">No tasks for this milestone</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-800/50">
                      {milestoneTasks.map((task) => {
                        const isClientTask = tasks.client.some((t) => t.id === task.id);
                        const isCompleted = task.status === "completed" || task.status === "DONE" || task.completedAt;
                        
                        return (
                          <div
                            key={task.id}
                            className={`px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors ${
                              isCompleted ? "opacity-60" : ""
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                              isCompleted ? "bg-emerald-500/20" : "bg-white/10"
                            }`}>
                              {isCompleted && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className={`text-sm ${isCompleted ? "text-white/50 line-through" : "text-white"}`}>
                                {task.title}
                              </span>
                              {task.aiGenerated && (
                                <span title="AI Generated">
                                  <Sparkles className="inline w-3 h-3 text-purple-400 ml-2" />
                                </span>
                              )}
                            </div>
                            <span className={`px-2 py-0.5 text-[10px] rounded-full ${
                              isClientTask
                                ? "bg-purple-500/20 text-purple-300"
                                : "bg-cyan-500/20 text-cyan-300"
                            }`}>
                              {isClientTask ? "Client" : "Admin"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
          
          {/* Unassigned Tasks */}
          {(() => {
            const unassignedTasks = [...tasks.client, ...tasks.admin].filter((t) => !t.milestoneId);
            if (unassignedTasks.length === 0) return null;
            
            return (
              <div className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-800">
                  <h4 className="font-semibold text-white/70">Unassigned Tasks</h4>
                  <p className="text-xs text-white/40">{unassignedTasks.length} tasks not linked to milestones</p>
                </div>
                <div className="divide-y divide-gray-800/50">
                  {unassignedTasks.map((task) => {
                    const isCompleted = task.status === "completed" || task.status === "DONE" || task.completedAt;
                    return (
                      <div key={task.id} className="px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          isCompleted ? "bg-emerald-500/20" : "bg-white/10"
                        }`}>
                          {isCompleted && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                        </div>
                        <span className={`text-sm flex-1 ${isCompleted ? "text-white/50 line-through" : "text-white"}`}>
                          {task.title}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <>
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <ListTodo className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/60">No {taskFilter === "all" ? "" : taskFilter} tasks</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTasks.map((task) => {
                const isClientTask = tasks.client.some((t) => t.id === task.id);
                const isOverdue = task.dueDate && task.status !== "completed" && new Date(task.dueDate) < new Date();
                const isCompleted = task.status === "completed";

                return (
                  <div
                    key={task.id}
                    className={`p-4 bg-gray-900 hover:bg-gray-800 rounded-xl border transition-all ${
                      isOverdue ? "border-red-500/50 bg-red-500/5" : "border-gray-800"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          isCompleted
                            ? "bg-emerald-500/20 border-emerald-500/50"
                            : isOverdue
                            ? "bg-red-500/20 border-red-500/50"
                            : "bg-white/5 border-white/20"
                        }`}
                      >
                        {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-white">{task.title}</h4>
                          {task.aiGenerated && (
                            <span title="AI Generated">
                              <Sparkles className="w-3 h-3 text-purple-400" />
                            </span>
                          )}
                          <span
                            className={`px-2 py-1 text-xs rounded-full border ${
                              isClientTask
                                ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                                : "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
                            }`}
                          >
                            {isClientTask ? "Client" : "Admin"}
                          </span>
                          {task.requiresUpload && (
                            <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30 flex items-center gap-1">
                              <Upload className="w-3 h-3" />
                              Upload Required
                            </span>
                          )}
                          {isCompleted && (
                            <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 text-xs rounded-full border border-emerald-500/30">
                              Completed
                            </span>
                          )}
                        </div>
                        {task.description && (
                          <p className="text-sm text-white/60 mb-2">{task.description}</p>
                        )}
                        {task.submissionNotes && (
                          <div className="mb-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded text-sm text-blue-200">
                            <strong>Client notes:</strong> {task.submissionNotes}
                          </div>
                        )}
                        <div className="flex items-center gap-4 text-xs text-white/40 mb-2">
                          {task.milestoneId && (
                            <div className="flex items-center gap-1.5 text-purple-300">
                              <Target className="w-3.5 h-3.5" />
                              <span>{milestones.find(m => m.id === task.milestoneId)?.name || "Milestone"}</span>
                            </div>
                          )}
                          {task.dueDate && (
                            <div className={`flex items-center gap-1.5 ${isOverdue ? "text-red-400" : ""}`}>
                              <Calendar className="w-3.5 h-3.5" />
                              <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>
                            </div>
                          )}
                          {task.completedAt && (
                            <div className="flex items-center gap-1.5 text-emerald-400">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Completed {new Date(task.completedAt).toLocaleDateString()}</span>
                            </div>
                          )}
                          {task.createdBy && (
                            <div className="flex items-center gap-1.5">
                              <span>Created by {task.createdBy.name || task.createdBy.email}</span>
                            </div>
                          )}
                        </div>
                        {isClientTask && (
                          <div className="flex items-center gap-2 mt-3">
                            <button
                              onClick={() => handleDeleteTask(task.id, true)}
                              className="px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-300 text-xs rounded-lg transition-colors inline-flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

