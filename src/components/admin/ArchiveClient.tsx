"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, RefreshCw, Trash2, Package, CheckSquare, Calendar, User, FolderOpen } from "lucide-react";
import { motion } from "framer-motion";

interface ArchivedTodo {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  archivedAt: Date | string | null;
  createdAt: Date | string;
  assignedTo: { id: string; name: string | null; email: string } | null;
  createdBy: { id: string; name: string | null; email: string };
  project: { id: string; name: string } | null;
}

interface ArchivedProject {
  id: string;
  name: string;
  description: string | null;
  status: string;
  archivedAt: Date | string | null;
  createdAt: Date | string;
  organization: { id: string; name: string };
  assignee: { id: string; name: string | null; email: string } | null;
}

interface ArchiveClientProps {
  todos: ArchivedTodo[];
  projects: ArchivedProject[];
  userId: string;
}

export function ArchiveClient({ todos, projects, userId }: ArchiveClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"todos" | "projects">("todos");
  const [loading, setLoading] = useState<string | null>(null);

  const handleRestore = async (type: "todo" | "project", id: string) => {
    setLoading(id);
    try {
      const endpoint = type === "todo" ? `/api/tasks/${id}/archive` : `/api/projects/${id}/archive`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: false }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert("Failed to restore item");
      }
    } catch (error) {
      console.error("Error restoring:", error);
      alert("Failed to restore item");
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async (type: "todo" | "project", id: string) => {
    if (!confirm("Permanently delete this item? This cannot be undone.")) {
      return;
    }

    setLoading(id);
    try {
      const endpoint = type === "todo" ? `/api/tasks/${id}` : `/api/projects/${id}`;
      const response = await fetch(endpoint, {
        method: "DELETE",
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert("Failed to delete item");
      }
    } catch (error) {
      console.error("Error deleting:", error);
      alert("Failed to delete item");
    } finally {
      setLoading(null);
    }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "Unknown";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg p-1">
        <button
          onClick={() => setActiveTab("todos")}
          className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
            activeTab === "todos"
              ? "bg-trinity-red text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span className="font-medium">Tasks ({todos.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("projects")}
          className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
            activeTab === "projects"
              ? "bg-trinity-red text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <FolderOpen className="w-4 h-4" />
          <span className="font-medium">Projects ({projects.length})</span>
        </button>
      </div>

      {/* Todos Tab */}
      {activeTab === "todos" && (
        <div className="space-y-4">
          {todos.length === 0 ? (
            <div className="text-center py-12 bg-white/5 border border-white/10 rounded-xl">
              <Archive className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No archived tasks</p>
            </div>
          ) : (
            todos.map((todo) => (
              <motion.div
                key={todo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-white">{todo.title}</h3>
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-500/20 text-slate-400 border border-slate-500/30">
                        {todo.priority}
                      </span>
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        {todo.status}
                      </span>
                    </div>

                    {todo.description && (
                      <p className="text-sm text-gray-400">{todo.description}</p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      {todo.project && (
                        <div className="flex items-center gap-1">
                          <Package className="w-3 h-3" />
                          <span>{todo.project.name}</span>
                        </div>
                      )}
                      {todo.assignedTo && (
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{todo.assignedTo.name || todo.assignedTo.email}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Archived: {formatDate(todo.archivedAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRestore("todo", todo.id)}
                      disabled={loading === todo.id}
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Restore
                    </button>
                    <button
                      onClick={() => handleDelete("todo", todo.id)}
                      disabled={loading === todo.id}
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Projects Tab */}
      {activeTab === "projects" && (
        <div className="space-y-4">
          {projects.length === 0 ? (
            <div className="text-center py-12 bg-white/5 border border-white/10 rounded-xl">
              <Archive className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No archived projects</p>
            </div>
          ) : (
            projects.map((project) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
                        {project.status}
                      </span>
                    </div>

                    {project.description && (
                      <p className="text-sm text-gray-400">{project.description}</p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <div className="flex items-center gap-1">
                        <Package className="w-3 h-3" />
                        <span>{project.organization.name}</span>
                      </div>
                      {project.assignee && (
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{project.assignee.name || project.assignee.email}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Archived: {formatDate(project.archivedAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRestore("project", project.id)}
                      disabled={loading === project.id}
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Restore
                    </button>
                    <button
                      onClick={() => handleDelete("project", project.id)}
                      disabled={loading === project.id}
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
