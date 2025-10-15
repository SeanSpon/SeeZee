/**
 * Invoices Management
 */

"use client";

import { DataTable, type Column } from "@/components/admin/DataTable";
import { Plus, Download } from "lucide-react";
import { formatCurrency } from "@/lib/ui";

interface Invoice {
  id: string;
  number: string;
  client: string;
  amount: number;
  status: "draft" | "sent" | "paid" | "overdue";
  dueDate: Date;
}

// TODO: Fetch from Prisma and Stripe
const mockInvoices: Invoice[] = [
  {
    id: "inv-1",
    number: "INV-001",
    client: "CloudTech Solutions",
    amount: 15000,
    status: "paid",
    dueDate: new Date(2024, 1, 15),
  },
  {
    id: "inv-2",
    number: "INV-002",
    client: "RetailCo",
    amount: 8000,
    status: "sent",
    dueDate: new Date(2024, 2, 1),
  },
  {
    id: "inv-3",
    number: "INV-003",
    client: "Startup Inc",
    amount: 12000,
    status: "overdue",
    dueDate: new Date(2024, 1, 20),
  },
];

const statusColors = {
  draft: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  sent: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  paid: "bg-green-500/20 text-green-400 border-green-500/30",
  overdue: "bg-red-500/20 text-red-400 border-red-500/30",
};

const columns: Column<Invoice>[] = [
  { key: "number", label: "Invoice #", sortable: true },
  { key: "client", label: "Client", sortable: true },
  {
    key: "amount",
    label: "Amount",
    render: (invoice) => (
      <span className="font-medium text-white">
        {formatCurrency(invoice.amount)}
      </span>
    ),
  },
  {
    key: "status",
    label: "Status",
    render: (invoice) => (
      <span
        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${
          statusColors[invoice.status]
        }`}
      >
        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
      </span>
    ),
  },
  {
    key: "dueDate",
    label: "Due Date",
    render: (invoice) => invoice.dueDate.toLocaleDateString(),
  },
];

export default function InvoicesPage() {
  return (
    <div className="space-y-6">
      <DataTable
        data={mockInvoices}
        columns={columns}
        searchPlaceholder="Search invoices..."
        actions={
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium transition-all">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-all">
              <Plus className="w-4 h-4" />
              Create Invoice
            </button>
          </div>
        }
        onRowClick={(invoice) => console.log("Open invoice:", invoice)}
      />
    </div>
  );
}


