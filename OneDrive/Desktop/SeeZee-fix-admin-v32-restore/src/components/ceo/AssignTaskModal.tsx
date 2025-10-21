"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import AudiencePicker from "./AudiencePicker";
import DueDatePicker from "./DueDatePicker";
import { toast } from "@/hooks/use-toast";

interface AssignTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
}

export default function AssignTaskModal({
  isOpen,
  onClose,
  onSuccess,
}: AssignTaskModalProps) {
  const [audience, setAudience] = useState<{
    type: "USER" | "TEAM" | "ROLE";
    userIds?: string[];
    teamId?: string;
    role?: string;
  }>({ type: "USER", userIds: [] });
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadUsers();
      // Reset state when modal opens
      setAudience({ type: "USER", userIds: [] });
      setTitle("");
      setDescription("");
      setPriority("MEDIUM");
      setDueDate("");
      setError("");
    }
  }, [isOpen]);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await fetch("/api/admin/team");
      if (!response.ok) throw new Error("Failed to load users");
      const data = await response.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!title.trim()) {
        throw new Error("Task title is required");
      }

      if (!audience.userIds || audience.userIds.length === 0) {
        throw new Error("Please select at least one user");
      }

      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        userIds: audience.userIds,
        ...(dueDate && { dueDate: new Date(dueDate).toISOString() }),
      };

      const response = await fetch("/api/ceo/tasks/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to assign tasks");
      }

      const result = await response.json();

      // Show success toast
      toast(
        `Successfully assigned task to ${result.assigned} user(s)${
          result.skipped > 0 ? `. Skipped ${result.skipped} duplicate(s)` : ""
        }`,
        "success"
      );

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
      toast(err.message || "Failed to assign tasks", "error");
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case "HIGH":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      case "MEDIUM":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "LOW":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      default:
        return "bg-slate-500/20 text-slate-300 border-slate-500/30";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="glass w-full max-w-2xl rounded-lg border border-slate-700 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-xl font-bold">Assign Tasks</h2>
              <p className="text-sm text-slate-400 mt-1">
                Create and assign tasks to team members
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Task Title */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Task Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Complete project documentation"
              required
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add any additional details or context..."
              rows={3}
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>

          {/* Priority & Due Date Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Priority</label>
              <div className="grid grid-cols-3 gap-2">
                {(["LOW", "MEDIUM", "HIGH"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                      priority === p
                        ? getPriorityColor(p)
                        : "border-slate-700 hover:border-slate-600"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <DueDatePicker
                value={dueDate}
                onChange={setDueDate}
                label="Due Date (Optional)"
              />
            </div>
          </div>

          {/* User Selection */}
          <div>
            <label className="block text-sm font-medium mb-3">
              Assign To <span className="text-red-400">*</span>
            </label>
            <AudiencePicker
              value={audience}
              onChange={setAudience}
              users={users}
              loadingUsers={loadingUsers}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                loading ||
                !title.trim() ||
                !audience.userIds ||
                audience.userIds.length === 0
              }
              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading
                ? "Assigning..."
                : `Assign to ${audience.userIds?.length || 0} User(s)`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
