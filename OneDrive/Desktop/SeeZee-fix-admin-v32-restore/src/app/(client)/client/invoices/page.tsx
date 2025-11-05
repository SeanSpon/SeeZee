"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CreditCard, DollarSign, AlertCircle, CheckCircle, Eye } from "lucide-react";
import { fetchJson } from "@/lib/client-api";

interface Invoice {
  id: string;
  number: string;
  total: number;
  status: string;
  createdAt: string;
  dueDate?: string;
  paidAt?: string;
  project?: { name: string };
}

interface InvoicesData {
  invoices: Invoice[];
  totalSpent: number;
  pendingAmount: number;
  totalInvoices: number;
}

export default function ClientInvoicesPage() {
  const [data, setData] = useState<InvoicesData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJson<InvoicesData>("/api/client/invoices")
      .then((response) => {
        // Ensure we always have the expected structure
        setData({
          invoices: response.invoices || [],
          totalSpent: response.totalSpent || 0,
          pendingAmount: response.pendingAmount || 0,
          totalInvoices: response.totalInvoices || 0,
        });
      })
      .catch((error) => {
        console.error("Failed to fetch invoices:", error);
        // Set empty state on error
        setData({
          invoices: [],
          totalSpent: 0,
          pendingAmount: 0,
          totalInvoices: 0,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const getStatusColor = (status: string) => {
    const config: Record<string, { bg: string; text: string; border: string; label: string; gradient: string }> = {
      PAID: { bg: "bg-emerald-500/20", text: "text-emerald-300", border: "border-emerald-500/30", label: "Paid", gradient: "from-emerald-400 to-green-400" },
      SENT: { bg: "bg-blue-500/20", text: "text-blue-300", border: "border-blue-500/30", label: "Sent", gradient: "from-blue-400 to-cyan-400" },
      OVERDUE: { bg: "bg-red-500/20", text: "text-red-300", border: "border-red-500/30", label: "Overdue", gradient: "from-red-400 to-rose-400" },
      DRAFT: { bg: "bg-slate-500/20", text: "text-slate-300", border: "border-slate-500/30", label: "Draft", gradient: "from-slate-400 to-gray-400" },
    };
    return config[status] || { bg: "bg-slate-500/20", text: "text-slate-300", border: "border-slate-500/30", label: status, gradient: "from-slate-400 to-gray-400" };
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton h-32 rounded-2xl" />
          ))}
        </div>
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="seezee-glass p-12 text-center rounded-2xl">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400/60" />
        <h3 className="text-lg font-semibold text-white mb-2">Failed to load</h3>
        <p className="text-white/60">Please refresh the page to try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Invoices & Payments</h1>
        <p className="text-white/60">View and manage your project invoices</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="seezee-glass p-5 rounded-xl">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <CreditCard className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {data.totalInvoices || 0}
          </div>
          <div className="text-sm text-white/60">Total Invoices</div>
        </div>

        <div className="seezee-glass p-5 rounded-xl">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-emerald-400 mb-1">
            ${((data.totalSpent || 0) / 100).toFixed(2)}
          </div>
          <div className="text-sm text-white/60">Total Spent</div>
        </div>

        <div className="seezee-glass p-5 rounded-xl">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <DollarSign className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-amber-400 mb-1">
            ${((data.pendingAmount || 0) / 100).toFixed(2)}
          </div>
          <div className="text-sm text-white/60">Pending Payment</div>
        </div>
      </div>

      {/* Invoices Table */}
      {!data.invoices || data.invoices.length === 0 ? (
        <div className="seezee-glass p-12 text-center rounded-xl">
          <CreditCard className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No invoices yet</h3>
          <p className="text-white/60">Invoices will appear here once projects are started</p>
        </div>
      ) : (
        <div className="seezee-glass rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h3 className="text-lg font-bold text-white">All Invoices</h3>
          </div>
          <div className="divide-y divide-white/5">
            {data.invoices.map((invoice) => {
              const statusConfig = getStatusColor(invoice.status);
              return (
                <div
                  key={invoice.id}
                  className="p-5 hover:bg-white/5 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6 flex-1">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">
                            #{invoice.number}
                          </h4>
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                            {statusConfig.label}
                          </span>
                        </div>
                        <p className="text-sm text-white/60 mb-1">
                          {invoice.project?.name || "N/A"}
                        </p>
                        <p className="text-xs text-white/40">
                          Issued {new Date(invoice.createdAt).toLocaleDateString()}
                          {invoice.dueDate && ` • Due ${new Date(invoice.dueDate).toLocaleDateString()}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-white mb-1">
                          ${(Number(invoice.total) / 100).toFixed(2)}
                        </div>
                        {invoice.status === "PAID" && invoice.paidAt && (
                          <p className="text-xs text-emerald-400">Paid {new Date(invoice.paidAt).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-6">
                      <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 hover:border-blue-400/30 transition-all">
                        <Eye className="w-4 h-4 text-white/60 group-hover:text-blue-400 transition-colors" />
                      </button>
                      {invoice.status === "SENT" && (
                        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg transition-colors">
                          Pay Now
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
