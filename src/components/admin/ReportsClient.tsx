"use client";

import { useState } from "react";
import { 
  FiDownload, 
  FiFileText, 
  FiCreditCard, 
  FiFolder,
  FiUsers,
  FiCheckSquare,
  FiDollarSign,
  FiCalendar,
  FiTrendingUp,
  FiDatabase,
  FiLoader
} from "react-icons/fi";
import { motion } from "framer-motion";

interface ReportsClientProps {
  stats: {
    invoices: number;
    payments: number;
    projects: number;
    clients: number;
    tasks: number;
    expenses: number;
  };
}

interface ReportType {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  endpoint: string;
  color: string;
  count?: number;
}

export function ReportsClient({ stats }: ReportsClientProps) {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<"all" | "month" | "quarter" | "year">("all");

  const reports: ReportType[] = [
    {
      id: "invoices",
      name: "Invoices",
      description: "All invoice data including amounts, status, and client details",
      icon: <FiFileText className="w-6 h-6" />,
      endpoint: "/api/admin/reports/invoices",
      color: "from-blue-500 to-blue-600",
      count: stats.invoices,
    },
    {
      id: "payments",
      name: "Payments & Transactions",
      description: "Payment history, methods, and transaction details",
      icon: <FiCreditCard className="w-6 h-6" />,
      endpoint: "/api/admin/reports/payments",
      color: "from-green-500 to-green-600",
      count: stats.payments,
    },
    {
      id: "expenses",
      name: "Business Expenses",
      description: "All business expenses and operational costs",
      icon: <FiDollarSign className="w-6 h-6" />,
      endpoint: "/api/admin/reports/expenses",
      color: "from-red-500 to-red-600",
      count: stats.expenses,
    },
    {
      id: "projects",
      name: "Projects",
      description: "Project details, status, timelines, and budgets",
      icon: <FiFolder className="w-6 h-6" />,
      endpoint: "/api/admin/reports/projects",
      color: "from-purple-500 to-purple-600",
      count: stats.projects,
    },
    {
      id: "clients",
      name: "Clients",
      description: "Client information, contact details, and relationship data",
      icon: <FiUsers className="w-6 h-6" />,
      endpoint: "/api/admin/reports/clients",
      color: "from-orange-500 to-orange-600",
      count: stats.clients,
    },
    {
      id: "tasks",
      name: "Tasks",
      description: "Task data, assignments, status, and completion rates",
      icon: <FiCheckSquare className="w-6 h-6" />,
      endpoint: "/api/admin/reports/tasks",
      color: "from-indigo-500 to-indigo-600",
      count: stats.tasks,
    },
    {
      id: "financial-summary",
      name: "Financial Summary",
      description: "Complete financial overview with revenue, expenses, and profit",
      icon: <FiTrendingUp className="w-6 h-6" />,
      endpoint: "/api/admin/reports/financial-summary",
      color: "from-emerald-500 to-emerald-600",
    },
    {
      id: "full-backup",
      name: "Full Data Backup",
      description: "Complete database export (all tables in one ZIP file)",
      icon: <FiDatabase className="w-6 h-6" />,
      endpoint: "/api/admin/reports/full-backup",
      color: "from-gray-500 to-gray-600",
    },
  ];

  const handleDownload = async (report: ReportType) => {
    setDownloading(report.id);
    
    try {
      const response = await fetch(`${report.endpoint}?range=${dateRange}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to download report");
      }

      // Get filename from header or use default
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = `${report.id}_${dateRange}_${new Date().toISOString().split('T')[0]}.csv`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download report. Please try again.");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Reports & Data Export</h1>
        <p className="text-gray-400 mt-1">Download CSV exports of your business data</p>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <div className="flex items-center gap-4">
          <FiCalendar className="w-5 h-5 text-gray-400" />
          <label className="text-white font-medium">Date Range:</label>
          <div className="flex gap-2">
            {[
              { value: "all", label: "All Time" },
              { value: "month", label: "Last 30 Days" },
              { value: "quarter", label: "Last 90 Days" },
              { value: "year", label: "Last Year" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setDateRange(option.value as any)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  dateRange === option.value
                    ? "bg-emerald-500 text-white"
                    : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-lg bg-gradient-to-br ${report.color}`}>
                {report.icon}
              </div>
              {report.count !== undefined && (
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">{report.count}</p>
                  <p className="text-xs text-gray-400">records</p>
                </div>
              )}
            </div>

            <h3 className="text-lg font-semibold text-white mb-2">{report.name}</h3>
            <p className="text-sm text-gray-400 mb-4">{report.description}</p>

            <button
              onClick={() => handleDownload(report)}
              disabled={downloading === report.id}
              className={`w-full px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
                downloading === report.id
                  ? "bg-gray-500 cursor-not-allowed"
                  : `bg-gradient-to-r ${report.color} hover:opacity-90`
              } text-white font-medium`}
            >
              {downloading === report.id ? (
                <>
                  <FiLoader className="w-4 h-4 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <FiDownload className="w-4 h-4" />
                  Download CSV
                </>
              )}
            </button>
          </motion.div>
        ))}
      </div>

      {/* Info Box */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-400 mb-2 flex items-center gap-2">
          <FiFileText className="w-5 h-5" />
          About CSV Exports
        </h3>
        <ul className="text-sm text-gray-300 space-y-2">
          <li>• All data is exported in CSV format for easy import into Excel, Google Sheets, or other tools</li>
          <li>• Date range filter applies to time-based data (invoices, payments, expenses)</li>
          <li>• Full Data Backup includes all tables and is provided as a ZIP file</li>
          <li>• Exports include all relevant fields and relationships</li>
          <li>• Data is current as of the moment you download</li>
        </ul>
      </div>
    </div>
  );
}
