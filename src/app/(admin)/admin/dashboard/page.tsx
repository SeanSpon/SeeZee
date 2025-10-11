import KpiCard from "../components/KpiCard";
import { Users, DollarSign, Briefcase, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getDashboardData() {
  try {
    // Fetch real data from database
    const [leadsCount, projectsCount, invoicesData, recentLeads] = await Promise.all([
      prisma.lead.count(),
      prisma.project.count(),
      prisma.invoice.aggregate({
        _sum: { total: true },
        _count: { id: true }
      }),
      prisma.lead.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
          serviceType: true,
          createdAt: true
        }
      })
    ]);

    const activeProjects = await prisma.project.count({
      where: { status: 'ACTIVE' }
    });

    return {
      leadsCount,
      projectsCount,
      activeProjects,
      totalRevenue: invoicesData._sum.total || 0,
      invoicesCount: invoicesData._count.id,
      recentLeads
    };
  } catch (error) {
    console.error('Dashboard data fetch error:', error);
    return {
      leadsCount: 0,
      projectsCount: 0,
      activeProjects: 0,
      totalRevenue: 0,
      invoicesCount: 0,
      recentLeads: []
    };
  }
}

export default async function AdminDashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-black text-white">Dashboard</h1>
        <p className="text-slate-400 mt-2">Welcome back to SeeZee Admin</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard 
          title="Total Revenue" 
          value={`$${Number(data.totalRevenue).toLocaleString()}`}
          hint={`${data.invoicesCount} invoices`}
          icon={<DollarSign size={20} />}
        />
        <KpiCard 
          title="Total Projects" 
          value={data.projectsCount.toString()}
          hint={`${data.activeProjects} active`}
          icon={<Briefcase size={20} />}
        />
        <KpiCard 
          title="Total Leads" 
          value={data.leadsCount.toString()}
          hint="All time"
          icon={<Users size={20} />}
        />
        <KpiCard 
          title="Conversion Rate" 
          value={data.leadsCount > 0 ? `${Math.round((data.projectsCount / data.leadsCount) * 100)}%` : '0%'}
          hint="Leads to projects"
          icon={<TrendingUp size={20} />}
        />
      </div>

      {/* Recent Leads */}
      <div className="backdrop-blur-xl bg-white/[0.08] border border-white/10 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Recent Leads</h2>
        {data.recentLeads.length > 0 ? (
          <div className="space-y-4">
            {data.recentLeads.map((lead) => (
              <div 
                key={lead.id}
                className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {lead.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{lead.name}</h3>
                    <p className="text-slate-400 text-sm">{lead.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-slate-300 text-sm font-medium">{lead.serviceType || 'No service'}</p>
                    <p className="text-slate-500 text-xs">{new Date(lead.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    lead.status === 'NEW' ? 'bg-blue-500/20 text-blue-300' :
                    lead.status === 'CONTACTED' ? 'bg-yellow-500/20 text-yellow-300' :
                    lead.status === 'CONVERTED' ? 'bg-green-500/20 text-green-300' :
                    'bg-slate-500/20 text-slate-300'
                  }`}>
                    {lead.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No leads yet</p>
          </div>
        )}
      </div>
    </div>
  );
}