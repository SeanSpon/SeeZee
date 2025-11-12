"use client";

import { useState, useEffect } from "react";
import { Clock, DollarSign, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { ClaimTaskModal } from "./ClaimTaskModal";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  assignedToRole?: string;
  claimedById?: string;
  claimedBy?: {
    id: string;
    name: string;
    email: string;
  };
  payoutAmount?: string;
  project?: {
    id: string;
    name: string;
  };
  dueDate?: string;
}

interface TaskBoardProps {
  role?: string; // Filter by role
  projectId?: string; // Filter by project
}

export function TaskBoard({ role, projectId }: TaskBoardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showClaimModal, setShowClaimModal] = useState(false);

  useEffect(() => {
    loadTasks();
  }, [role, projectId]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (role) params.append("assignedToRole", role);
      if (projectId) params.append("projectId", projectId);

      const response = await fetch(`/api/tasks?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to load tasks");
      const data = await response.json();
      setTasks(data.tasks || []);
    } catch (error) {
      console.error("Failed to load tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = (task: Task) => {
    setSelectedTask(task);
    setShowClaimModal(true);
  };

  const handleClaimSuccess = () => {
    setShowClaimModal(false);
    setSelectedTask(null);
    loadTasks();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "TODO":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "CLAIMED":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "IN_PROGRESS":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      case "SUBMITTED":
        return "bg-orange-500/20 text-orange-300 border-orange-500/30";
      case "AWAITING_PAYOUT":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "DONE":
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
      default:
        return "bg-slate-500/20 text-slate-300 border-slate-500/30";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "text-red-400";
      case "MEDIUM":
        return "text-yellow-400";
      case "LOW":
        return "text-green-400";
      default:
        return "text-gray-400";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {tasks.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No tasks available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="glass p-6 rounded-lg border border-slate-700 hover:border-purple-500/50 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-white">{task.title}</h3>
                  <span
                    className={`px-2 py-1 rounded text-xs border ${getStatusColor(task.status)}`}
                  >
                    {task.status.replace("_", " ")}
                  </span>
                </div>

                {task.description && (
                  <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                    {task.description}
                  </p>
                )}

                <div className="space-y-2 mb-4">
                  {task.project && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>Project:</span>
                      <span className="text-slate-400">{task.project.name}</span>
                    </div>
                  )}

                  {task.payoutAmount && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <DollarSign className="w-3 h-3" />
                      <span className="text-green-400 font-medium">
                        ${task.payoutAmount}
                      </span>
                    </div>
                  )}

                  {task.dueDate && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500">Priority:</span>
                    <span className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </span>
                  </div>
                </div>

                {task.claimedBy && (
                  <div className="mb-4 p-2 bg-slate-800/50 rounded text-xs">
                    <span className="text-slate-500">Claimed by: </span>
                    <span className="text-slate-300">{task.claimedBy.name || task.claimedBy.email}</span>
                  </div>
                )}

                {task.status === "TODO" && task.assignedToRole && !task.claimedById && (
                  <button
                    onClick={() => handleClaim(task)}
                    className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    Claim Task
                  </button>
                )}

                {task.status === "CLAIMED" && task.claimedById && (
                  <div className="text-xs text-slate-400 text-center">
                    Task claimed - work in progress
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showClaimModal && selectedTask && (
        <ClaimTaskModal
          task={selectedTask}
          isOpen={showClaimModal}
          onClose={() => {
            setShowClaimModal(false);
            setSelectedTask(null);
          }}
          onSuccess={handleClaimSuccess}
        />
      )}
    </>
  );
}

