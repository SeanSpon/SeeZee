"use client";

/**
 * Goals & Progress Tracker
 * 
 * Complete goal tracking system for:
 * - Revenue goals (monthly/quarterly targets)
 * - Client acquisition goals (new clients per month/quarter)
 * - Project completion goals
 * - Growth metrics (percentage increases)
 * - Marketing/Sales goals (leads, conversions)
 * - Team and operations goals
 * 
 * Features:
 * - Quick-start templates for common goal types
 * - Progress tracking with current/target values
 * - Category and status filtering
 * - Visual progress indicators
 * - Goal ownership and team collaboration
 * - Priority and deadline management
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable, type DataTableColumn } from "@/components/table/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import { EnhancedStatCard } from "@/components/admin/shared/EnhancedStatCard";
import { FiTarget, FiTrendingUp, FiCheckCircle, FiClock, FiPlus, FiEdit, FiTrash2, FiCalendar } from "react-icons/fi";
import type { CurrentUser } from "@/lib/auth/requireRole";
import { createGoal, updateGoal, deleteGoal } from "@/server/actions/goals";
import { GoalModal } from "@/components/admin/goals/GoalModal";

interface Goal {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  category?: string | null;
  targetValue?: number | null;
  currentValue?: number | null;
  unit?: string | null;
  startDate: Date | string;
  targetDate: Date | string;
  completedAt?: Date | string | null;
  owner: {
    id: string;
    name: string | null;
    email: string;
    image?: string | null;
  };
  teamMembers?: string[];
  notes?: string | null;
  createdAt: Date | string;
}

interface TeamMember {
  id: string;
  name: string | null;
  email: string;
  image?: string | null;
  role: string;
}

interface GoalsPageClientProps {
  user: CurrentUser;
  initialData: {
    goals: Goal[];
    teamMembers: TeamMember[];
    stats: {
      total: number;
      completed: number;
      inProgress: number;
      notStarted: number;
    };
  };
}

export function GoalsPageClient({ user, initialData }: GoalsPageClientProps) {
  const router = useRouter();
  const [goals, setGoals] = useState(initialData.goals);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Filter goals based on selected filters
  const filteredGoals = goals.filter((goal) => {
    const matchesCategory = filterCategory === "all" || goal.category === filterCategory;
    const matchesStatus = filterStatus === "all" || goal.status === filterStatus;
    return matchesCategory && matchesStatus;
  });

  // Get unique categories from goals
  const categories = Array.from(new Set(goals.map(g => g.category).filter(Boolean))) as string[];

  const handleDelete = async (goalId: string, goalTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${goalTitle}"? This action cannot be undone.`)) {
      return;
    }

    setDeleting(goalId);
    try {
      const result = await deleteGoal(goalId);
      if (!result.success) {
        throw new Error(result.error || "Failed to delete goal");
      }
      setGoals((prev) => prev.filter((g) => g.id !== goalId));
      router.refresh();
    } catch (error: any) {
      console.error("Failed to delete goal:", error);
      alert(`Failed to delete goal: ${error.message}`);
    } finally {
      setDeleting(null);
    }
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setIsModalOpen(true);
  };

  const handleCreateGoal = () => {
    setEditingGoal(null);
    setIsModalOpen(true);
  };

  const getProgressPercentage = (goal: Goal) => {
    if (!goal.targetValue || goal.targetValue === 0) return 0;
    const current = goal.currentValue || 0;
    return Math.min(Math.round((current / goal.targetValue) * 100), 100);
  };

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      NOT_STARTED: "gray",
      IN_PROGRESS: "blue",
      ON_TRACK: "green",
      AT_RISK: "yellow",
      DELAYED: "red",
      COMPLETED: "green",
      CANCELLED: "gray",
    };
    return statusMap[status] || "gray";
  };

  const columns: DataTableColumn<Goal>[] = [
    {
      header: "Goal",
      key: "title",
      render: (goal) => (
        <div className="space-y-1">
          <p className="font-heading text-sm font-semibold text-white">{goal.title}</p>
          {goal.category && <p className="text-xs text-gray-400">{goal.category}</p>}
        </div>
      ),
    },
    {
      header: "Status",
      key: "status",
      render: (goal) => <StatusBadge status={goal.status.toLowerCase().replace(/_/g, ' ')} size="sm" />,
    },
    {
      header: "Progress",
      key: "progress",
      render: (goal) => {
        const percentage = getProgressPercentage(goal);
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-trinity-red to-trinity-maroon"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-xs text-gray-300 w-8 text-right">{percentage}%</span>
            </div>
            {goal.targetValue && (
              <p className="text-xs text-gray-500">
                {goal.currentValue || 0} / {goal.targetValue} {goal.unit || ""}
              </p>
            )}
          </div>
        );
      },
    },
    {
      header: "Owner",
      key: "owner",
      render: (goal) => (
        <div className="flex items-center gap-2">
          {goal.owner.image && (
            <img src={goal.owner.image} alt={goal.owner.name || ""} className="w-6 h-6 rounded-full" />
          )}
          <span className="text-sm text-gray-300">{goal.owner.name || goal.owner.email}</span>
        </div>
      ),
    },
    {
      header: "Target Date",
      key: "targetDate",
      render: (goal) => (
        <div className="flex items-center gap-2 text-xs text-gray-300">
          <FiCalendar className="h-3.5 w-3.5 text-gray-500" />
          {new Date(goal.targetDate).toLocaleDateString()}
        </div>
      ),
    },
    {
      header: "Priority",
      key: "priority",
      render: (goal) => {
        const priorityColors: Record<string, string> = {
          LOW: "text-gray-400",
          MEDIUM: "text-blue-400",
          HIGH: "text-yellow-400",
          CRITICAL: "text-red-400",
        };
        return (
          <span className={`text-xs font-medium ${priorityColors[goal.priority] || "text-gray-400"}`}>
            {goal.priority}
          </span>
        );
      },
    },
    {
      header: "Actions",
      key: "actions",
      render: (goal) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEdit(goal)}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            title="Edit goal"
          >
            <FiEdit className="h-4 w-4 text-gray-400 hover:text-white" />
          </button>
          <button
            onClick={() => handleDelete(goal.id, goal.title)}
            disabled={deleting === goal.id}
            className="p-2 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
            title="Delete goal"
          >
            <FiTrash2 className="h-4 w-4 text-red-400 hover:text-red-300" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white mb-2">Goals & Progress</h1>
          <p className="text-gray-400">Track and manage organizational goals - clients, revenue, projects & more</p>
        </div>
        <button
          onClick={handleCreateGoal}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-trinity-red to-trinity-maroon text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          <FiPlus className="h-5 w-5" />
          New Goal
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <EnhancedStatCard
          label="Total Goals"
          value={initialData.stats.total}
          icon={FiTarget}
          iconColor="text-blue-400"
          iconBgColor="bg-blue-400/20"
        />
        <EnhancedStatCard
          label="In Progress"
          value={initialData.stats.inProgress}
          icon={FiTrendingUp}
          iconColor="text-yellow-400"
          iconBgColor="bg-yellow-400/20"
        />
        <EnhancedStatCard
          label="Completed"
          value={initialData.stats.completed}
          icon={FiCheckCircle}
          iconColor="text-green-400"
          iconBgColor="bg-green-400/20"
        />
        <EnhancedStatCard
          label="Not Started"
          value={initialData.stats.notStarted}
          icon={FiClock}
          iconColor="text-gray-400"
          iconBgColor="bg-gray-400/20"
        />
      </div>

      {/* Filters */}
      <div className="glass-panel p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Category:</span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all"
            >
              <option value="all">All Categories</option>
              <option value="Revenue">Revenue</option>
              <option value="Clients">Clients</option>
              <option value="Projects">Projects</option>
              <option value="Growth">Growth</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
              <option value="Team">Team</option>
              <option value="Product">Product</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all"
            >
              <option value="all">All Statuses</option>
              <option value="NOT_STARTED">Not Started</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="ON_TRACK">On Track</option>
              <option value="AT_RISK">At Risk</option>
              <option value="DELAYED">Delayed</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="ml-auto text-sm text-gray-400">
            Showing {filteredGoals.length} of {goals.length} goals
          </div>
        </div>
      </div>

      {/* Goals Table */}
      <div className="glass-panel p-6">
        <DataTable
          data={filteredGoals}
          columns={columns}
          emptyMessage="No goals found. Create your first goal to get started."
        />
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <GoalModal
          goal={editingGoal}
          teamMembers={initialData.teamMembers}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
