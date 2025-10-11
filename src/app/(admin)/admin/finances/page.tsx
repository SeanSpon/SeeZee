import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DollarSign, TrendingUp, TrendingDown, Calendar, CreditCard, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getFinances() {
  try {
    const [invoices, payments] = await Promise.all([
      prisma.invoice.findMany({
        include: {
          organization: { select: { name: true } },
          payments: true
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),
      prisma.payment.findMany({
        include: {
          invoice: {
            include: {
              organization: { select: { name: true } }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
    ]);

    return { invoices, payments };
  } catch (error) {
    console.error("Error fetching finances:", error);
    return { invoices: [], payments: [] };
  }
}

export default async function FinancesPage() {
  const session = await auth();
  
  if (session?.user?.email !== "seanspm1007@gmail.com") {
    redirect("/admin/overview");
  }

  const { invoices, payments } = await getFinances();

  const statusColors = {
    DRAFT: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
    SENT: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    PAID: 'bg-green-500/20 text-green-300 border-green-500/30',
    OVERDUE: 'bg-red-500/20 text-red-300 border-red-500/30',
    CANCELLED: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-black text-white">Finances</h1>
            <span className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
              👑 CEO ONLY
            </span>
          </div>
          <p className="text-slate-400 mt-2">Financial overview and transactions</p>
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h2 className="text-white font-bold text-xl mb-6">Recent Invoices</h2>
        <div className="space-y-4">
          {invoices.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No invoices yet</p>
          ) : (
            invoices.map((invoice) => (
              <div key={invoice.id} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-white font-semibold">{invoice.title}</h3>
                      <span className={`px-3 py-1 rounded text-xs font-medium border ${statusColors[invoice.status as keyof typeof statusColors]}`}>
                        {invoice.status}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm">{invoice.organization.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">${Number(invoice.total).toLocaleString()}</p>
                    <p className="text-slate-500 text-xs">
                      Due: {new Date(invoice.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Payments */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h2 className="text-white font-bold text-xl mb-6">Recent Payments</h2>
        <div className="space-y-4">
          {payments.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No payments yet</p>
          ) : (
            payments.map((payment) => (
              <div key={payment.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      payment.status === 'COMPLETED' ? 'bg-green-500/20' : 
                      payment.status === 'PENDING' ? 'bg-yellow-500/20' : 
                      'bg-red-500/20'
                    }`}>
                      <CreditCard size={20} className={
                        payment.status === 'COMPLETED' ? 'text-green-400' : 
                        payment.status === 'PENDING' ? 'text-yellow-400' : 
                        'text-red-400'
                      } />
                    </div>
                    <div>
                      <p className="text-white font-semibold">{payment.invoice.organization.name}</p>
                      <p className="text-slate-400 text-sm">{payment.method || 'Payment'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-green-400">+${Number(payment.amount).toLocaleString()}</p>
                    <p className="text-slate-500 text-xs">
                      {payment.processedAt ? new Date(payment.processedAt).toLocaleDateString() : 'Pending'}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
