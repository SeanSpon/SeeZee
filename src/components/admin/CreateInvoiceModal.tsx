"use client";

import { useState, useEffect } from "react";
import { Modal } from "./shared/Modal";
import { createInvoiceWithLineItems, getProjects } from "@/server/actions/pipeline";
import { useRouter } from "next/navigation";
import { FiFileText, FiDollarSign, FiCalendar, FiTag, FiAlignLeft, FiPlus, FiTrash2 } from "react-icons/fi";

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface Project {
  id: string;
  name: string;
  organizationId: string;
  organization: {
    id: string;
    name: string;
  };
}

const INVOICE_TYPE_OPTIONS = [
  { value: "deposit", label: "Deposit" },
  { value: "final", label: "Final Payment" },
  { value: "subscription", label: "Subscription" },
  { value: "custom", label: "Custom" },
];

// Common line item templates
const LINE_ITEM_TEMPLATES = [
  { description: "Website Development", rate: 2000 },
  { description: "Domain Name Registration", rate: 15 },
  { description: "Web Hosting (Annual)", rate: 120 },
  { description: "Website Maintenance (Monthly)", rate: 50 },
  { description: "Premium Support (Monthly)", rate: 90 },
  { description: "SSL Certificate", rate: 50 },
  { description: "Custom Feature Development", rate: 500 },
  { description: "Content Creation", rate: 300 },
  { description: "SEO Optimization", rate: 400 },
  { description: "E-commerce Setup", rate: 800 },
];

export function CreateInvoiceModal({ isOpen, onClose }: CreateInvoiceModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  const [formData, setFormData] = useState({
    projectId: "",
    organizationId: "",
    title: "",
    description: "",
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 30 days from now
    tax: 0,
    invoiceType: "custom",
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([
    {
      id: crypto.randomUUID(),
      description: "",
      quantity: 1,
      rate: 0,
      amount: 0,
    },
  ]);

  // Load projects on mount
  useEffect(() => {
    if (isOpen) {
      loadProjects();
    }
  }, [isOpen]);

  const loadProjects = async () => {
    setLoadingProjects(true);
    const result = await getProjects();
    if (result.success && result.projects) {
      setProjects(result.projects as unknown as Project[]);
    }
    setLoadingProjects(false);
  };

  // Update organization when project changes
  useEffect(() => {
    if (formData.projectId) {
      const selectedProject = projects.find((p) => p.id === formData.projectId);
      if (selectedProject) {
        setFormData((prev) => ({
          ...prev,
          organizationId: selectedProject.organizationId,
        }));
      }
    }
  }, [formData.projectId, projects]);

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        id: crypto.randomUUID(),
        description: "",
        quantity: 1,
        rate: 0,
        amount: 0,
      },
    ]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((item) => item.id !== id));
    }
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems(
      lineItems.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          // Recalculate amount when quantity or rate changes
          if (field === "quantity" || field === "rate") {
            updated.amount = updated.quantity * updated.rate;
          }
          return updated;
        }
        return item;
      })
    );
  };

  const applyTemplate = (index: number, template: { description: string; rate: number }) => {
    const item = lineItems[index];
    if (item) {
      updateLineItem(item.id, "description", template.description);
      updateLineItem(item.id, "rate", template.rate);
    }
  };

  // Calculate totals
  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const taxAmount = formData.tax;
  const total = subtotal + taxAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.projectId) {
      setError("Please select a project");
      return;
    }

    if (lineItems.length === 0 || lineItems.every((item) => !item.description)) {
      setError("Please add at least one line item");
      return;
    }

    setLoading(true);
    setError(null);

    const result = await createInvoiceWithLineItems({
      projectId: formData.projectId,
      organizationId: formData.organizationId,
      title: formData.title || "Invoice",
      description: formData.description,
      dueDate: new Date(formData.dueDate),
      tax: taxAmount,
      invoiceType: formData.invoiceType,
      items: lineItems
        .filter((item) => item.description && item.amount > 0)
        .map((item) => ({
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount,
        })),
    });

    if (result.success) {
      router.refresh();
      onClose();
      // Reset form
      setFormData({
        projectId: "",
        organizationId: "",
        title: "",
        description: "",
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        tax: 0,
        invoiceType: "custom",
      });
      setLineItems([
        {
          id: crypto.randomUUID(),
          description: "",
          quantity: 1,
          rate: 0,
          amount: 0,
        },
      ]);
    } else {
      setError(result.error || "Failed to create invoice");
    }
    setLoading(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Invoice"
      size="xl"
      footer={
        <div className="flex items-center justify-end gap-3">
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
            form="create-invoice-form"
            disabled={loading}
            className="px-6 py-2 rounded-lg border-2 border-#ef4444/50 bg-#ef4444 text-white hover:bg-#dc2626 transition-colors disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Invoice"}
          </button>
        </div>
      }
    >
      <form id="create-invoice-form" onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Project Selection */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
            <FiTag className="h-4 w-4 text-#ef4444" />
            Project *
          </label>
          {loadingProjects ? (
            <div className="text-sm text-gray-500">Loading projects...</div>
          ) : (
            <select
              value={formData.projectId}
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-800/50 text-white focus:border-#ef4444/50 focus:outline-none transition-colors"
            >
              <option value="">Select a project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name} ({project.organization?.name})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Invoice Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <FiFileText className="h-4 w-4 text-#ef4444" />
              Invoice Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="E.g., Website Development - Initial Payment"
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-800/50 text-white focus:border-#ef4444/50 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <FiTag className="h-4 w-4 text-#ef4444" />
              Invoice Type
            </label>
            <select
              value={formData.invoiceType}
              onChange={(e) => setFormData({ ...formData, invoiceType: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-800/50 text-white focus:border-#ef4444/50 focus:outline-none transition-colors"
            >
              {INVOICE_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <FiCalendar className="h-4 w-4 text-#ef4444" />
              Due Date *
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-800/50 text-white focus:border-#ef4444/50 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
            <FiAlignLeft className="h-4 w-4 text-#ef4444" />
            Description (Optional)
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={2}
            placeholder="Additional notes or payment terms..."
            className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-800/50 text-white focus:border-#ef4444/50 focus:outline-none transition-colors resize-none"
          />
        </div>

        {/* Line Items */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Line Items</h3>
            <button
              type="button"
              onClick={addLineItem}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm text-gray-300 transition-colors"
            >
              <FiPlus className="w-4 h-4" />
              Add Item
            </button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {lineItems.map((item, index) => (
              <div
                key={item.id}
                className="p-4 rounded-lg border border-gray-700 bg-gray-800/30 space-y-3"
              >
                {/* Template Selector */}
                <div className="flex items-center justify-between gap-2">
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        const template = LINE_ITEM_TEMPLATES[parseInt(e.target.value)];
                        applyTemplate(index, template);
                        e.target.value = ""; // Reset selector
                      }
                    }}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-gray-700 bg-gray-800/50 text-sm text-gray-300 focus:border-#ef4444/50 focus:outline-none"
                  >
                    <option value="">Quick add template...</option>
                    {LINE_ITEM_TEMPLATES.map((template, idx) => (
                      <option key={idx} value={idx}>
                        {template.description} (${template.rate})
                      </option>
                    ))}
                  </select>
                  {lineItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLineItem(item.id)}
                      className="p-1.5 rounded hover:bg-red-500/20 text-red-400 transition-colors"
                      title="Remove item"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-12 md:col-span-5">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateLineItem(item.id, "description", e.target.value)}
                      placeholder="Description"
                      required
                      className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-gray-800/50 text-white text-sm focus:border-#ef4444/50 focus:outline-none"
                    />
                  </div>
                  <div className="col-span-4 md:col-span-2">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        updateLineItem(item.id, "quantity", parseInt(e.target.value) || 1)
                      }
                      placeholder="Qty"
                      min="1"
                      required
                      className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-gray-800/50 text-white text-sm focus:border-#ef4444/50 focus:outline-none"
                    />
                  </div>
                  <div className="col-span-4 md:col-span-2">
                    <input
                      type="number"
                      value={item.rate}
                      onChange={(e) =>
                        updateLineItem(item.id, "rate", parseFloat(e.target.value) || 0)
                      }
                      placeholder="Rate"
                      min="0"
                      step="0.01"
                      required
                      className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-gray-800/50 text-white text-sm focus:border-#ef4444/50 focus:outline-none"
                    />
                  </div>
                  <div className="col-span-4 md:col-span-3">
                    <div className="px-3 py-2 rounded-lg border border-gray-700 bg-gray-900/50 text-white text-sm font-medium">
                      ${item.amount.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="rounded-lg border border-gray-700 bg-gray-800/30 p-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Subtotal</span>
            <span className="text-white font-medium">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <label className="text-sm text-gray-400">Tax</label>
            <input
              type="number"
              value={formData.tax}
              onChange={(e) => setFormData({ ...formData, tax: parseFloat(e.target.value) || 0 })}
              min="0"
              step="0.01"
              className="w-32 px-3 py-1.5 rounded-lg border border-gray-700 bg-gray-800/50 text-white text-sm focus:border-#ef4444/50 focus:outline-none"
            />
          </div>
          <div className="pt-3 border-t border-gray-700 flex items-center justify-between">
            <span className="text-lg font-semibold text-white">Total</span>
            <span className="text-2xl font-bold text-#ef4444">${total.toFixed(2)}</span>
          </div>
        </div>
      </form>
    </Modal>
  );
}



