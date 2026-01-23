"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  FiUsers,
  FiBook,
  FiTool,
  FiCheckSquare,
  FiUser,
  FiUserCheck,
  FiTrendingUp,
  FiAlertCircle,
} from "react-icons/fi";
import { assignLearningResources, assignTools, assignTasksToTeam } from "@/server/actions/ceo";
import { UserRole } from "@prisma/client";
import { ROLE } from "@/lib/role";

interface WorkloadItem {
  userId: string;
  name: string;
  role: string;
  activeTasks: number;
  highPriorityTasks: number;
  activeProjects: number;
}

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  image: string | null;
}

interface Task {
  id: string;
  title: string;
  status: string;
  priority?: string;
}

interface Resource {
  id: string;
  title: string;
  type: string;
}

interface Tool {
  id: string;
  name: string;
  category: string;
}

interface TeamManagementClientProps {
  workload: WorkloadItem[];
  users: User[];
  availableTasks: Task[];
  availableResources: Resource[];
  availableTools: Tool[];
}

type AssignmentType = "resources" | "tools" | "tasks";
type AudienceType = "user" | "role";

export function TeamManagementClient({
  workload,
  users,
  availableTasks,
  availableResources,
  availableTools,
}: TeamManagementClientProps) {
  const [activeTab, setActiveTab] = useState<AssignmentType>("resources");
  const [audienceType, setAudienceType] = useState<AudienceType>("user");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleAssign = useCallback(async () => {
    if (selectedItems.length === 0) {
      setMessage({ type: "error", text: "Please select items to assign" });
      return;
    }

    if (audienceType === "user" && selectedUsers.length === 0) {
      setMessage({ type: "error", text: "Please select users" });
      return;
    }

    if (audienceType === "role" && selectedRoles.length === 0) {
      setMessage({ type: "error", text: "Please select roles" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      let result;
      if (activeTab === "resources") {
        result = await assignLearningResources({
          resourceIds: selectedItems,
          userIds: audienceType === "user" ? selectedUsers : undefined,
          roles: audienceType === "role" ? selectedRoles : undefined,
        });
      } else if (activeTab === "tools") {
        result = await assignTools({
          toolIds: selectedItems,
          userIds: audienceType === "user" ? selectedUsers : undefined,
          roles: audienceType === "role" ? selectedRoles : undefined,
        });
      } else {
        result = await assignTasksToTeam({
          taskIds: selectedItems,
          userIds: audienceType === "user" ? selectedUsers : undefined,
          roles: audienceType === "role" ? selectedRoles : undefined,
        });
      }

      if (result.success) {
        setMessage({ type: "success", text: result.message || "Assignment successful!" });
        setSelectedItems([]);
        setSelectedUsers([]);
        setSelectedRoles([]);
      } else {
        setMessage({ type: "error", text: result.error || "Assignment failed" });
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Assignment failed" });
    } finally {
      setLoading(false);
    }
  }, [activeTab, audienceType, selectedItems, selectedUsers, selectedRoles]);

  const availableItems =
    activeTab === "resources"
      ? availableResources
      : activeTab === "tools"
      ? availableTools
      : availableTasks;

  const roleOptions: UserRole[] = [
    ROLE.CFO,
    ROLE.FRONTEND,
    ROLE.BACKEND,
    ROLE.OUTREACH,
  ] as UserRole[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-#ef4444">
          CEO Command Center
        </span>
        <h1 className="text-3xl font-heading font-bold text-white">Team Management</h1>
        <p className="max-w-2xl text-sm text-gray-400">
          Assign learning resources, tools, and tasks to team members. Bulk assign by individual users or by role.
        </p>
      </div>

      {/* Message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-lg border p-4 ${
            message.type === "success"
              ? "border-green-500/20 bg-green-500/10 text-green-400"
              : "border-red-500/20 bg-red-500/10 text-red-400"
          }`}
        >
          {message.text}
        </motion.div>
      )}

      {/* Team Workload Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {workload.slice(0, 4).map((member) => (
          <div
            key={member.userId}
            className="rounded-2xl border border-gray-800 bg-gray-900/70 p-5 text-white"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FiUser className="h-4 w-4 text-gray-400" />
                <p className="text-sm font-medium truncate">{member.name}</p>
              </div>
              <span className="text-xs text-gray-500">{member.role}</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Active Tasks</span>
                <span className="font-semibold">{member.activeTasks}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">High Priority</span>
                <span className="font-semibold text-orange-400">{member.highPriorityTasks}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Projects</span>
                <span className="font-semibold">{member.activeProjects}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Assignment Interface */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900/70 p-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-800">
          {[
            { id: "resources" as AssignmentType, label: "Learning Resources", icon: FiBook },
            { id: "tools" as AssignmentType, label: "Tools", icon: FiTool },
            { id: "tasks" as AssignmentType, label: "Tasks", icon: FiCheckSquare },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSelectedItems([]);
              }}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-#ef4444 text-#ef4444"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left: Select Items */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">
              Select {activeTab === "resources" ? "Resources" : activeTab === "tools" ? "Tools" : "Tasks"}
            </h3>
            <div className="max-h-64 overflow-y-auto space-y-2 rounded-lg border border-gray-800 p-3">
              {availableItems.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No items available</p>
              ) : (
                availableItems.map((item) => (
                  <label
                    key={item.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems([...selectedItems, item.id]);
                        } else {
                          setSelectedItems(selectedItems.filter((id) => id !== item.id));
                        }
                      }}
                      className="rounded border-gray-700 text-#ef4444 focus:ring-#ef4444"
                    />
                    <span className="text-sm text-gray-300 flex-1">
                      {"title" in item ? item.title : "name" in item ? item.name : (item as any).id}
                    </span>
                  </label>
                ))
              )}
            </div>
            {selectedItems.length > 0 && (
              <p className="text-xs text-gray-400">
                {selectedItems.length} item{selectedItems.length !== 1 ? "s" : ""} selected
              </p>
            )}
          </div>

          {/* Right: Select Audience */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Assign To</h3>

            {/* Audience Type Toggle */}
            <div className="flex gap-2 p-1 rounded-lg bg-gray-800">
              <button
                onClick={() => {
                  setAudienceType("user");
                  setSelectedRoles([]);
                }}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  audienceType === "user"
                    ? "bg-#ef4444 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Individual Users
              </button>
              <button
                onClick={() => {
                  setAudienceType("role");
                  setSelectedUsers([]);
                }}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  audienceType === "role"
                    ? "bg-#ef4444 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                By Role
              </button>
            </div>

            {/* User Selection */}
            {audienceType === "user" && (
              <div className="max-h-64 overflow-y-auto space-y-2 rounded-lg border border-gray-800 p-3">
                {users.map((user) => (
                  <label
                    key={user.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers([...selectedUsers, user.id]);
                        } else {
                          setSelectedUsers(selectedUsers.filter((id) => id !== user.id));
                        }
                      }}
                      className="rounded border-gray-700 text-#ef4444 focus:ring-#ef4444"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{user.name || user.email}</p>
                      <p className="text-xs text-gray-500">{user.role}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {/* Role Selection */}
            {audienceType === "role" && (
              <div className="max-h-64 overflow-y-auto space-y-2 rounded-lg border border-gray-800 p-3">
                {roleOptions.map((role) => (
                  <label
                    key={role}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedRoles.includes(role)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRoles([...selectedRoles, role]);
                        } else {
                          setSelectedRoles(selectedRoles.filter((r) => r !== role));
                        }
                      }}
                      className="rounded border-gray-700 text-#ef4444 focus:ring-#ef4444"
                    />
                    <span className="text-sm text-gray-300">{role}</span>
                  </label>
                ))}
              </div>
            )}

            {/* Assign Button */}
            <button
              onClick={handleAssign}
              disabled={loading || selectedItems.length === 0}
              className="w-full px-4 py-3 rounded-lg bg-#ef4444 text-white font-semibold transition-colors hover:bg-#ef4444/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Assigning..." : "Assign"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

