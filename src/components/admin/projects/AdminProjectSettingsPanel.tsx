"use client";

/**
 * Admin Project Settings Panel
 * Allows admin users to edit project name, description, status, team type, and other settings
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SectionCard } from "@/components/admin/SectionCard";
import {
  Settings,
  Save,
  X,
  Edit2,
  User,
  Users,
  Calendar,
  DollarSign,
  AlertTriangle,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface AdminProjectSettingsPanelProps {
  project: {
    id: string;
    name: string;
    description: string | null;
    status: string;
    teamType?: string;
    budget: number | null;
    startDate: Date | string | null;
    endDate: Date | string | null;
    isNonprofit?: boolean;
    assigneeId?: string | null;
    currentStage?: string;
    progress?: number;
  };
  assignees?: Array<{
    id: string;
    name: string | null;
    email: string | null;
  }>;
}

const PROJECT_STATUSES = [
  { value: "LEAD", label: "Lead" },
  { value: "QUOTED", label: "Quoted" },
  { value: "DEPOSIT_PAID", label: "Deposit Paid" },
  { value: "ACTIVE", label: "Active" },
  { value: "REVIEW", label: "Review" },
  { value: "COMPLETED", label: "Completed" },
  { value: "ON_HOLD", label: "On Hold" },
  { value: "CANCELLED", label: "Cancelled" },
];

const PROJECT_STAGES = [
  { value: "DISCOVERY", label: "Discovery" },
  { value: "PROPOSAL", label: "Proposal" },
  { value: "DESIGN", label: "Design" },
  { value: "DEVELOPMENT", label: "Development" },
  { value: "REVIEW", label: "Review" },
  { value: "LAUNCH", label: "Launch" },
];

const TEAM_TYPES = [
  { value: "INDIVIDUAL", label: "Individual", description: "Single person working on this project", icon: User },
  { value: "TEAM_LEAD", label: "Team Lead", description: "Team project with assigned lead", icon: Users },
];

export function AdminProjectSettingsPanel({
  project,
  assignees = [],
}: AdminProjectSettingsPanelProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: project.name,
    description: project.description || "",
    status: project.status,
    teamType: project.teamType || "INDIVIDUAL",
    budget: project.budget?.toString() || "",
    startDate: project.startDate ? new Date(project.startDate).toISOString().split("T")[0] : "",
    endDate: project.endDate ? new Date(project.endDate).toISOString().split("T")[0] : "",
    isNonprofit: project.isNonprofit || false,
    assigneeId: project.assigneeId || "",
    currentStage: project.currentStage || "DISCOVERY",
    progress: project.progress?.toString() || "0",
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleCancel = () => {
    // Reset form to original values
    setFormData({
      name: project.name,
      description: project.description || "",
      status: project.status,
      teamType: project.teamType || "INDIVIDUAL",
      budget: project.budget?.toString() || "",
      startDate: project.startDate ? new Date(project.startDate).toISOString().split("T")[0] : "",
      endDate: project.endDate ? new Date(project.endDate).toISOString().split("T")[0] : "",
      isNonprofit: project.isNonprofit || false,
      assigneeId: project.assigneeId || "",
      currentStage: project.currentStage || "DISCOVERY",
      progress: project.progress?.toString() || "0",
    });
    setHasChanges(false);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast("Project name is required", "error");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(`/api/admin/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
          status: formData.status,
          teamType: formData.teamType,
          budget: formData.budget ? parseFloat(formData.budget) : null,
          startDate: formData.startDate || null,
          endDate: formData.endDate || null,
          isNonprofit: formData.isNonprofit,
          assigneeId: formData.assigneeId || null,
          currentStage: formData.currentStage,
          progress: parseInt(formData.progress) || 0,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update project");
      }

      toast("Project updated successfully", "success");
      setHasChanges(false);
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      console.error("Error updating project:", error);
      toast(error instanceof Error ? error.message : "Failed to update project", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SectionCard
      title="Project Settings"
      description="Edit project details and configuration"
      action={
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-white/10 text-sm font-medium transition-all disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || !hasChanges}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30 text-sm font-medium transition-all"
            >
              <Edit2 className="w-4 h-4" />
              Edit Settings
            </button>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {/* Basic Info Section */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-white/60 uppercase tracking-wide flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Basic Information
          </h4>

          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              Project Name <span className="text-red-400">*</span>
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Enter project name"
                className="w-full px-4 py-2 rounded-lg bg-slate-800/60 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            ) : (
              <p className="text-white font-medium">{formData.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              Description
            </label>
            {isEditing ? (
              <textarea
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Brief description of the project..."
                rows={3}
                className="w-full px-4 py-2 rounded-lg bg-slate-800/60 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
              />
            ) : (
              <p className="text-white/80 text-sm">
                {formData.description || "No description provided"}
              </p>
            )}
          </div>

          {/* Status and Stage */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                Status
              </label>
              {isEditing ? (
                <select
                  value={formData.status}
                  onChange={(e) => handleChange("status", e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-slate-800/60 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  {PROJECT_STATUSES.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  {PROJECT_STATUSES.find((s) => s.value === formData.status)?.label || formData.status}
                </span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                Current Stage
              </label>
              {isEditing ? (
                <select
                  value={formData.currentStage}
                  onChange={(e) => handleChange("currentStage", e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-slate-800/60 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  {PROJECT_STAGES.map((stage) => (
                    <option key={stage.value} value={stage.value}>
                      {stage.label}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  {PROJECT_STAGES.find((s) => s.value === formData.currentStage)?.label || formData.currentStage}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Team Type Section */}
        <div className="space-y-4 pt-4 border-t border-white/10">
          <h4 className="text-sm font-semibold text-white/60 uppercase tracking-wide flex items-center gap-2">
            <Users className="w-4 h-4" />
            Team Configuration
          </h4>

          {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {TEAM_TYPES.map((type) => {
                const Icon = type.icon;
                const isSelected = formData.teamType === type.value;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleChange("teamType", type.value)}
                    className={`flex items-start gap-3 p-4 rounded-xl border transition-all text-left ${
                      isSelected
                        ? "bg-blue-500/20 border-blue-500/50 ring-2 ring-blue-500/30"
                        : "bg-slate-800/40 border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isSelected ? "bg-blue-500/30 text-blue-400" : "bg-slate-700/50 text-slate-400"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${isSelected ? "text-white" : "text-slate-300"}`}>
                          {type.label}
                        </span>
                        {isSelected && <CheckCircle className="w-4 h-4 text-blue-400" />}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{type.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/40 border border-white/10">
              {formData.teamType === "TEAM_LEAD" ? (
                <>
                  <Users className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="font-medium text-white">Team Lead</p>
                    <p className="text-xs text-slate-500">Team project with assigned lead</p>
                  </div>
                </>
              ) : (
                <>
                  <User className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="font-medium text-white">Individual</p>
                    <p className="text-xs text-slate-500">Single person working on this project</p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Assignee (show if team type is set) */}
          {assignees.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                Assigned To
              </label>
              {isEditing ? (
                <select
                  value={formData.assigneeId}
                  onChange={(e) => handleChange("assigneeId", e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-slate-800/60 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="">Unassigned</option>
                  {assignees.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name || user.email}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-white/80 text-sm">
                  {assignees.find((a) => a.id === formData.assigneeId)?.name || "Unassigned"}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Dates and Budget Section */}
        <div className="space-y-4 pt-4 border-t border-white/10">
          <h4 className="text-sm font-semibold text-white/60 uppercase tracking-wide flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Timeline & Budget
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                Start Date
              </label>
              {isEditing ? (
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleChange("startDate", e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-slate-800/60 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              ) : (
                <p className="text-white/80 text-sm">
                  {formData.startDate ? new Date(formData.startDate).toLocaleDateString() : "Not set"}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                End Date
              </label>
              {isEditing ? (
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleChange("endDate", e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-slate-800/60 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              ) : (
                <p className="text-white/80 text-sm">
                  {formData.endDate ? new Date(formData.endDate).toLocaleDateString() : "Not set"}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                <DollarSign className="w-3 h-3 inline mr-1" />
                Budget
              </label>
              {isEditing ? (
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => handleChange("budget", e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-7 pr-4 py-2 rounded-lg bg-slate-800/60 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
              ) : (
                <p className="text-white/80 text-sm">
                  {formData.budget ? `$${parseFloat(formData.budget).toLocaleString()}` : "Not set"}
                </p>
              )}
            </div>
          </div>

          {/* Progress */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              Progress ({formData.progress}%)
            </label>
            {isEditing ? (
              <input
                type="range"
                min="0"
                max="100"
                value={formData.progress}
                onChange={(e) => handleChange("progress", e.target.value)}
                className="w-full h-2 rounded-full appearance-none bg-slate-700 cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${formData.progress}%, #334155 ${formData.progress}%, #334155 100%)`,
                }}
              />
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#ef4444] rounded-full transition-all"
                    style={{ width: `${formData.progress}%` }}
                  />
                </div>
                <span className="text-white font-medium text-sm">{formData.progress}%</span>
              </div>
            )}
          </div>

          {/* Nonprofit checkbox */}
          <div className="flex items-center gap-2">
            {isEditing ? (
              <input
                type="checkbox"
                id="isNonprofit"
                checked={formData.isNonprofit}
                onChange={(e) => handleChange("isNonprofit", e.target.checked)}
                className="w-4 h-4 rounded bg-slate-800 border-white/20 text-blue-500 focus:ring-blue-500/50"
              />
            ) : (
              <div className={`w-4 h-4 rounded flex items-center justify-center ${formData.isNonprofit ? "bg-blue-500" : "bg-slate-700"}`}>
                {formData.isNonprofit && <CheckCircle className="w-3 h-3 text-white" />}
              </div>
            )}
            <label htmlFor="isNonprofit" className="text-sm text-slate-400">
              This is a nonprofit project (discounted rates apply)
            </label>
          </div>
        </div>

        {/* Unsaved Changes Warning */}
        {hasChanges && isEditing && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <p className="text-sm text-amber-300">You have unsaved changes</p>
          </div>
        )}
      </div>
    </SectionCard>
  );
}
