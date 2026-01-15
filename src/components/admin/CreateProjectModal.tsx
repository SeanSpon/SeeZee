"use client";

import { useState } from "react";
import { Modal } from "./shared/Modal";
import { FiAlertCircle, FiLoader } from "react-icons/fi";

interface Organization {
  id: string;
  name: string | null;
  email: string | null;
  company?: string | null;
  image?: string | null;
}

interface Admin {
  id: string;
  name: string | null;
  email: string;
  role: string;
  image?: string | null;
}

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  clients: Organization[];
  admins: Admin[];
}

const projectTypes = ["Website", "Web App", "E-commerce", "Maintenance", "Custom"];
const projectStatuses = ["LEAD", "QUOTED", "DEPOSIT_PAID", "ACTIVE", "REVIEW", "COMPLETED", "MAINTENANCE", "CANCELLED"];
const priorityLevels = ["Low", "Medium", "High", "Urgent"];

export function CreateProjectModal({ isOpen, onClose, onSuccess, clients, admins }: ProjectModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    organizationId: "",
    assigneeId: "",
    type: "Website",
    status: "LEAD",
    priority: "Medium",
    budget: "",
    startDate: new Date().toISOString().split("T")[0],
    estimatedCompletion: "",
    description: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation
    if (!formData.name.trim()) {
      setError("Project name is required");
      setLoading(false);
      return;
    }

    if (formData.name.trim().length < 3) {
      setError("Project name must be at least 3 characters");
      setLoading(false);
      return;
    }

    if (!formData.organizationId) {
      setError("Client/Organization is required");
      setLoading(false);
      return;
    }

    if (formData.budget && isNaN(parseFloat(formData.budget))) {
      setError("Budget must be a valid number");
      setLoading(false);
      return;
    }

    if (formData.budget && parseFloat(formData.budget) <= 0) {
      setError("Budget must be greater than 0");
      setLoading(false);
      return;
    }

    if (formData.estimatedCompletion && formData.estimatedCompletion < formData.startDate) {
      setError("Estimated completion date must be after start date");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/admin/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          organizationId: formData.organizationId,
          assigneeId: formData.assigneeId || null,
          type: formData.type,
          status: formData.status.toUpperCase(),
          priority: formData.priority,
          budget: formData.budget ? parseFloat(formData.budget) : null,
          startDate: new Date(formData.startDate).toISOString(),
          estimatedCompletion: formData.estimatedCompletion
            ? new Date(formData.estimatedCompletion).toISOString()
            : null,
          description: formData.description,
        }),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        console.error("API Error Response:", responseData);
        throw new Error(responseData.error || `Failed to create project (${response.status})`);
      }

      // Success
      setFormData({
        name: "",
        organizationId: "",
        assigneeId: "",
        type: "Website",
        status: "Planning",
        priority: "Medium",
        budget: "",
        startDate: new Date().toISOString().split("T")[0],
        estimatedCompletion: "",
        description: "",
      });
      onSuccess();
    } catch (error: any) {
      setError(error.message || "Failed to create project");
      console.error("Project creation error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="New Project"
      size="lg"
      footer={
        <div className="flex gap-3 ml-auto">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2 rounded-lg border-2 border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="project-form"
            disabled={loading}
            className="px-6 py-2 rounded-lg border-2 border-trinity-red/50 bg-trinity-red text-white hover:bg-trinity-maroon transition-colors disabled:opacity-50 inline-flex items-center gap-2"
          >
            {loading && <FiLoader className="w-4 h-4 animate-spin" />}
            {loading ? "Creating..." : "Create Project"}
          </button>
        </div>
      }
    >
      <form id="project-form" onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4 flex gap-3">
            <FiAlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Project Details */}
        <div>
          <h3 className="text-lg font-heading font-semibold text-white mb-4">Project Details</h3>
          <div className="space-y-4">
            {/* Project Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Project Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., E-commerce Platform Redesign"
                className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-700 bg-gray-900/50 text-white placeholder:text-gray-500 focus:outline-none focus:border-trinity-red transition-colors"
              />
            </div>

            {/* Client Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Client * <span className="text-xs text-gray-500">(Organizations & Registered Users)</span>
              </label>
              <select
                name="organizationId"
                value={formData.organizationId}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-700 bg-gray-900/50 text-white focus:outline-none focus:border-trinity-red transition-colors"
              >
                <option value="">Select a client...</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name || client.email || "Unnamed Client"}
                    {(client as any).type === 'user' ? ' (Signed Up)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Assignee Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Assign To (Optional)
              </label>
              <select
                name="assigneeId"
                value={formData.assigneeId}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-700 bg-gray-900/50 text-white focus:outline-none focus:border-trinity-red transition-colors"
              >
                <option value="">Unassigned</option>
                {admins.map((admin) => (
                  <option key={admin.id} value={admin.id}>
                    {admin.name || admin.email} ({admin.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Project Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Project Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-700 bg-gray-900/50 text-white focus:outline-none focus:border-trinity-red transition-colors"
              >
                {projectTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-700 bg-gray-900/50 text-white focus:outline-none focus:border-trinity-red transition-colors"
              >
                {projectStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Budget & Timeline */}
        <div>
          <h3 className="text-lg font-heading font-semibold text-white mb-4">Budget & Timeline</h3>
          <div className="space-y-4">
            {/* Budget */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Budget (USD)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input
                  type="number"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  placeholder="5000.00"
                  step="0.01"
                  min="0"
                  className="w-full pl-8 pr-4 py-2.5 rounded-lg border-2 border-gray-700 bg-gray-900/50 text-white placeholder:text-gray-500 focus:outline-none focus:border-trinity-red transition-colors"
                />
              </div>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-700 bg-gray-900/50 text-white focus:outline-none focus:border-trinity-red transition-colors"
              />
            </div>

            {/* Estimated Completion */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Estimated Completion
              </label>
              <input
                type="date"
                name="estimatedCompletion"
                value={formData.estimatedCompletion}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-700 bg-gray-900/50 text-white focus:outline-none focus:border-trinity-red transition-colors"
              />
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-700 bg-gray-900/50 text-white focus:outline-none focus:border-trinity-red transition-colors"
              >
                {priorityLevels.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Project details, scope, and notes..."
            rows={4}
            className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-700 bg-gray-900/50 text-white placeholder:text-gray-500 focus:outline-none focus:border-trinity-red transition-colors resize-none"
          />
        </div>
      </form>
    </Modal>
  );
}
