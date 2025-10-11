import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function ClientInvoicesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Only allow CLIENT role
  if (session.user.role !== "CLIENT") {
    redirect("/admin");
  }

  // Fetch client's invoices via project's lead relationship
  const invoices = await prisma.invoice.findMany({
    where: {
      project: {
        lead: {
          email: session.user.email!,
        },
      },
    },
    include: {
      project: {
        select: {
          name: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

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

  const totalSpent = invoices
    .filter((inv) => inv.status === "PAID")
    .reduce((sum, inv) => sum + Number(inv.total), 0);

  const pendingAmount = invoices
    .filter((inv) => inv.status === "SENT")
    .reduce((sum, inv) => sum + Number(inv.total), 0);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Invoices</h2>
        <p className="text-slate-400 mt-1">View and manage your project invoices</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-xl p-6">
          <p className="text-sm text-slate-400 mb-2">Total Invoices</p>
          <p className="text-3xl font-bold text-white">{invoices.length}</p>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-xl p-6">
          <p className="text-sm text-slate-400 mb-2">Total Spent</p>
          <p className="text-3xl font-bold text-green-400">
            ${(totalSpent / 100).toFixed(2)}
          </p>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-xl p-6">
          <p className="text-sm text-slate-400 mb-2">Pending Payment</p>
          <p className="text-3xl font-bold text-amber-400">
            ${(pendingAmount / 100).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Invoices Table */}
      {invoices.length === 0 ? (
        <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-xl p-12 text-center">
          <p className="text-slate-400">No invoices yet</p>
        </div>
      ) : (
        <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-900/50 border-b border-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">
                  Invoice
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">
                  Project
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">
                  Issued
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
                  <td className="px-6 py-4 text-sm text-white">
                    {invoice.project?.name || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-sm text-white font-semibold">
                    ${Number(invoice.total).toFixed(2)}
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
                    {new Date(invoice.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-cyan-400 hover:text-cyan-300 text-sm font-medium">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
