/**
 * CEO Analytics Dashboard - Comprehensive Business Intelligence
 */

import { db } from "@/server/db";
import { requireRole } from "@/lib/auth/requireRole";
import { AnalyticsClient } from "@/components/ceo/AnalyticsClient";
import { ROLE } from "@/lib/role";

export const dynamic = "force-dynamic";

export default async function CEOAnalyticsPage() {
  await requireRole([ROLE.CEO]);

  // Fetch comprehensive analytics data
  const [
    invoices,
    projects,
    leads,
    users,
    todos,
    organizations,
  ] = await Promise.all([
    db.invoice.findMany({
      select: {
        id: true,
        total: true,
        status: true,
        paidAt: true,
        createdAt: true,
        organization: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    db.project.findMany({
      select: {
        id: true,
        name: true,
        status: true,
        budget: true,
        createdAt: true,
        updatedAt: true,
        organization: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    db.lead.findMany({
      select: {
        id: true,
        name: true,
        status: true,
        budget: true,
        leadScore: true,
        createdAt: true,
        convertedAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        lastLogin: true,
      },
      where: {
        role: { in: ['ADMIN', 'STAFF'] }
      }
    }),
    db.todo.findMany({
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        createdAt: true,
        completedAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    }),
    db.organization.findMany({
      select: {
        id: true,
        name: true,
        createdAt: true,
        _count: {
          select: {
            projects: true,
            invoices: true,
          }
        }
      },
    }),
  ]);

  // Calculate revenue metrics - Invoice totals need /1000 to get dollars
  const paidInvoices = invoices.filter(i => i.status === 'PAID');
  const totalRevenue = paidInvoices.reduce((sum, inv) => sum + Number(inv.total), 0) / 1000;
  const pendingRevenue = invoices
    .filter(i => ['SENT', 'OVERDUE'].includes(i.status))
    .reduce((sum, inv) => sum + Number(inv.total), 0) / 1000;

  // Revenue by month (last 12 months)
  const now = new Date();
  const monthlyRevenue = Array.from({ length: 12 }, (_, i) => {
    const month = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
    const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
    const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    
    const revenue = paidInvoices
      .filter(inv => {
        const paidDate = inv.paidAt ? new Date(inv.paidAt) : null;
        return paidDate && paidDate >= monthStart && paidDate <= monthEnd;
      })
      .reduce((sum, inv) => sum + Number(inv.total), 0) / 1000;

    return {
      month: month.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      revenue,
    };
  });

  // Project metrics
  const activeProjects = projects.filter(p => ['ACTIVE', 'IN_PROGRESS', 'PLANNING'].includes(p.status));
  const completedProjects = projects.filter(p => p.status === 'COMPLETED');
  const projectsByStatus = projects.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Lead metrics
  const convertedLeads = leads.filter(l => l.status === 'CONVERTED' || l.convertedAt);
  const conversionRate = leads.length > 0 ? (convertedLeads.length / leads.length) * 100 : 0;
  
  // Lead funnel
  const leadsByStatus = leads.reduce((acc, l) => {
    acc[l.status] = (acc[l.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Team metrics
  const completedTodos = todos.filter(t => t.status === 'DONE');
  const taskCompletionRate = todos.length > 0 ? (completedTodos.length / todos.length) * 100 : 0;

  // Top clients by revenue (convert to dollars)
  const clientRevenue = paidInvoices.reduce((acc, inv) => {
    const client = inv.organization?.name || 'Unknown';
    acc[client] = (acc[client] || 0) + Number(inv.total) / 1000;
    return acc;
  }, {} as Record<string, number>);

  const topClients = Object.entries(clientRevenue)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([name, revenue]) => ({ name, revenue }));

  // Average project value
  const avgProjectValue = projects.length > 0
    ? projects.reduce((sum, p) => sum + Number(p.budget || 0), 0) / projects.length
    : 0;

  // Growth trends
  const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const last60Days = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
  
  const recentRevenue = paidInvoices
    .filter(inv => inv.paidAt && new Date(inv.paidAt) >= last30Days)
    .reduce((sum, inv) => sum + Number(inv.total), 0) / 1000;
    
  const previousRevenue = paidInvoices
    .filter(inv => {
      const paidDate = inv.paidAt ? new Date(inv.paidAt) : null;
      return paidDate && paidDate >= last60Days && paidDate < last30Days;
    })
    .reduce((sum, inv) => sum + Number(inv.total), 0) / 1000;

  const revenueTrend = previousRevenue > 0 
    ? ((recentRevenue - previousRevenue) / previousRevenue) * 100 
    : 0;

  const analyticsData = {
    revenue: {
      total: totalRevenue,
      pending: pendingRevenue,
      recent: recentRevenue,
      trend: revenueTrend,
      monthly: monthlyRevenue,
    },
    projects: {
      total: projects.length,
      active: activeProjects.length,
      completed: completedProjects.length,
      avgValue: avgProjectValue,
      byStatus: Object.entries(projectsByStatus).map(([status, count]) => ({
        status,
        count,
      })),
    },
    leads: {
      total: leads.length,
      converted: convertedLeads.length,
      conversionRate,
      byStatus: Object.entries(leadsByStatus).map(([status, count]) => ({
        status,
        count,
      })),
    },
    team: {
      totalMembers: users.length,
      tasks: {
        total: todos.length,
        completed: completedTodos.length,
        completionRate: taskCompletionRate,
      },
    },
    clients: {
      total: organizations.length,
      top: topClients,
    },
  };

  return <AnalyticsClient data={analyticsData} />;
}

