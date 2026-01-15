"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import AudiencePicker from "./AudiencePicker";
import DueDatePicker from "./DueDatePicker";
import { toast } from "@/hooks/use-toast";

interface AssignToolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  toolId: string;
  toolName: string;
}

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
}

export default function AssignToolModal({
  isOpen,
  onClose,
  onSuccess,
  toolId,
  toolName,
}: AssignToolModalProps) {
  const [audience, setAudience] = useState<{
    type: "USER" | "TEAM" | "ROLE";
    userIds?: string[];
    teamId?: string;
    role?: string;
  }>({ type: "USER", userIds: [] });
  const [dueDate, setDueDate] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadUsers();
      // Reset state when modal opens
      setAudience({ type: "USER", userIds: [] });
      setDueDate("");
      setError("");
      setNotes("");
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
      // Always use USER type since we're selecting individual users
      if (!audience.userIds || audience.userIds.length === 0) {
        throw new Error("Please select at least one user");
      }

      const payload = {
        toolId,
        userIds: audience.userIds,
        ...(dueDate && { dueAt: new Date(dueDate).toISOString() }),
        ...(notes && { notes }),
      };

      const response = await fetch("/api/ceo/tool-assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to assign tool");
      }

      const result = await response.json();
      
      // Show success toast
      toast(
        `Successfully assigned tool to ${audience.userIds.length} user(s)`,
        "success"
      );
      
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
      toast(err.message || "Failed to assign tool", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="glass w-full max-w-2xl rounded-lg border border-slate-700 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-xl font-bold">Assign Tool</h2>
              <p className="text-sm text-slate-400 mt-1">{toolName}</p>
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

          {/* User Selection */}
          <div>
            <label className="block text-sm font-medium mb-3">
              Select Users to Assign <span className="text-red-400">*</span>
            </label>
            <AudiencePicker
              value={audience}
              onChange={setAudience}
              users={users}
              loadingUsers={loadingUsers}
            />
          </div>

          {/* Due Date */}
          <DueDatePicker
            value={dueDate}
            onChange={setDueDate}
            label="Setup/Onboard By (Optional)"
          />

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add setup instructions, access details, or other notes..."
              rows={3}
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
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
              disabled={loading || !audience.userIds || audience.userIds.length === 0}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "Assigning..." : `Assign to ${audience.userIds?.length || 0} User(s)`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
