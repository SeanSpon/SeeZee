"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  FiFileText, 
  FiCreditCard, 
  FiRefreshCw,
  FiPlus,
  FiSearch,
  FiFilter,
  FiDownload,
  FiEdit,
  FiTrash2,
  FiSend,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiX,
  FiDollarSign
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { RecordTransactionModal } from "./RecordTransactionModal";
import { CreateInvoiceModal } from "./CreateInvoiceModal";

interface Invoice {
  id: string;
  number: string;
  title: string | null;
  description: string | null;
  organizationId: string;
  organizationName: string;
  organizationEmail: string | null;
  projectId: string | null;
  projectName: string | null;
  amount: number;
  tax: number;
  total: number;
  status: string;
  issueDate: string | null;
  dueDate: string | null;
  paidAt: string | null;
  createdAt: string;
  payments: Array<{
    id: string;
    amount: number;
    paymentMethod: string | null;
    status: string;
    createdAt: string;
  }>;
}

interface Payment {
  id: string;
  amount: number;
  paymentMethod: string | null;
  status: string;
  invoiceId: string | null;
  invoiceNumber: string;
  invoiceTitle: string | null;
  clientName: string;
  stripePaymentIntentId: string | null;
  createdAt: string;
}


interface Organization {
  id: string;
  name: string;
  email: string | null;
  stripeCustomerId: string | null;
}

interface Project {
  id: string;
  name: string;
  organizationId: string;
  status: string;
}

interface TransactionsManagerProps {
  invoices: Invoice[];
  payments: Payment[];
  organizations: Organization[];
  projects: Project[];
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
};

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case "paid":
    case "completed":
    case "active":
      return <FiCheckCircle className="w-4 h-4 text-green-400" />;
    case "sent":
    case "pending":
      return <FiClock className="w-4 h-4 text-blue-400" />;
    case "overdue":
    case "failed":
      return <FiAlertCircle className="w-4 h-4 text-red-400" />;
    case "canceled":
    case "draft":
      return <FiX className="w-4 h-4 text-gray-400" />;
    default:
      return <FiClock className="w-4 h-4 text-gray-400" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "paid":
    case "completed":
    case "active":
      return "text-green-400 bg-green-500/20 border-green-500/30";
    case "sent":
    case "pending":
      return "text-blue-400 bg-blue-500/20 border-blue-500/30";
    case "overdue":
    case "failed":
      return "text-red-400 bg-red-500/20 border-red-500/30";
    case "canceled":
    case "draft":
      return "text-gray-400 bg-gray-500/20 border-gray-500/30";
    default:
      return "text-gray-400 bg-gray-500/20 border-gray-500/30";
  }
};

export function TransactionsManager({
  invoices,
  payments,
  organizations,
  projects,
}: TransactionsManagerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams?.get("tab") || "invoices";
  
  const [activeTab, setActiveTab] = useState<"invoices" | "payments">(
    tabParam as any || "invoices"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showRecordTransaction, setShowRecordTransaction] = useState(false);

  const handleTransactionSuccess = () => {
    // Refresh the page to show new transaction
    window.location.reload();
  };
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);

  // Invoice action handlers
  const handleEditInvoice = (invoiceId: string) => {
    window.location.href = `/admin/pipeline/invoices/${invoiceId}`;
  };

  const handleSendInvoice = async (invoiceId: string) => {
    if (!confirm("Mark this invoice as sent?")) return;
    
    try {
      const res = await fetch(`/api/admin/invoices/${invoiceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "SENT" }),
      });

      if (res.ok) {
        window.location.reload();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to send invoice");
      }
    } catch (error) {
      console.error("Failed to send invoice:", error);
      alert("Failed to send invoice. Please try again.");
    }
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
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
  };


  const handleExportData = () => {
    let dataToExport: any[] = [];
    let filename = "";

    if (activeTab === "invoices") {
      dataToExport = filteredInvoices.map(inv => ({
        "Invoice Number": inv.number,
        "Client": inv.organizationName,
        "Project": inv.projectName || "N/A",
        "Amount": inv.total,
        "Status": inv.status,
        "Due Date": inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "N/A",
        "Created": new Date(inv.createdAt).toLocaleDateString(),
      }));
      filename = "invoices_export.csv";
    } else if (activeTab === "payments") {
      dataToExport = filteredPayments.map(payment => ({
        "Date": new Date(payment.createdAt).toLocaleDateString(),
        "Client": payment.clientName,
        "Invoice": payment.invoiceNumber,
        "Amount": payment.amount,
        "Method": payment.paymentMethod || "N/A",
        "Status": payment.status,
      }));
      filename = "payments_export.csv";
    }

    // Convert to CSV
    if (dataToExport.length === 0) {
      alert("No data to export");
      return;
    }

    const headers = Object.keys(dataToExport[0]);
    const csvContent = [
      headers.join(","),
      ...dataToExport.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escape commas and quotes
          if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(",")
      ),
    ].join("\n");

    // Download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter data based on search and status
  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = 
      inv.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.organizationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.title?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || inv.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || payment.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });


  // Calculate totals
  const invoiceTotals = {
    all: invoices.length,
    paid: invoices.filter(i => i.status === "PAID").length,
    sent: invoices.filter(i => i.status === "SENT").length,
    overdue: invoices.filter(i => i.status === "OVERDUE").length,
    draft: invoices.filter(i => i.status === "DRAFT").length,
    totalAmount: invoices.reduce((sum, i) => sum + i.total, 0),
    paidAmount: invoices.filter(i => i.status === "PAID").reduce((sum, i) => sum + i.total, 0),
  };

  const paymentTotals = {
    all: payments.length,
    completed: payments.filter(p => p.status === "COMPLETED").length,
    pending: payments.filter(p => p.status === "PENDING").length,
    failed: payments.filter(p => p.status === "FAILED").length,
    totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
  };


  return (
    <div className="space-y-6 p-6">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Transactions</h1>
          <p className="text-gray-400 mt-1">Manage invoices and payments</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowRecordTransaction(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-lg transition-all text-white flex items-center gap-2 font-medium"
          >
            <FiDollarSign className="w-4 h-4" />
            Record Payment
          </button>
          <button
            onClick={() => setShowCreateInvoice(true)}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors text-white flex items-center gap-2"
          >
            <FiPlus className="w-4 h-4" />
            New Invoice
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-white/10">
        <button
          onClick={() => setActiveTab("invoices")}
          className={`px-4 py-3 font-medium transition-colors relative ${
            activeTab === "invoices"
              ? "text-emerald-400"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <div className="flex items-center gap-2">
            <FiFileText className="w-4 h-4" />
            Invoices
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/10">
              {invoiceTotals.all}
            </span>
          </div>
          {activeTab === "invoices" && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400"
            />
          )}
        </button>
        
        <button
          onClick={() => setActiveTab("payments")}
          className={`px-4 py-3 font-medium transition-colors relative ${
            activeTab === "payments"
              ? "text-emerald-400"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <div className="flex items-center gap-2">
            <FiCreditCard className="w-4 h-4" />
            Payments
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/10">
              {paymentTotals.all}
            </span>
          </div>
          {activeTab === "payments" && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400"
            />
          )}
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {activeTab === "invoices" && (
          <>
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Total Amount</p>
              <p className="text-2xl font-bold text-white mt-1">
                {formatCurrency(invoiceTotals.totalAmount)}
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Paid</p>
              <p className="text-2xl font-bold text-green-400 mt-1">
                {invoiceTotals.paid}
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Outstanding</p>
              <p className="text-2xl font-bold text-orange-400 mt-1">
                {invoiceTotals.sent}
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Overdue</p>
              <p className="text-2xl font-bold text-red-400 mt-1">
                {invoiceTotals.overdue}
              </p>
            </div>
          </>
        )}
        
        {activeTab === "payments" && (
          <>
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Total Received</p>
              <p className="text-2xl font-bold text-white mt-1">
                {formatCurrency(paymentTotals.totalAmount)}
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Completed</p>
              <p className="text-2xl font-bold text-green-400 mt-1">
                {paymentTotals.completed}
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Pending</p>
              <p className="text-2xl font-bold text-blue-400 mt-1">
                {paymentTotals.pending}
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Failed</p>
              <p className="text-2xl font-bold text-red-400 mt-1">
                {paymentTotals.failed}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500/50"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
        >
          <option value="all">All Status</option>
          {activeTab === "invoices" && (
            <>
              <option value="paid">Paid</option>
              <option value="sent">Sent</option>
              <option value="overdue">Overdue</option>
              <option value="draft">Draft</option>
            </>
          )}
          {activeTab === "payments" && (
            <>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </>
          )}
        </select>
        <button 
          onClick={handleExportData}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors flex items-center gap-2"
        >
          <FiDownload className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === "invoices" && (
          <motion.div
            key="invoices"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white/5 border border-white/10 rounded-xl overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Invoice</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Due Date</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-white font-medium">{invoice.number}</p>
                          {invoice.title && (
                            <p className="text-sm text-gray-400">{invoice.title}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-white">{invoice.organizationName}</p>
                          {invoice.projectName && (
                            <p className="text-sm text-gray-400">{invoice.projectName}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-white font-semibold">{formatCurrency(invoice.total)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs border ${getStatusColor(invoice.status)}`}>
                          {getStatusIcon(invoice.status)}
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-300">
                          {invoice.dueDate 
                            ? new Date(invoice.dueDate).toLocaleDateString() 
                            : "N/A"}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleEditInvoice(invoice.id)}
                            className="p-2 hover:bg-white/10 rounded transition-colors text-gray-400 hover:text-white"
                            title="Edit Invoice"
                          >
                            <FiEdit className="w-4 h-4" />
                          </button>
                          {invoice.status === "DRAFT" && (
                            <button 
                              onClick={() => handleSendInvoice(invoice.id)}
                              className="p-2 hover:bg-blue-500/20 rounded transition-colors text-gray-400 hover:text-blue-400"
                              title="Mark as Sent"
                            >
                              <FiSend className="w-4 h-4" />
                            </button>
                          )}
                          <button 
                            onClick={() => handleDeleteInvoice(invoice.id)}
                            className="p-2 hover:bg-red-500/20 rounded transition-colors text-gray-400 hover:text-red-400"
                            title="Delete Invoice"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredInvoices.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                No invoices found
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "payments" && (
          <motion.div
            key="payments"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white/5 border border-white/10 rounded-xl overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Invoice</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Method</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-white">
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(payment.createdAt).toLocaleTimeString()}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <p className="text-white">{payment.clientName}</p>
                          {payment.invoiceNumber === "Manual Entry" && (
                            <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded border border-blue-500/30">
                              Manual
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-white font-medium">{payment.invoiceNumber}</p>
                          {payment.invoiceTitle && (
                            <p className="text-sm text-gray-400">{payment.invoiceTitle}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-white font-semibold">{formatCurrency(payment.amount)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-300">{payment.paymentMethod || "N/A"}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs border ${getStatusColor(payment.status)}`}>
                          {getStatusIcon(payment.status)}
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredPayments.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                No payments found
              </div>
            )}
          </motion.div>
        )}

      </AnimatePresence>

      {/* Record Transaction Modal */}
      <RecordTransactionModal
        isOpen={showRecordTransaction}
        onClose={() => setShowRecordTransaction(false)}
        onSuccess={handleTransactionSuccess}
        organizations={organizations}
      />

      {/* Create Invoice Modal */}
      {showCreateInvoice && (
        <CreateInvoiceModal
          organizations={organizations}
          onClose={() => setShowCreateInvoice(false)}
        />
      )}
    </div>
  );
}
