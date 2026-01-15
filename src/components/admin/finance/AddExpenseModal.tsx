"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiDollarSign, FiCalendar, FiRepeat, FiTag } from "react-icons/fi";

const EXPENSE_CATEGORIES = [
  { value: "SOFTWARE", label: "Software", icon: "💻" },
  { value: "HOSTING", label: "Hosting & Domains", icon: "🌐" },
  { value: "TOOLS", label: "Dev Tools", icon: "🛠️" },
  { value: "MARKETING", label: "Marketing", icon: "📣" },
  { value: "SUBSCRIPTIONS", label: "Subscriptions", icon: "🔄" },
  { value: "OFFICE", label: "Office Supplies", icon: "📎" },
  { value: "PAYROLL", label: "Payroll/Contractors", icon: "👥" },
  { value: "UTILITIES", label: "Utilities", icon: "⚡" },
  { value: "TRAVEL", label: "Travel", icon: "✈️" },
  { value: "MEALS", label: "Meals & Entertainment", icon: "🍔" },
  { value: "EQUIPMENT", label: "Equipment", icon: "🖥️" },
  { value: "LEGAL", label: "Legal", icon: "⚖️" },
  { value: "INSURANCE", label: "Insurance", icon: "🛡️" },
  { value: "EDUCATION", label: "Education & Training", icon: "📚" },
  { value: "OTHER", label: "Other", icon: "📦" },
];

const COMMON_VENDORS = [
  "Vercel",
  "Cursor",
  "OpenAI",
  "GitHub",
  "Anthropic",
  "Google Cloud",
  "AWS",
  "Cloudflare",
  "Figma",
  "Stripe",
  "Resend",
  "Railway",
  "PlanetScale",
  "Supabase",
  "Linear",
  "Notion",
  "Slack",
  "Zoom",
  "Adobe",
  "Microsoft 365",
];

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editExpense?: any; // For edit mode
}

export function AddExpenseModal({
  isOpen,
  onClose,
  onSuccess,
  editExpense,
}: AddExpenseModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    amount: "",
    category: "SOFTWARE",
    vendor: "",
    status: "PAID",
    isRecurring: false,
    frequency: "monthly",
    expenseDate: new Date().toISOString().split("T")[0],
    nextDueDate: "",
    receiptUrl: "",
    notes: "",
    tags: "",
  });

  // Update form data when editExpense changes or modal opens
  useEffect(() => {
    if (isOpen) {
      if (editExpense) {
        // Editing mode - populate with expense data
        setFormData({
          name: editExpense.name || "",
          description: editExpense.description || "",
          amount: editExpense.amount ? (editExpense.amount / 100).toFixed(2) : "",
          category: editExpense.category || "SOFTWARE",
          vendor: editExpense.vendor || "",
          status: editExpense.status || "PAID",
          isRecurring: editExpense.isRecurring || false,
          frequency: editExpense.frequency || "monthly",
          expenseDate: editExpense.expenseDate
            ? new Date(editExpense.expenseDate).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
          nextDueDate: editExpense.nextDueDate
            ? new Date(editExpense.nextDueDate).toISOString().split("T")[0]
            : "",
          receiptUrl: editExpense.receiptUrl || "",
          notes: editExpense.notes || "",
          tags: editExpense.tags?.join(", ") || "",
        });
      } else {
        // Add mode - reset to defaults
        setFormData({
          name: "",
          description: "",
          amount: "",
          category: "SOFTWARE",
          vendor: "",
          status: "PAID",
          isRecurring: false,
          frequency: "monthly",
          expenseDate: new Date().toISOString().split("T")[0],
          nextDueDate: "",
          receiptUrl: "",
          notes: "",
          tags: "",
        });
      }
      setError("");
    }
  }, [isOpen, editExpense]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const url = editExpense
        ? `/api/admin/expenses/${editExpense.id}`
        : "/api/admin/expenses";
      const method = editExpense ? "PATCH" : "POST";

      // Prepare data with proper null handling for optional fields
      const payload = {
        name: formData.name,
        description: formData.description || null,
        amount: parseFloat(formData.amount),
        category: formData.category,
        vendor: formData.vendor || null,
        status: formData.status,
        isRecurring: formData.isRecurring,
        frequency: formData.isRecurring ? formData.frequency : null,
        nextDueDate: formData.nextDueDate || null,
        expenseDate: formData.expenseDate,
        receiptUrl: formData.receiptUrl || null,
        notes: formData.notes || null,
        tags: formData.tags
          .split(",")
          .map((t: string) => t.trim())
          .filter(Boolean),
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save expense");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
            className="relative w-full max-w-2xl bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
          >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-white/10 bg-[#0f172a]">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <FiDollarSign className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {editExpense ? "Edit Expense" : "Add New Expense"}
                </h2>
                <p className="text-sm text-gray-400">
                  Track your business spending
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

            {/* Name and Amount */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Expense Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Vercel Pro Subscription"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Amount (USD) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Category and Vendor */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all"
                >
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value} className="bg-gray-900">
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Vendor
                </label>
                <input
                  type="text"
                  list="vendors"
                  value={formData.vendor}
                  onChange={(e) =>
                    setFormData({ ...formData, vendor: e.target.value })
                  }
                  placeholder="e.g., Vercel, Cursor, OpenAI"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all"
                />
                <datalist id="vendors">
                  {COMMON_VENDORS.map((v) => (
                    <option key={v} value={v} />
                  ))}
                </datalist>
              </div>
            </div>

            {/* Date and Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <FiCalendar className="inline w-4 h-4 mr-1" />
                  Expense Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.expenseDate}
                  onChange={(e) =>
                    setFormData({ ...formData, expenseDate: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all"
                >
                  <option value="PAID" className="bg-gray-900">Paid</option>
                  <option value="PENDING" className="bg-gray-900">Pending</option>
                  <option value="RECURRING" className="bg-gray-900">Recurring</option>
                  <option value="CANCELLED" className="bg-gray-900">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Recurring Toggle */}
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FiRepeat className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium text-white">
                    Recurring Expense
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      isRecurring: !formData.isRecurring,
                    })
                  }
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    formData.isRecurring ? "bg-blue-500" : "bg-gray-600"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      formData.isRecurring ? "left-7" : "left-1"
                    }`}
                  />
                </button>
              </div>

              {formData.isRecurring && (
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">
                      Frequency
                    </label>
                    <select
                      value={formData.frequency}
                      onChange={(e) =>
                        setFormData({ ...formData, frequency: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                    >
                      <option value="monthly" className="bg-gray-900">Monthly</option>
                      <option value="quarterly" className="bg-gray-900">Quarterly</option>
                      <option value="yearly" className="bg-gray-900">Yearly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">
                      Next Due Date
                    </label>
                    <input
                      type="date"
                      value={formData.nextDueDate}
                      onChange={(e) =>
                        setFormData({ ...formData, nextDueDate: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Add details about this expense..."
                rows={2}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all resize-none"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <FiTag className="inline w-4 h-4 mr-1" />
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) =>
                  setFormData({ ...formData, tags: e.target.value })
                }
                placeholder="e.g., infrastructure, ai, productivity"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all"
              />
            </div>

            {/* Receipt URL and Notes */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Receipt URL
                </label>
                <input
                  type="url"
                  value={formData.receiptUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, receiptUrl: e.target.value })
                  }
                  placeholder="https://..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notes
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Internal notes..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all"
                />
              </div>
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
                    <FiDollarSign className="w-4 h-4" />
                    {editExpense ? "Update Expense" : "Add Expense"}
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
