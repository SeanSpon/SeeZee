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
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-2">Project Tasks</h3>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-purple-300 font-medium">
              {tasks.client.length} client task{tasks.client.length !== 1 ? 's' : ''}
            </span>
            <span className="text-white/20">•</span>
            <span className="text-cyan-300 font-medium">
              {tasks.admin.length} admin task{tasks.admin.length !== 1 ? 's' : ''}
            </span>
            {milestones.length > 0 && (
              <>
                <span className="text-white/20">•</span>
                <span className="text-white/50 flex items-center gap-1">
                  <Target className="w-3.5 h-3.5" />
                  {milestones.length} milestone{milestones.length !== 1 ? 's' : ''}
                </span>
              </>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* AI Task Generator */}
          <AITaskGenerator
            projectId={projectId}
            milestones={milestones}
            onTasksCreated={handleRefresh}
          />
          
          {/* View Mode Toggle */}
          <div className="flex items-center bg-white/5 border border-white/10 rounded-lg p-1">
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                viewMode === "list"
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <ListTodo className="w-4 h-4" />
              List
            </button>
            <button
              onClick={() => setViewMode("milestone")}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                viewMode === "milestone"
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <Target className="w-4 h-4" />
              Milestones
            </button>
          </div>
          
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors inline-flex items-center gap-2 shadow-lg shadow-blue-600/20"
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
          {/* Info Banner */}
          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-start gap-3">
            <Target className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-blue-300 font-medium mb-1">Milestone View</p>
              <p className="text-sm text-blue-200/80">
                Tasks are organized by milestones. Use the <span className="font-semibold text-purple-300">AI Task Generator</span> to quickly create tasks and automatically link them to milestones.
              </p>
            </div>
          </div>
          
          {milestones.length === 0 ? (
            <div className="text-center py-16 bg-gradient-to-b from-white/5 to-transparent rounded-xl border border-white/10">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-white/30" />
              </div>
              <p className="text-lg font-semibold text-white/60 mb-2">No milestones yet</p>
              <p className="text-sm text-white/40 max-w-md mx-auto">
                Milestones help you organize tasks into phases. Create milestones in your project settings to get started.
              </p>
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
                  <div className="px-5 py-4 flex items-center justify-between border-b border-gray-800 bg-gradient-to-r from-white/5 to-transparent">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 ${
                        milestone.completed 
                          ? "bg-emerald-500/20 border-emerald-500/30" 
                          : "bg-purple-500/20 border-purple-500/30"
                      }`}>
                        {milestone.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Target className="w-5 h-5 text-purple-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-white">
                            {milestone.name}
                          </h4>
                          {milestone.completed && (
                            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded-full uppercase">
                              Done
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-white/50">
                          <span className="font-medium">{milestoneTasks.length} task{milestoneTasks.length !== 1 ? 's' : ''}</span>
                          {milestone.dueDate && (
                            <>
                              <span className="text-white/20">•</span>
                              <span>Due {new Date(milestone.dueDate).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    {!milestone.completed && milestoneTasks.length > 0 && (
                      <div className="flex items-center gap-3">
                        <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              progress === 100 ? 'bg-emerald-500' : 'bg-purple-500'
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-white w-12">{progress}%</span>
                      </div>
                    )}
                    {milestone.completed && (
                      <span className="text-sm font-semibold text-emerald-400">Completed</span>
                    )}
                  </div>
                  
                  {/* Milestone Tasks */}
                  {milestoneTasks.length === 0 ? (
                    <div className="px-4 py-8 text-center bg-gradient-to-b from-white/5 to-transparent">
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                        <Sparkles className="w-6 h-6 text-white/30" />
                      </div>
                      <p className="text-sm text-white/50 font-medium mb-2">No tasks yet</p>
                      <p className="text-xs text-white/40 mb-4">Use AI to generate tasks or create them manually</p>
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
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 ${
                              isCompleted ? "bg-emerald-500/20 border-emerald-500/30" : "bg-white/5 border-white/10"
                            }`}>
                              {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-medium ${isCompleted ? "text-white/40" : "text-white"}`}>
                                  {task.title}
                                </span>
                                {task.aiGenerated && (
                                  <span className="flex items-center gap-1 px-1.5 py-0.5 bg-purple-500/20 rounded text-[9px] text-purple-300 font-bold uppercase" title="AI Generated">
                                    <Sparkles className="w-2.5 h-2.5" />
                                    AI
                                  </span>
                                )}
                              </div>
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
              <div className="rounded-xl border-2 border-amber-500/30 bg-amber-500/5 overflow-hidden">
                <div className="px-5 py-4 border-b border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-transparent">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 border-2 border-amber-500/30 flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-amber-300">Unassigned Tasks</h4>
                      <p className="text-xs text-amber-200/60">{unassignedTasks.length} task{unassignedTasks.length !== 1 ? 's' : ''} not linked to any milestone</p>
                    </div>
                  </div>
                </div>
                <div className="divide-y divide-amber-500/10">
                  {unassignedTasks.map((task) => {
                    const isCompleted = task.status === "completed" || task.status === "DONE" || task.completedAt;
                    return (
                      <div key={task.id} className="px-4 py-3 flex items-center gap-3 hover:bg-amber-500/10 transition-colors">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 ${
                          isCompleted ? "bg-emerald-500/20 border-emerald-500/30" : "bg-white/5 border-white/10"
                        }`}>
                          {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                        </div>
                        <span className={`text-sm font-medium flex-1 ${isCompleted ? "text-white/40" : "text-white"}`}>
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

