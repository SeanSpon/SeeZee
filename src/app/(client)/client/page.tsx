import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import KpiCard from "./components/KpiCard";
import Timeline from "./components/Timeline";
import InvoiceTable from "./components/InvoiceTable";

export default async function ClientOverviewPage() {
  const session = await auth();

  if (!session?.user || session.user.accountType !== "CLIENT") {
    redirect("/login");
  }

  // Fetch real client data
  const projects = await prisma.project.findMany({
    where: {
      lead: { email: session.user.email! },
    },
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

  const activeProjects = projects.filter(p => p.status === "ACTIVE").length;
  const pendingInvoices = invoices.filter(i => i.status === "SENT");
  const totalDue = pendingInvoices.reduce((sum, inv) => sum + Number(inv.total), 0);

  const kpis = [
    { title: "Active Projects", value: activeProjects.toString(), icon: "📊" },
    { title: "Invoices Due", value: `$${totalDue.toFixed(2)}`, icon: "💰" },
    { title: "Last Update", value: "Today", icon: "🕒" },
    { title: "Next Milestone", value: projects.length > 0 ? "In Progress" : "TBD", icon: "🎯" },
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
    <div className="space-y-8">
      {/* KPIs */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Dashboard Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((kpi, i) => (
            <KpiCard key={i} title={kpi.title} value={kpi.value} icon={kpi.icon} />
          ))}
        </div>
      </div>

      {/* Recent Activity Timeline */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
        <Timeline events={events} />
      </div>

      {/* Open Invoices */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4">Open Invoices</h3>
        <InvoiceTable invoices={invoiceData} />
      </div>
    </div>
  );
}
