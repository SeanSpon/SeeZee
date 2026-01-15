"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiTarget, FiCalendar, FiUsers } from "react-icons/fi";
import { createGoal, updateGoal } from "@/server/actions/goals";
import { useRouter } from "next/navigation";

interface GoalModalProps {
  goal?: any; // Existing goal for edit mode
  teamMembers: Array<{
    id: string;
    name: string | null;
    email: string;
    image?: string | null;
    role: string;
  }>;
  onClose: () => void;
  onSuccess: () => void;
}

const GOAL_STATUSES = [
  { value: "NOT_STARTED", label: "Not Started" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "ON_TRACK", label: "On Track" },
  { value: "AT_RISK", label: "At Risk" },
  { value: "DELAYED", label: "Delayed" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

const GOAL_PRIORITIES = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "CRITICAL", label: "Critical" },
];

const GOAL_CATEGORIES = [
  { value: "Revenue", label: "Revenue", suggestedUnit: "$" },
  { value: "Clients", label: "Clients", suggestedUnit: "clients" },
  { value: "Projects", label: "Projects", suggestedUnit: "projects" },
  { value: "Growth", label: "Growth", suggestedUnit: "%" },
  { value: "Marketing", label: "Marketing", suggestedUnit: "leads" },
  { value: "Sales", label: "Sales", suggestedUnit: "$" },
  { value: "Team", label: "Team", suggestedUnit: "members" },
  { value: "Product", label: "Product", suggestedUnit: "features" },
  { value: "Operations", label: "Operations", suggestedUnit: "%" },
  { value: "Customer Success", label: "Customer Success", suggestedUnit: "%" },
  { value: "Other", label: "Other", suggestedUnit: "" },
];

const GOAL_TEMPLATES = [
  {
    name: "Monthly Revenue Target",
    title: "Achieve $X MRR",
    category: "Revenue",
    unit: "$",
    priority: "HIGH",
  },
  {
    name: "Client Acquisition",
    title: "Acquire X new clients",
    category: "Clients",
    unit: "clients",
    priority: "HIGH",
  },
  {
    name: "Project Completion",
    title: "Complete X projects",
    category: "Projects",
    unit: "projects",
    priority: "MEDIUM",
  },
  {
    name: "Revenue Growth",
    title: "Increase revenue by X%",
    category: "Growth",
    unit: "%",
    priority: "HIGH",
  },
  {
    name: "Lead Generation",
    title: "Generate X qualified leads",
    category: "Marketing",
    unit: "leads",
    priority: "MEDIUM",
  },
];

export function GoalModal({ goal, teamMembers, onClose, onSuccess }: GoalModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showTemplates, setShowTemplates] = useState(!goal);

  const [formData, setFormData] = useState({
    title: goal?.title || "",
    description: goal?.description || "",
    status: goal?.status || "NOT_STARTED",
    priority: goal?.priority || "MEDIUM",
    category: goal?.category || "",
    targetValue: goal?.targetValue || "",
    currentValue: goal?.currentValue || "",
    unit: goal?.unit || "",
    startDate: goal?.startDate
      ? new Date(goal.startDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    targetDate: goal?.targetDate
      ? new Date(goal.targetDate).toISOString().split("T")[0]
      : "",
    ownerId: goal?.owner?.id || "",
    notes: goal?.notes || "",
  });

  const applyTemplate = (template: typeof GOAL_TEMPLATES[0]) => {
    setFormData({
      ...formData,
      title: template.title,
      category: template.category,
      unit: template.unit,
      priority: template.priority,
    });
    setShowTemplates(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = {
        ...formData,
        targetValue: formData.targetValue ? parseFloat(formData.targetValue) : undefined,
        currentValue: formData.currentValue ? parseFloat(formData.currentValue) : undefined,
        startDate: new Date(formData.startDate),
        targetDate: new Date(formData.targetDate),
        completedAt: formData.status === "COMPLETED" ? new Date() : null,
      };

      let result;
      if (goal) {
        result = await updateGoal(goal.id, data);
      } else {
        result = await createGoal(data as any);
      }

      if (!result.success) {
        throw new Error(result.error || "Failed to save goal");
      }

      onSuccess();
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-3xl bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-white/10 bg-[#0f172a]">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <FiTarget className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {goal ? "Edit Goal" : "Create New Goal"}
                </h2>
                <p className="text-sm text-gray-400">
                  {goal ? "Update goal details and progress" : "Set a new goal for your team"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <FiX className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Quick Templates (only for new goals) */}
            {!goal && showTemplates && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-300">Quick Start Templates</h3>
                  <button
                    type="button"
                    onClick={() => setShowTemplates(false)}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    Skip templates
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {GOAL_TEMPLATES.map((template) => (
                    <button
                      key={template.name}
                      type="button"
                      onClick={() => applyTemplate(template)}
                      className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-left transition-all group"
                    >
                      <p className="font-medium text-white text-sm group-hover:text-red-400 transition-colors">
                        {template.name}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{template.category}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {(!showTemplates || goal) && (
              <>
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Goal Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Achieve $100k MRR"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all"
                  />
                </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the goal in detail..."
                rows={3}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all resize-none"
              />
            </div>

            {/* Status, Priority, Category */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Status *
                </label>
                <select
                  required
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all"
                >
                  {GOAL_STATUSES.map((status) => (
                    <option key={status.value} value={status.value} className="bg-gray-900">
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Priority *
                </label>
                <select
                  required
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all"
                >
                  {GOAL_PRIORITIES.map((priority) => (
                    <option key={priority.value} value={priority.value} className="bg-gray-900">
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => {
                    const selectedCategory = GOAL_CATEGORIES.find(cat => cat.value === e.target.value);
                    setFormData({ 
                      ...formData, 
                      category: e.target.value,
                      unit: formData.unit || selectedCategory?.suggestedUnit || ""
                    });
                  }}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all"
                >
                  <option value="" className="bg-gray-900">Select category</option>
                  {GOAL_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value} className="bg-gray-900">
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Target and Current Values */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Target Value
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.targetValue}
                  onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
                  placeholder="100"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Current Value
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.currentValue}
                  onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })}
                  placeholder="50"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Unit
                </label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="e.g., $, users, %"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all"
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <FiCalendar className="inline w-4 h-4 mr-1" />
                  Start Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <FiCalendar className="inline w-4 h-4 mr-1" />
                  Target Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.targetDate}
                  onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all"
                />
              </div>
            </div>

            {/* Owner */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <FiUsers className="inline w-4 h-4 mr-1" />
                Goal Owner *
              </label>
              <select
                required
                value={formData.ownerId}
                onChange={(e) => setFormData({ ...formData, ownerId: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all"
              >
                <option value="" className="bg-gray-900">Select owner</option>
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.id} className="bg-gray-900">
                    {member.name || member.email} - {member.role}
                  </option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add any additional notes or context..."
                rows={3}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FiTarget className="w-4 h-4" />
                    {goal ? "Update Goal" : "Create Goal"}
                  </>
                )}
              </button>
            </div>
            </>
            )}
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
