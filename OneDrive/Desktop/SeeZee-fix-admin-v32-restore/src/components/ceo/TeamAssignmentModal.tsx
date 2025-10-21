"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { UserRole } from "@prisma/client";
import {
  assignLearningResources,
  assignTools,
  assignTasksToTeam,
} from "@/server/actions";

interface TeamAssignmentModalProps {
  onClose: () => void;
}

type AssignmentType = "learning" | "tools" | "tasks";
type TargetType = "users" | "roles";

const AVAILABLE_ROLES: UserRole[] = ["CEO", "ADMIN", "STAFF"];

export function TeamAssignmentModal({ onClose }: TeamAssignmentModalProps) {
  const [assignmentType, setAssignmentType] =
    useState<AssignmentType>("learning");
  const [targetType, setTargetType] = useState<TargetType>("roles");
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([]);
  const [resourceIds, setResourceIds] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    if (!resourceIds.trim()) {
      setMessage("Please enter resource IDs");
      return;
    }

    if (targetType === "roles" && selectedRoles.length === 0) {
      setMessage("Please select at least one role");
      return;
    }

    setLoading(true);
    setMessage("");

    const ids = resourceIds.split(",").map((id) => id.trim());

    try {
      let result;
      const assignmentData = {
        [assignmentType === "learning"
          ? "resourceIds"
          : assignmentType === "tools"
          ? "toolIds"
          : "taskIds"]: ids,
        ...(targetType === "roles" ? { roles: selectedRoles } : {}),
      };

      if (assignmentType === "learning") {
        result = await assignLearningResources(assignmentData as any);
      } else if (assignmentType === "tools") {
        result = await assignTools(assignmentData as any);
      } else {
        result = await assignTasksToTeam(assignmentData as any);
      }

      if (result.success) {
        setMessage("✓ " + result.message);
        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 1500);
      } else {
        setMessage("✗ " + (result.error || "Assignment failed"));
      }
    } catch (error) {
      setMessage("✗ Failed to assign resources");
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = (role: UserRole) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-white/10 rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">
            Assign Resources to Team
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Assignment Type */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Resource Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["learning", "tools", "tasks"] as AssignmentType[]).map(
                (type) => (
                  <button
                    key={type}
                    onClick={() => setAssignmentType(type)}
                    className={`px-3 py-2 rounded text-sm font-medium transition-all ${
                      assignmentType === type
                        ? "bg-blue-600 text-white"
                        : "bg-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Target Type */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Assign To
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(["roles", "users"] as TargetType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setTargetType(type)}
                  className={`px-3 py-2 rounded text-sm font-medium transition-all ${
                    targetType === type
                      ? "bg-blue-600 text-white"
                      : "bg-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Role Selection */}
          {targetType === "roles" && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Select Roles
              </label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_ROLES.map((role) => (
                  <button
                    key={role}
                    onClick={() => toggleRole(role)}
                    className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                      selectedRoles.includes(role)
                        ? "bg-blue-600 text-white"
                        : "bg-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Resource IDs */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              {assignmentType === "learning"
                ? "Resource IDs"
                : assignmentType === "tools"
                ? "Tool IDs"
                : "Task IDs"}{" "}
              <span className="text-slate-500">(comma-separated)</span>
            </label>
            <input
              type="text"
              value={resourceIds}
              onChange={(e) => setResourceIds(e.target.value)}
              placeholder="id1, id2, id3"
              className="w-full px-3 py-2 rounded bg-slate-800 border border-white/10 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Message */}
          {message && (
            <div
              className={`text-sm p-3 rounded ${
                message.startsWith("✓")
                  ? "bg-green-500/20 text-green-400"
                  : "bg-red-500/20 text-red-400"
              }`}
            >
              {message}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium transition-all"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Assigning..." : "Assign"}
          </button>
        </div>
      </div>
    </div>
  );
}
