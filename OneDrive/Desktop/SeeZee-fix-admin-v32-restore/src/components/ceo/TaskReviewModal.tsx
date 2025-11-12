"use client";

import { useState } from "react";
import { X, CheckCircle2, XCircle, Clock, DollarSign } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Task {
  id: string;
  title: string;
  description?: string;
  submissionNotes?: string;
  payoutAmount?: string;
  claimedBy?: {
    id: string;
    name: string;
    email: string;
  };
  project?: {
    id: string;
    name: string;
  };
  submittedAt?: string;
}

interface TaskReviewModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function TaskReviewModal({
  task,
  isOpen,
  onClose,
  onSuccess,
}: TaskReviewModalProps) {
  const [loading, setLoading] = useState(false);
  const [approve, setApprove] = useState<boolean | null>(null);
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  const handleReview = async (approved: boolean) => {
    setLoading(true);
    try {
      const response = await fetch("/api/ceo/tasks/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: task.id,
          approved,
          notes: notes || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to review task");
      }

      toast(
        approved ? "Task approved successfully!" : "Task rejected",
        approved ? "success" : "warning"
      );
      onSuccess();
    } catch (error: any) {
      toast(error.message || "Failed to review task", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="glass w-full max-w-2xl rounded-lg border border-slate-700 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-700 bg-gradient-to-r from-purple-500/10 to-blue-500/10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Review Task</h2>
              <p className="text-sm text-slate-400 mt-1">
                Approve or reject submitted task
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <h3 className="font-semibold text-white text-lg mb-2">
              {task.title}
            </h3>
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

          {task.claimedBy && (
            <div className="p-3 bg-slate-800/50 rounded-lg">
              <span className="text-xs text-slate-500">Submitted by:</span>
              <p className="text-sm text-slate-300">
                {task.claimedBy.name || task.claimedBy.email}
              </p>
            </div>
          )}

          {task.submittedAt && (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Clock className="w-4 h-4" />
              <span>
                Submitted: {new Date(task.submittedAt).toLocaleString()}
              </span>
            </div>
          )}

          {task.submissionNotes && (
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <span className="text-xs text-slate-500 mb-2 block">
                Submission Notes:
              </span>
              <p className="text-sm text-slate-300 whitespace-pre-wrap">
                {task.submissionNotes}
              </p>
            </div>
          )}

          {task.payoutAmount && (
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
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

          <div>
            <label className="block text-sm font-medium mb-2">
              Review Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any feedback or notes..."
              rows={3}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
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
            onClick={() => handleReview(false)}
            disabled={loading}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <XCircle className="w-4 h-4" />
            Reject
          </button>
          <button
            onClick={() => handleReview(true)}
            disabled={loading}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Approve
          </button>
        </div>
      </div>
    </div>
  );
}

