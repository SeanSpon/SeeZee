import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { TrendingUp, DollarSign, Users, Briefcase, Calendar, BarChart3, Download } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getAnalytics() {
  try {
    const [
      totalRevenue,
      monthlyRevenue,
      totalLeads,
      monthlyLeads,
      totalProjects,
      activeProjects,
      totalClients,
      invoiceStats
    ] = await Promise.all([
      prisma.invoice.aggregate({
        _sum: { total: true },
        where: { status: 'PAID' }
      }),
      prisma.invoice.aggregate({
        _sum: { total: true },
        where: {
          status: 'PAID',
          paidAt: {
            gte: new Date(new Date().setDate(1)) // First day of current month
          }
        }
      }),
      prisma.lead.count(),
      prisma.lead.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setDate(1))
          }
        }
      }),
      prisma.project.count(),
      prisma.project.count({
        where: { status: 'ACTIVE' }
      }),
      prisma.user.count({
        where: { role: 'CLIENT' }
      }),
      prisma.invoice.groupBy({
        by: ['status'],
        _count: { id: true },
        _sum: { total: true }
      })
    ]);

    return {
      totalRevenue: totalRevenue._sum.total || 0,
      monthlyRevenue: monthlyRevenue._sum.total || 0,
      totalLeads,
      monthlyLeads,
      totalProjects,
      activeProjects,
      totalClients,
      invoiceStats
    };
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return {
      totalRevenue: 0,
      monthlyRevenue: 0,
      totalLeads: 0,
      monthlyLeads: 0,
      totalProjects: 0,
      activeProjects: 0,
      totalClients: 0,
      invoiceStats: []
    };
  }
}

export default async function AnalyticsPage() {
  const session = await auth();
  
  // CEO-only access
  if (session?.user?.role !== "CEO") {
    redirect("/admin/overview");
  }

  const analytics = await getAnalytics();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-black text-white">Analytics</h1>
            <span className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
              👑 CEO ONLY
            </span>
          </div>
          <p className="text-slate-400 mt-2">Business insights and metrics</p>
        </div>

        {/* Export Buttons */}
        <div className="flex gap-3">
          <a
            href="/api/admin/analytics/export?type=leads"
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-all duration-200 flex items-center gap-2"
          >
            <Download size={16} />
            Export Leads
          </a>
          <a
            href="/api/admin/analytics/export?type=projects"
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-all duration-200 flex items-center gap-2"
          >
            <Download size={16} />
            Export Projects
          </a>
          <a
            href="/api/admin/analytics/export?type=invoices"
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-all duration-200 flex items-center gap-2"
          >
            <Download size={16} />
            Export Invoices
          </a>
        </div>
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 backdrop-blur-xl rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="text-green-400" size={24} />
            <TrendingUp className="text-green-400" size={18} />
          </div>
          <p className="text-3xl font-black text-white mb-2">
            ${Number(analytics.totalRevenue).toLocaleString()}
          </p>
          <p className="text-green-400 text-sm font-medium">Total Revenue</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 backdrop-blur-xl rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Calendar className="text-blue-400" size={24} />
            <span className="text-xs text-blue-400 bg-blue-500/20 px-2 py-1 rounded">This Month</span>
          </div>
          <p className="text-3xl font-black text-white mb-2">
            ${Number(analytics.monthlyRevenue).toLocaleString()}
          </p>
          <p className="text-blue-400 text-sm font-medium">Monthly Revenue</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 backdrop-blur-xl rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Users className="text-purple-400" size={24} />
            <span className="text-xs text-purple-400 bg-purple-500/20 px-2 py-1 rounded">+{analytics.monthlyLeads}</span>
          </div>
          <p className="text-3xl font-black text-white mb-2">
            {analytics.totalLeads}
          </p>
          <p className="text-purple-400 text-sm font-medium">Total Leads</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 backdrop-blur-xl rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Briefcase className="text-orange-400" size={24} />
            <span className="text-xs text-orange-400 bg-orange-500/20 px-2 py-1 rounded">{analytics.activeProjects} Active</span>
          </div>
          <p className="text-3xl font-black text-white mb-2">
            {analytics.totalProjects}
          </p>
          <p className="text-orange-400 text-sm font-medium">Total Projects</p>
        </div>
      </div>

      {/* Invoice Breakdown */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h2 className="text-white font-bold text-xl mb-6 flex items-center gap-3">
          <BarChart3 size={24} className="text-purple-400" />
          Invoice Breakdown
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {analytics.invoiceStats.map((stat: any) => (
            <div key={stat.status} className="bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="text-2xl font-bold text-white mb-1">{stat._count.id}</p>
              <p className="text-xs text-slate-400 mb-2 capitalize">{stat.status.toLowerCase()}</p>
              <p className="text-sm text-slate-300 font-semibold">
                ${Number(stat._sum.total || 0).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Conversion Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4">Lead Conversion</h3>
          <p className="text-4xl font-black text-white mb-2">
            {analytics.totalLeads > 0 ? Math.round((analytics.totalProjects / analytics.totalLeads) * 100) : 0}%
          </p>
          <p className="text-slate-400 text-sm">Leads to Projects</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4">Avg Project Value</h3>
          <p className="text-4xl font-black text-white mb-2">
            ${analytics.totalProjects > 0 ? Math.round(Number(analytics.totalRevenue) / analytics.totalProjects).toLocaleString() : 0}
          </p>
          <p className="text-slate-400 text-sm">Per Project</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4">Client Base</h3>
          <p className="text-4xl font-black text-white mb-2">
            {analytics.totalClients}
          </p>
          <p className="text-slate-400 text-sm">Active Clients</p>
        </div>
      </div>
    </div>
  );
}
