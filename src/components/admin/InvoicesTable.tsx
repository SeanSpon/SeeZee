"use client";

import { useState } from "react";
import { DataTable, type DataTableColumn } from "@/components/table/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import { FiCalendar, FiUsers } from "react-icons/fi";
import { ActionMenu, createCrudActions } from "./shared/ActionMenu";
import { InvoiceModal } from "./InvoiceModal";
import { useRouter } from "next/navigation";

interface InvoiceRow {
  id: string;
  number: string;
  client: string;
  status: string;
  total: number;
  dueDate: string | null;
  project: string;
  title?: string | null;
  description?: string | null;
  amount?: number;
  tax?: number;
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

interface InvoicesTableProps {
  rows: InvoiceRow[];
}

export function InvoicesTable({ rows }: InvoicesTableProps) {
  const router = useRouter();
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRow | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEdit = (invoice: InvoiceRow) => {
    setSelectedInvoice(invoice);
    setIsModalOpen(true);
  };

  const handleDuplicate = (invoice: InvoiceRow) => {
    // Implement duplicate logic
    console.log("Duplicate invoice:", invoice.id);
  };

  const handleDelete = (invoice: InvoiceRow) => {
    // This is handled in the modal
    handleEdit(invoice);
  };

  const columns: DataTableColumn<InvoiceRow>[] = [
    {
      header: "Invoice",
      key: "number",
      render: (invoice) => (
        <div className="space-y-1">
          <p className="font-heading text-sm font-semibold text-white">{invoice.number}</p>
          <p className="text-xs text-gray-500">{invoice.project}</p>
        </div>
      ),
    },
    {
      header: "Client",
      key: "client",
      render: (invoice) => (
        <div className="flex items-center gap-2 text-xs text-gray-300">
          <FiUsers className="h-3.5 w-3.5 text-gray-500" />
          {invoice.client}
        </div>
      ),
    },
    {
      header: "Status",
      key: "status",
      render: (invoice) => <StatusBadge status={invoice.status} size="sm" />,
    },
    {
      header: "Total",
      key: "total",
      render: (invoice) => (
        <span className="text-sm font-semibold text-white">
          {currencyFormatter.format(invoice.total)}
        </span>
      ),
    },
    {
      header: "Due",
      key: "dueDate",
      render: (invoice) => (
        <div className="flex items-center gap-2 text-xs text-gray-300">
          <FiCalendar className="h-3.5 w-3.5 text-gray-500" />
          {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "No due date"}
        </div>
      ),
    },
    {
      header: "",
      key: "actions",
      render: (invoice) => (
        <ActionMenu
          actions={createCrudActions(
            () => handleEdit(invoice),
            () => handleDuplicate(invoice),
            () => handleDelete(invoice)
          )}
        />
      ),
    },
  ];

  return (
    <>
      <DataTable columns={columns} data={rows} emptyMessage="No invoices found" />
      
      {selectedInvoice && (
        <InvoiceModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedInvoice(null);
          }}
          invoice={{
            ...selectedInvoice,
            amount: selectedInvoice.amount ?? selectedInvoice.total,
          }}
        />
      )}
    </>
  );
}


