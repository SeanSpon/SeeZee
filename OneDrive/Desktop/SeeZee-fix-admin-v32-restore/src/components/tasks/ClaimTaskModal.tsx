"use client";

import { useState } from "react";
import { X, DollarSign, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Task {
  id: string;
  title: string;
  description?: string;
  payoutAmount?: string;
  project?: {
    id: string;
    name: string;
  };
}

interface ClaimTaskModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ClaimTaskModal({
  task,
  isOpen,
  onClose,
  onSuccess,
}: ClaimTaskModalProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleClaim = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/tasks/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: task.id }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to claim task");
      }

      toast("Task claimed successfully!", "success");
      onSuccess();
    } catch (error: any) {
      toast(error.message || "Failed to claim task", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="glass w-full max-w-md rounded-lg border border-slate-700 shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Claim Task</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <h3 className="font-semibold text-white mb-2">{task.title}</h3>
            {task.description && (
              <p className="text-sm text-slate-400">{task.description}</p>
            )}
          </div>

          {task.project && (
            <div className="p-3 bg-slate-800/50 rounded-lg">
              <span className="text-xs text-slate-500">Project:</span>
              <p className="text-sm text-slate-300">{task.project.name}</p>
            </div>
          )}

          {task.payoutAmount && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-400" />
                <div>
                  <span className="text-xs text-slate-500">Payout Amount</span>
                  <p className="text-lg font-bold text-green-400">
                    ${task.payoutAmount}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
              <p className="text-sm text-yellow-300">
                By claiming this task, you agree to complete it according to the
                requirements. Payment will be processed after CEO approval.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-slate-700 flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleClaim}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Claim Task"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

