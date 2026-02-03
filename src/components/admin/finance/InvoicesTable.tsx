"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  MoreVertical,
  Send,
  Check,
  X,
  ExternalLink,
  Eye,
  Mail,
  Edit,
} from "lucide-react";
import { format, isPast } from "date-fns";
import { EditInvoiceModal } from "./EditInvoiceModal";

interface Invoice {
  id: string;
  number: string;
  title: string;
  description: string | null;
  status: string;
  total: number;
  amount: number;
  tax: number;
  currency: string;
  dueDate: Date;
  paidAt: Date | null;
  createdAt: Date;
  organizationId: string;
  projectId: string | null;
  organization: { id: string; name: string };
  project: { id: string; name: string } | null;
  items: Array<{
    id: string;
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
}

interface InvoicesTableProps {
  invoices: Invoice[];
  organizations?: Array<{
    id: string;
    name: string;
    stripeCustomerId: string | null;
  }>;
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const statusStyles: Record<string, string> = {
  DRAFT: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  SENT: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  PAID: "bg-green-500/20 text-green-400 border-green-500/30",
  OVERDUE: "bg-red-500/20 text-red-400 border-red-500/30",
  CANCELLED: "bg-gray-500/20 text-gray-500 border-gray-500/30",
};

export function InvoicesTable({ invoices, organizations = [] }: InvoicesTableProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  const handleSendReminder = async (invoiceId: string) => {
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/send-reminder`, {
        method: "POST",
      });
      if (res.ok) {
        alert("Reminder sent successfully!");
      }
    } catch (error) {
      console.error("Failed to send reminder:", error);
    }
    setOpenMenuId(null);
  };

  const handleMarkPaid = async (invoiceId: string) => {
    try {
      // Use admin API endpoint
      const res = await fetch(`/api/admin/invoices/${invoiceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PAID" }),
      });
      if (res.ok) {
        window.location.reload();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to mark as paid");
      }
    } catch (error) {
      console.error("Failed to mark as paid:", error);
      alert("Failed to mark invoice as paid. Please try again.");
    }
    setOpenMenuId(null);
  };

  const handleDelete = async (invoiceId: string) => {
    if (!confirm("Are you sure you want to delete this invoice? This action cannot be undone.")) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/invoices/${invoiceId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        window.location.reload();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete invoice");
      }
    } catch (error) {
      console.error("Failed to delete invoice:", error);
      alert("Failed to delete invoice. Please try again.");
    }
    setOpenMenuId(null);
  };

  const handleSendInvoice = async (invoiceId: string) => {
    try {
      const res = await fetch(`/api/admin/invoices/${invoiceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "SENT" }),
      });
      if (res.ok) {
        alert("Invoice marked as sent!");
        window.location.reload();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to send invoice");
      }
    } catch (error) {
      console.error("Failed to send invoice:", error);
      alert("Failed to send invoice. Please try again.");
    }
    setOpenMenuId(null);
  };

  if (invoices.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-gray-700 bg-[#151b2e] p-12 text-center">
        <p className="text-gray-400">No invoices found</p>
      </div>
    );
  }

  return (
    <>
      {editingInvoice && (
        <EditInvoiceModal
          invoice={editingInvoice}
          organizations={organizations}
          onClose={() => setEditingInvoice(null)}
          onSuccess={() => {
            setEditingInvoice(null);
          }}
        />
      )}
      
      <div className="rounded-2xl border-2 border-gray-700 glass-effect overflow-hidden">
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full min-w-full">
          <thead>
            <tr className="border-b border-gray-700 bg-[#1a2235]">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                Invoice
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                Client
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                Amount
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                Due Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {invoices.map((invoice, index) => {
              const dueDate = new Date(invoice.dueDate);
              const isOverdue =
                isPast(dueDate) && invoice.status !== "PAID";

              return (
                <motion.tr
                  key={invoice.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="hover:bg-[#1a2235] transition-colors"
                >
                  <td className="px-4 py-4">
                    <Link
                      href={`/admin/pipeline/invoices/${invoice.id}`}
                      className="flex flex-col"
                    >
                      <span className="text-sm font-semibold text-white hover:text-trinity-red transition">
                        {invoice.number}
                      </span>
                      <span className="text-xs text-gray-500 truncate max-w-[200px]">
                        {invoice.title}
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm text-white">
                        {invoice.organization.name}
                      </span>
                      {invoice.project && (
                        <span className="text-xs text-gray-500">
                          {invoice.project.name}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm font-semibold text-white">
                      {currencyFormatter.format(invoice.total)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`text-sm ${
                        isOverdue ? "text-red-400" : "text-gray-400"
                      }`}
                    >
                      {format(dueDate, "MMM d, yyyy")}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${
                        statusStyles[invoice.status] || statusStyles.DRAFT
                      }`}
                    >
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="relative inline-block">
                      <button
                        onClick={() =>
                          setOpenMenuId(
                            openMenuId === invoice.id ? null : invoice.id
                          )
                        }
                        className="p-2 rounded-lg hover:bg-gray-800 transition"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>

                      {openMenuId === invoice.id && (
                        <div className="absolute right-0 mt-2 w-48 rounded-lg border-2 border-gray-700 bg-[#151b2e] shadow-xl z-10">
                          <Link
                            href={`/admin/pipeline/invoices/${invoice.id}`}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-[#1a2235] hover:text-white transition"
                            onClick={() => setOpenMenuId(null)}
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </Link>
                          <button
                            onClick={() => {
                              setEditingInvoice(invoice);
                              setOpenMenuId(null);
                            }}
                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-[#1a2235] hover:text-white transition"
                          >
                            <Edit className="w-4 h-4" />
                            Edit Invoice
                          </button>
                          {invoice.status === "DRAFT" && (
                            <button
                              onClick={() => handleSendInvoice(invoice.id)}
                              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-blue-400 hover:bg-[#1a2235] transition"
                            >
                              <Send className="w-4 h-4" />
                              Mark as Sent
                            </button>
                          )}
                          {invoice.status !== "PAID" && (
                            <>
                              <button
                                onClick={() => handleSendReminder(invoice.id)}
                                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-[#1a2235] hover:text-white transition"
                              >
                                <Mail className="w-4 h-4" />
                                Send Reminder
                              </button>
                              <button
                                onClick={() => handleMarkPaid(invoice.id)}
                                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-green-400 hover:bg-[#1a2235] transition"
                              >
                                <Check className="w-4 h-4" />
                                Mark as Paid
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDelete(invoice.id)}
                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-[#1a2235] transition border-t border-gray-700"
                          >
                            <X className="w-4 h-4" />
                            Delete Invoice
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
    </>
  );
}

export default InvoicesTable;






