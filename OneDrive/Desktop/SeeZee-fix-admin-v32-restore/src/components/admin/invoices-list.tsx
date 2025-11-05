"use client";

import { DollarSign, FileText, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Invoice {
  id: string;
  number: string;
  title: string;
  description?: string | null;
  amount: number;
  total: number;
  status: string;
  dueDate: Date;
  sentAt?: Date | null;
  paidAt?: Date | null;
  createdAt: Date;
}

interface InvoicesListProps {
  invoices: Invoice[];
}

export function InvoicesList({ invoices }: InvoicesListProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PAID":
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case "SENT":
        return <Clock className="w-5 h-5 text-yellow-400" />;
      case "OVERDUE":
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case "CANCELLED":
        return <XCircle className="w-5 h-5 text-gray-400" />;
      default:
        return <FileText className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "SENT":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "OVERDUE":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "CANCELLED":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      default:
        return "bg-white/10 text-white/60 border-white/20";
    }
  };

  if (invoices.length === 0) {
    return (
      <div className="seezee-glass rounded-lg border border-white/10 p-12 text-center">
        <FileText className="w-12 h-12 text-white/20 mx-auto mb-4" />
        <p className="text-white/60">No invoices yet</p>
        <p className="text-sm text-white/40 mt-1">
          Create an invoice to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {invoices.map((invoice) => (
        <div
          key={invoice.id}
          className="seezee-glass rounded-lg border border-white/10 p-4 hover:border-cyan-400/30 transition-all"
        >
          <div className="flex items-start justify-between gap-4">
            {/* Left: Invoice info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate">
                    {invoice.title}
                  </h3>
                  <p className="text-sm text-white/60">{invoice.number}</p>
                </div>
              </div>

              {invoice.description && (
                <p className="text-sm text-white/60 mb-2 ml-8">
                  {invoice.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-xs text-white/40 ml-8">
                <span>
                  Created {formatDistanceToNow(new Date(invoice.createdAt))} ago
                </span>
                {invoice.sentAt && (
                  <span>
                    Sent {formatDistanceToNow(new Date(invoice.sentAt))} ago
                  </span>
                )}
                {invoice.paidAt && (
                  <span className="text-green-400">
                    Paid {formatDistanceToNow(new Date(invoice.paidAt))} ago
                  </span>
                )}
              </div>
            </div>

            {/* Right: Amount and status */}
            <div className="flex flex-col items-end gap-2">
              <div className="text-2xl font-bold text-white">
                ${invoice.total.toLocaleString()}
              </div>
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                  invoice.status
                )}`}
              >
                {getStatusIcon(invoice.status)}
                {invoice.status}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
