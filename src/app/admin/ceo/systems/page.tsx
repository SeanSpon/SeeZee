/**
 * CEO Systems Overview - Database Browser & System Controls
 */

import { db } from "@/server/db";
import { requireRole } from "@/lib/auth/requireRole";
import { SystemsClient } from "@/components/ceo/SystemsClient";
import { ROLE } from "@/lib/role";
import { ProjectStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function CEOSystemsPage() {
  await requireRole([ROLE.CEO]);

  // Get comprehensive system stats
  const [
    users,
    organizations,
    projects,
    invoices,
    leads,
    todos,
    maintenancePlans,
    files,
    systemLogs,
    notifications,
  ] = await Promise.all([
    db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        lastLogin: true,
      },
      orderBy: { createdAt: 'desc' },
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
      orderBy: { createdAt: 'desc' },
    }),
    db.project.findMany({
      select: {
        id: true,
        name: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
    }),
    db.invoice.findMany({
      select: {
        id: true,
        number: true,
        status: true,
        total: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    db.lead.findMany({
      select: {
        id: true,
        name: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    db.todo.findMany({
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    db.maintenancePlan.findMany({
      select: {
        id: true,
        tier: true,
        status: true,
        monthlyPrice: true,
        createdAt: true,
      },
    }),
    db.file.findMany({
      select: {
        id: true,
        originalName: true,
        size: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
    db.systemLog.findMany({
      select: {
        id: true,
        action: true,
        message: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
    db.notification.findMany({
      select: {
        id: true,
        type: true,
        read: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ]);

  // Calculate database statistics
  const dbStats = {
    users: {
      total: users.length,
      admins: users.filter(u => u.role === 'ADMIN').length,
      staff: users.filter(u => u.role === 'STAFF').length,
      clients: users.filter(u => u.role === 'CLIENT').length,
      activeThisMonth: users.filter(u => {
        const lastLogin = u.lastLogin ? new Date(u.lastLogin) : null;
        return lastLogin && lastLogin >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      }).length,
    },
    organizations: {
      total: organizations.length,
      withProjects: organizations.filter(o => o._count.projects > 0).length,
      withInvoices: organizations.filter(o => o._count.invoices > 0).length,
    },
    projects: {
      total: projects.length,
      active: projects.filter(p => ['ACTIVE', 'IN_PROGRESS', 'PLANNING'].includes(p.status)).length,
      completed: projects.filter(p => p.status === 'COMPLETED').length,
      byStatus: projects.reduce((acc, p) => {
        acc[p.status] = (acc[p.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    },
    invoices: {
      total: invoices.length,
      paid: invoices.filter(i => i.status === 'PAID').length,
      pending: invoices.filter(i => i.status === 'SENT').length,
      overdue: invoices.filter(i => i.status === 'OVERDUE').length,
      totalValue: invoices.reduce((sum, i) => sum + Number(i.total), 0),
    },
    leads: {
      total: leads.length,
      new: leads.filter(l => l.status === 'NEW').length,
      qualified: leads.filter(l => l.status === 'QUALIFIED').length,
      converted: leads.filter(l => l.status === 'CONVERTED').length,
    },
    tasks: {
      total: todos.length,
      todo: todos.filter(t => t.status === 'TODO').length,
      inProgress: todos.filter(t => t.status === 'IN_PROGRESS').length,
      done: todos.filter(t => t.status === 'DONE').length,
    },
    maintenance: {
      total: maintenancePlans.length,
      active: maintenancePlans.filter(m => m.status === 'ACTIVE').length,
      mrr: maintenancePlans
        .filter(m => m.status === 'ACTIVE')
        .reduce((sum, m) => sum + Number(m.monthlyPrice || 0), 0),
    },
    files: {
      total: files.length,
      totalSize: files.reduce((sum, f) => sum + (f.size || 0), 0),
      recentUploads: files.slice(0, 5),
    },
    systemLogs: {
      total: systemLogs.length,
      errors: systemLogs.filter(l => l.action?.toLowerCase().includes('error')).length,
      warnings: systemLogs.filter(l => l.action?.toLowerCase().includes('warn')).length,
      recent: systemLogs.slice(0, 10),
    },
    notifications: {
      total: notifications.length,
      unread: notifications.filter(n => !n.read).length,
    },
  };

  // Check database connection
  let dbStatus = "Online";
  let dbLatency = 0;
  try {
    const start = Date.now();
    await db.$queryRaw`SELECT 1`;
    dbLatency = Date.now() - start;
  } catch (error) {
    dbStatus = "Error";
  }

  const systemInfo = {
    dbStatus,
    dbLatency,
    uptime: "99.9%", // In production, this would come from monitoring service
    nodeVersion: process.version,
    platform: process.platform,
    memory: {
      used: process.memoryUsage().heapUsed,
      total: process.memoryUsage().heapTotal,
    },
  };

  return <SystemsClient stats={dbStats} systemInfo={systemInfo} />;
}

