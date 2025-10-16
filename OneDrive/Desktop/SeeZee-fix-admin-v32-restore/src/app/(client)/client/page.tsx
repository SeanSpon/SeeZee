import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import KpiCard from "./components/KpiCard";
import Timeline from "./components/Timeline";
import InvoiceTable from "./components/InvoiceTable";

export default async function ClientOverviewPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Allow all authenticated users to view - admins can see client data
  // No role restrictions here

  // Fetch real client data - both projects AND leads (quote requests)
  const projects = await prisma.project.findMany({
    where: {
      lead: { email: session.user.email! },
    },
  });

  const leads = await prisma.lead.findMany({
    where: {
      email: session.user.email!,
    },
    orderBy: { createdAt: 'desc' },
  });

  const invoices = await prisma.invoice.findMany({
    where: {
      project: {
        lead: { email: session.user.email! },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const activeProjects = projects.filter(p => p.status === "IN_PROGRESS").length;
  const pendingQuotes = leads.filter(l => l.status === "NEW").length;
  const pendingInvoices = invoices.filter(i => i.status === "SENT");
  const totalDue = pendingInvoices.reduce((sum, inv) => sum + Number(inv.total), 0);

  const kpis = [
    { title: "Active Projects", value: activeProjects.toString(), icon: "📊" },
    { title: "Quote Requests", value: pendingQuotes.toString(), icon: "�" },
    { title: "Invoices Due", value: `$${totalDue.toFixed(2)}`, icon: "�" },
    { title: "Last Update", value: "Today", icon: "🕒" },
  ];

  const events: Array<{
    id: string;
    kind: string;
    title: string;
    description: string;
    createdAt: string;
  }> = [];

  const invoiceData = invoices.map(inv => ({
    id: inv.id,
    amount: Number(inv.total),
    status: inv.status,
    issuedAt: inv.createdAt.toISOString(),
    dueAt: inv.dueDate.toISOString(),
  }));

  return (
    <div className="admin-container">
      {/* Page Header */}
      <div className="admin-page-header">
        <h1 className="admin-page-title">Dashboard Overview</h1>
        <p className="admin-page-subtitle">
          Welcome back! Here's what's happening with your projects.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpis.map((kpi, i) => (
          <KpiCard key={i} title={kpi.title} value={kpi.value} icon={kpi.icon} />
        ))}
      </div>

      {/* Recent Activity Timeline */}
      <div className="admin-glass-card mb-8">
        <h3 className="text-xl font-bold text-white mb-6">Recent Activity</h3>
        <Timeline events={events} />
      </div>

      {/* Quote Requests */}
      {leads.length > 0 && (
        <div className="admin-glass-card mb-8">
          <h3 className="text-xl font-bold text-white mb-6">Your Quote Requests</h3>
          <div className="space-y-4">
            {leads.map((lead) => {
              const metadata = lead.metadata as any;
              return (
                <div
                  key={lead.id}
                  className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-1">
                        {metadata?.package ? `${metadata.package} Package` : 'Custom Quote'}
                      </h4>
                      <p className="text-sm text-white/60">
                        Submitted {new Date(lead.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className={`
                      px-3 py-1 rounded-full text-xs font-semibold
                      ${lead.status === 'NEW' ? 'bg-blue-500/20 text-blue-400' : 
                        lead.status === 'CONTACTED' ? 'bg-yellow-500/20 text-yellow-400' :
                        lead.status === 'QUALIFIED' ? 'bg-green-500/20 text-green-400' :
                        'bg-gray-500/20 text-gray-400'}
                    `}>
                      {lead.status}
                    </div>
                  </div>
                  {metadata?.totals && (
                    <div className="flex items-center gap-6 text-sm">
                      <div>
                        <span className="text-white/60">Total: </span>
                        <span className="text-white font-semibold">
                          ${(metadata.totals.total / 100).toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <span className="text-white/60">Deposit: </span>
                        <span className="text-green-400 font-semibold">
                          ${(metadata.totals.deposit / 100).toFixed(2)}
                        </span>
                      </div>
                      {metadata.totals.monthly > 0 && (
                        <div>
                          <span className="text-white/60">Monthly: </span>
                          <span className="text-blue-400 font-semibold">
                            ${(metadata.totals.monthly / 100).toFixed(2)}/mo
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  {lead.message && (
                    <p className="mt-3 text-sm text-white/50 line-clamp-2">
                      {lead.message}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Open Invoices */}
      <div className="admin-glass-card">
        <h3 className="text-xl font-bold text-white mb-6">Open Invoices</h3>
        <InvoiceTable invoices={invoiceData} />
      </div>
    </div>
  );
}
