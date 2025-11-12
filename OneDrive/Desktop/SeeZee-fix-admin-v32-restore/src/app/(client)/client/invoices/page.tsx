"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { CreditCard, DollarSign, AlertCircle, CheckCircle, Eye, Download, Search, Filter, X } from "lucide-react";
import { fetchJson } from "@/lib/client-api";
import { motion, AnimatePresence } from "framer-motion";

interface Invoice {
  id: string;
  number: string;
  total: number;
  status: string;
  createdAt: string;
  dueDate?: string;
  paidAt?: string;
  project?: { name: string };
  payUrl?: string | null;
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
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

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

  const filteredInvoices = useMemo(() => {
    if (!data?.invoices) return [];
    
    let filtered = [...data.invoices];
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (inv) =>
          inv.number.toLowerCase().includes(query) ||
          inv.project?.name?.toLowerCase().includes(query) ||
          inv.status.toLowerCase().includes(query)
      );
    }
    
    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((inv) => inv.status === statusFilter);
    }
    
    return filtered;
  }, [data?.invoices, searchQuery, statusFilter]);

  const handleDownload = async (invoice: Invoice) => {
    // In a real implementation, this would download the PDF
    // For now, we'll open it in a new tab or show a message
    try {
      const response = await fetch(`/api/client/invoices/${invoice.id}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `invoice-${invoice.number}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert("Invoice download not yet available. Please contact support.");
      }
    } catch (error) {
      console.error("Failed to download invoice:", error);
      alert("Invoice download not yet available. Please contact support.");
    }
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
        <div className="bg-gray-900 border border-gray-800 p-12 text-center rounded-2xl">
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
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Invoices & payments</h1>
        <p className="text-white/60">
          See what’s been paid, what’s outstanding, and open any invoice for the full details.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-900 border border-gray-800 p-5 rounded-xl">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <CreditCard className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {data.totalInvoices || 0}
          </div>
          <div className="text-sm text-white/60">Invoices issued</div>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-5 rounded-xl">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-emerald-400 mb-1">
            ${((data.totalSpent || 0) / 100).toFixed(2)}
          </div>
          <div className="text-sm text-white/60">Paid to date</div>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-5 rounded-xl">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <DollarSign className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-amber-400 mb-1">
            ${((data.pendingAmount || 0) / 100).toFixed(2)}
          </div>
          <div className="text-sm text-white/60">Amount due</div>
        </div>
      </div>

      {/* Search and Filter */}
      {data.invoices && data.invoices.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Search invoices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              />
            </div>
            <div className="flex gap-2">
              {["all", "PAID", "SENT", "OVERDUE", "DRAFT"].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    statusFilter === status
                      ? "bg-blue-500 text-white"
                      : "bg-white/5 text-white/60 hover:bg-white/10"
                  }`}
                >
                  {status === "all" ? "All" : getStatusColor(status).label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Invoices Table */}
      {!data.invoices || data.invoices.length === 0 ? (
        <div className="seezee-glass p-12 text-center rounded-xl">
          <CreditCard className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No invoices yet</h3>
          <p className="text-white/60">Invoices will appear here once projects are started</p>
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div className="seezee-glass p-12 text-center rounded-xl">
          <Search className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No invoices found</h3>
          <p className="text-white/60 mb-4">Try adjusting your search or filters</p>
          <button
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("all");
            }}
            className="text-blue-400 hover:text-blue-300 text-sm font-medium"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Invoices</h3>
              <span className="text-sm text-white/60">
                Showing {filteredInvoices.length} of {data.invoices.length}
              </span>
            </div>
          </div>
          <div className="divide-y divide-white/5">
            <AnimatePresence>
              {filteredInvoices.map((invoice) => {
              const statusConfig = getStatusColor(invoice.status);
              return (
                <div
                  key={invoice.id}
                  className="p-5 hover:bg-gray-800 transition-all group"
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
                      <button
                        onClick={() => handleDownload(invoice)}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 hover:border-blue-400/30 transition-all"
                        title="Download invoice"
                      >
                        <Download className="w-4 h-4 text-white/60 group-hover:text-blue-400 transition-colors" />
                      </button>
                      <button
                        onClick={() => setSelectedInvoice(invoice)}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 hover:border-blue-400/30 transition-all"
                        title="View details"
                      >
                        <Eye className="w-4 h-4 text-white/60 group-hover:text-blue-400 transition-colors" />
                      </button>
                      {invoice.status === "SENT" && (
                        invoice.payUrl ? (
                          <button
                            onClick={() => window.open(invoice.payUrl as string, "_blank", "noopener")}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg transition-colors"
                          >
                            Pay now
                          </button>
                        ) : (
                          <span className="text-xs text-white/40">
                            Reach out to finish this payment
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Invoice Detail Modal */}
      <AnimatePresence>
        {selectedInvoice && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedInvoice(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div
                className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Invoice #{selectedInvoice.number}</h2>
                  <button
                    onClick={() => setSelectedInvoice(null)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-white/60" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-white/10">
                    <span className="text-white/60">Status</span>
                    <span className={`font-semibold ${getStatusColor(selectedInvoice.status).text}`}>
                      {getStatusColor(selectedInvoice.status).label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-white/10">
                    <span className="text-white/60">Project</span>
                    <span className="font-semibold text-white">{selectedInvoice.project?.name || "N/A"}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-white/10">
                    <span className="text-white/60">Amount</span>
                    <span className="text-2xl font-bold text-white">${(Number(selectedInvoice.total) / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-white/10">
                    <span className="text-white/60">Issued</span>
                    <span className="font-semibold text-white">
                      {new Date(selectedInvoice.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {selectedInvoice.dueDate && (
                    <div className="flex items-center justify-between py-3 border-b border-white/10">
                      <span className="text-white/60">Due Date</span>
                      <span className="font-semibold text-white">
                        {new Date(selectedInvoice.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {selectedInvoice.paidAt && (
                    <div className="flex items-center justify-between py-3 border-b border-white/10">
                      <span className="text-white/60">Paid On</span>
                      <span className="font-semibold text-emerald-400">
                        {new Date(selectedInvoice.paidAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 mt-6 pt-6 border-t border-white/10">
                  <button
                    onClick={() => handleDownload(selectedInvoice)}
                    className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </button>
                  <button
                    onClick={() => setSelectedInvoice(null)}
                    className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-lg transition-colors border border-white/10"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
