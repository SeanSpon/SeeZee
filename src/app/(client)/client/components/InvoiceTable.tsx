interface Invoice {
  id: string;
  amount: number;
  status: string;
  issuedAt: string;
  dueAt?: string | null;
}

interface InvoiceTableProps {
  invoices: Invoice[];
}

export default function InvoiceTable({ invoices }: InvoiceTableProps) {
  if (!invoices || invoices.length === 0) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-xl p-8 text-center">
        <p className="text-slate-400">No open invoices</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "sent":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "overdue":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      default:
        return "bg-slate-500/20 text-slate-300 border-slate-500/30";
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-900/50 border-b border-white/5">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">
              Invoice
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">
              Amount
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">
              Status
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">
              Due Date
            </th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {invoices.map((invoice) => (
            <tr key={invoice.id} className="hover:bg-white/5 transition-colors">
              <td className="px-6 py-4 text-sm text-white font-mono">
                #{invoice.id.slice(0, 8)}
              </td>
              <td className="px-6 py-4 text-sm text-white font-semibold">
                ${(invoice.amount / 100).toFixed(2)}
              </td>
              <td className="px-6 py-4">
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                    invoice.status
                  )}`}
                >
                  {invoice.status}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-slate-400">
                {invoice.dueAt
                  ? new Date(invoice.dueAt).toLocaleDateString()
                  : "N/A"}
              </td>
              <td className="px-6 py-4 text-right">
                <button className="text-cyan-400 hover:text-cyan-300 text-sm font-medium">
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
