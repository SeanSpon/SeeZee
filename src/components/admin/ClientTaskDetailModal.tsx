"use client";

import { useState } from "react";
import { 
  FiX, 
  FiCalendar, 
  FiUser, 
  FiClock, 
  FiCheckCircle, 
  FiAlertCircle,
  FiFile,
  FiDownload,
  FiEdit2,
  FiTrash2,
  FiExternalLink
} from "react-icons/fi";
import StatusBadge from "@/components/ui/StatusBadge";

interface ClientTask {
  id: string;
  title: string;
  description: string;
  status: string;
  type: string;
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;
  requiresUpload: boolean;
  submissionNotes: string | null;
  data: any;
  project: {
    id: string;
    name: string;
    organization?: {
      id: string;
      name: string;
    };
  };
  createdBy: {
    id: string;
    name: string | null;
    email: string;
  } | null;
}

interface ClientTaskDetailModalProps {
  task: ClientTask | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function ClientTaskDetailModal({ task, isOpen, onClose, onUpdate }: ClientTaskDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: task?.title || "",
    description: task?.description || "",
    status: task?.status || "pending",
    dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : "",
  });

  if (!isOpen || !task) return null;

  // Extract attachments from data field
  const attachments = (task.data as any)?.attachments || [];

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/tasks/client", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: task.id,
          title: formData.title,
          description: formData.description,
          status: formData.status,
          dueDate: formData.dueDate || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error("Failed to update task:", error);
      alert("Failed to update task. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this task? This action cannot be undone.")) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/tasks/client?taskId=${task.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      onUpdate();
      onClose();
    } catch (error) {
      console.error("Failed to delete task:", error);
      alert("Failed to delete task. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (url: string) => {
    const ext = url.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return '📄';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return '🖼️';
    if (['doc', 'docx'].includes(ext || '')) return '📝';
    if (['zip', 'rar'].includes(ext || '')) return '📦';
    return '📎';
  };

  const getFileName = (url: string) => {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const fileName = pathname.split('/').pop() || 'file';
      return decodeURIComponent(fileName);
    } catch {
      return url.split('/').pop() || 'file';
    }
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur-sm border-b border-white/10 p-6 flex items-start justify-between">
          <div className="flex-1">
            {isEditing ? (
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full text-2xl font-bold text-white bg-slate-800 border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-seezee-red/50"
              />
            ) : (
              <h2 className="text-2xl font-bold text-white mb-2">{task.title}</h2>
            )}
            <div className="flex items-center gap-4 mt-2 flex-wrap">
              <StatusBadge status={task.status} size="sm" />
              <span className="text-xs text-gray-400 uppercase tracking-wider px-2 py-1 bg-slate-800 rounded">
                {task.type}
              </span>
              {isOverdue && (
                <span className="text-xs text-red-400 uppercase tracking-wider px-2 py-1 bg-red-500/10 border border-red-500/30 rounded flex items-center gap-1">
                  <FiAlertCircle className="w-3 h-3" />
                  Overdue
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors ml-4"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Project & Client Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="seezee-glass rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-400 text-xs uppercase tracking-wider mb-2">
                <FiExternalLink className="w-3.5 h-3.5" />
                Project
              </div>
              <a
                href={`/admin/projects/${task.project.id}`}
                className="text-white font-medium hover:text-seezee-red transition-colors"
              >
                {task.project.name}
              </a>
              {task.project.organization && (
                <p className="text-gray-400 text-sm mt-1">{task.project.organization.name}</p>
              )}
            </div>

            <div className="seezee-glass rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-400 text-xs uppercase tracking-wider mb-2">
                <FiUser className="w-3.5 h-3.5" />
                Created By
              </div>
              <p className="text-white font-medium">{task.createdBy?.name || "Unknown"}</p>
              <p className="text-gray-400 text-sm">{task.createdBy?.email}</p>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="seezee-glass rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-400 text-xs uppercase tracking-wider mb-2">
                <FiCalendar className="w-3.5 h-3.5" />
                Due Date
              </div>
              {isEditing ? (
                <input
                  type="datetime-local"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full text-white bg-slate-800 border border-white/20 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-seezee-red/50"
                />
              ) : (
                <p className={`text-white font-medium ${isOverdue ? 'text-red-400' : ''}`}>
                  {task.dueDate ? new Date(task.dueDate).toLocaleString() : "No due date"}
                </p>
              )}
            </div>

            <div className="seezee-glass rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-400 text-xs uppercase tracking-wider mb-2">
                <FiClock className="w-3.5 h-3.5" />
                Created
              </div>
              <p className="text-white font-medium">
                {new Date(task.createdAt).toLocaleDateString()}
              </p>
            </div>

            {task.completedAt && (
              <div className="seezee-glass rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-400 text-xs uppercase tracking-wider mb-2">
                  <FiCheckCircle className="w-3.5 h-3.5" />
                  Completed
                </div>
                <p className="text-green-400 font-medium">
                  {new Date(task.completedAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="seezee-glass rounded-xl p-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Description
            </h3>
            {isEditing ? (
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={6}
                className="w-full text-white bg-slate-800 border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-seezee-red/50 resize-none"
              />
            ) : (
              <p className="text-white leading-relaxed whitespace-pre-wrap">{task.description}</p>
            )}
          </div>

          {/* Status Update */}
          {isEditing && (
            <div className="seezee-glass rounded-xl p-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Status
              </h3>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-slate-800 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-seezee-red/50"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          )}

          {/* Attachments */}
          {attachments.length > 0 && (
            <div className="seezee-glass rounded-xl p-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <FiFile className="w-4 h-4" />
                Attachments ({attachments.length})
              </h3>
              <div className="space-y-2">
                {attachments.map((url: string, index: number) => (
                  <a
                    key={index}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-all group"
                  >
                    <span className="text-2xl">{getFileIcon(url)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate group-hover:text-seezee-red transition-colors">
                        {getFileName(url)}
                      </p>
                      <p className="text-gray-400 text-xs">Click to view or download</p>
                    </div>
                    <FiDownload className="w-4 h-4 text-gray-400 group-hover:text-seezee-red transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Requires Upload Flag */}
          {task.requiresUpload && (
            <div className="seezee-glass rounded-xl p-4 border-l-4 border-seezee-blue">
              <div className="flex items-center gap-2 text-seezee-blue">
                <FiFile className="w-4 h-4" />
                <span className="text-sm font-medium">This task requires the client to upload files</span>
              </div>
            </div>
          )}

          {/* Submission Notes */}
          {task.submissionNotes && (
            <div className="seezee-glass rounded-xl p-6 border-l-4 border-green-500">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Client Submission Notes
              </h3>
              <p className="text-white leading-relaxed whitespace-pre-wrap">{task.submissionNotes}</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-slate-900/95 backdrop-blur-sm border-t border-white/10 p-6 flex items-center justify-between gap-4">
          {isEditing ? (
            <>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    title: task.title,
                    description: task.description,
                    status: task.status,
                    dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : "",
                  });
                }}
                disabled={loading}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={loading}
                className="px-6 py-2 bg-seezee-red hover:bg-seezee-red/80 rounded-lg text-white transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <FiCheckCircle className="w-4 h-4" />
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <FiTrash2 className="w-4 h-4" />
                Delete Task
              </button>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2 bg-seezee-red hover:bg-seezee-red/80 rounded-lg text-white transition-colors flex items-center gap-2"
                >
                  <FiEdit2 className="w-4 h-4" />
                  Edit Task
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
