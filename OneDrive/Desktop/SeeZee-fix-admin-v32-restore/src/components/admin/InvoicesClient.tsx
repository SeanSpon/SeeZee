"use client";

/**
 * Invoices Client Component
 */

import { DataTable, type Column } from "@/components/admin/DataTable";
import { Plus, Download } from "lucide-react";
import { formatCurrency } from "@/lib/ui";
import { useRouter } from "next/navigation";

interface Invoice {
  id: string;
  number: string;
  title: string;
  amount: any;
  total: any;
  status: string;
  dueDate: Date;
  organization: {
    id: string;
    name: string;
  };
  project: {
    id: string;
    name: string;
  } | null;
}

interface InvoicesClientProps {
  invoices: Invoice[];
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  SENT: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  PAID: "bg-green-500/20 text-green-400 border-green-500/30",
  OVERDUE: "bg-red-500/20 text-red-400 border-red-500/30",
  CANCELLED: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

const statusLabels: Record<string, string> = {
  DRAFT: "Draft",
  SENT: "Sent",
  PAID: "Paid",
  OVERDUE: "Overdue",
  CANCELLED: "Cancelled",
};

export function InvoicesClient({ invoices }: InvoicesClientProps) {
  const router = useRouter();

  const columns: Column<Invoice>[] = [
    { key: "number", label: "Invoice #", sortable: true },
    {
      key: "title",
      label: "Title",
      sortable: true,
    },
    {
      key: "organization",
      label: "Client",
      sortable: true,
      render: (invoice) => invoice.organization.name,
    },
    {
      key: "total",
      label: "Amount",
      sortable: true,
      render: (invoice) => (
        <span className="font-medium">
          {formatCurrency(parseFloat(invoice.total || invoice.amount))}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (invoice) => (
        <span
          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${
            statusColors[invoice.status] || "bg-slate-500/20 text-slate-400 border-slate-500/30"
          }`}
        >
          {statusLabels[invoice.status] || invoice.status}
        </span>
      ),
    },
    {
      key: "dueDate",
      label: "Due Date",
      sortable: true,
      render: (invoice) => new Date(invoice.dueDate).toLocaleDateString(),
    },
  ];

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log("Export invoices");
  };

  const handleCreateInvoice = () => {
    router.push("/admin/pipeline/projects");
  };

  return (
    <div className="space-y-6">
      <DataTable
        data={invoices}
        columns={columns}
        searchPlaceholder="Search invoices..."
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium transition-all"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={handleCreateInvoice}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-all"
            >
              <Plus className="w-4 h-4" />
              Create Invoice
            </button>
          </div>
        }
        onRowClick={(invoice) => router.push(`/admin/pipeline/invoices/${invoice.id}`)}
      />
    </div>
  );
}
