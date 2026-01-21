/**
 * Maintenance Requests and Plans Management
 */

import { getMaintenanceSchedules, getMaintenanceClients, getMaintenanceStats, getMaintenancePlans } from "@/server/actions";
import { MaintenanceClient } from "@/components/admin/MaintenanceClient";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function MaintenancePage() {
  // Auth check is handled in layout.tsx to prevent flash

  const [schedulesResult, clientsResult, statsResult, plansResult] = await Promise.all([
    getMaintenanceSchedules(),
    getMaintenanceClients(),
    getMaintenanceStats(),
    getMaintenancePlans(),
  ]);

  // Serialize dates and other non-serializable types for client components
  const schedules = schedulesResult.success ? schedulesResult.schedules.map(s => ({
    ...s,
    scheduledFor: s.scheduledFor.toISOString(),
    completedAt: s.completedAt?.toISOString() || null,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  })) : [];
  
  const clients = clientsResult.success ? clientsResult.clients : [];
  
  const plans = plansResult.success ? plansResult.plans.map(p => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    cancelledAt: p.cancelledAt?.toISOString() || null,
    currentPeriodStart: p.currentPeriodStart?.toISOString() || null,
    currentPeriodEnd: p.currentPeriodEnd?.toISOString() || null,
    lastRequestDate: p.lastRequestDate?.toISOString() || null,
    project: p.project || null,
  })) : [];
  const maintenanceStats = statsResult.success ? statsResult.stats : {
    total: 0,
    upcoming: 0,
    overdue: 0,
    completed: 0,
    active: 0,
    avgResponseTime: "N/A"
  };

  // Fetch change requests
  const changeRequestsRaw = await prisma.changeRequest.findMany({
    include: {
      project: {
        select: {
          id: true,
          name: true,
          status: true,
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      subscription: {
        select: {
          id: true,
          planName: true,
          status: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Serialize dates for client components
  const changeRequests = changeRequestsRaw.map(cr => ({
    ...cr,
    createdAt: cr.createdAt.toISOString(),
    updatedAt: cr.updatedAt.toISOString(),
    completedAt: cr.completedAt?.toISOString() || null,
  }));

  // Calculate stats - include MaintenancePlan count and change requests
  const activePlansCount = plans.filter((p: any) => p.status === "ACTIVE" || p.status === "PENDING").length;
  const pendingChangeRequests = changeRequests.filter((cr: any) => cr.status === "pending").length;
  
  const stats = {
    activePlans: activePlansCount || clients.filter((c: any) => 
      c.maintenancePlanRel || c.maintenanceSchedules?.some((s: any) => s.status === "ACTIVE")
    ).length,
    pending: maintenanceStats.upcoming + maintenanceStats.overdue + pendingChangeRequests,
    resolvedThisWeek: schedules.filter((s: any) => {
      if (s.status !== "COMPLETED" || !s.completedAt) return false;
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(s.completedAt) > weekAgo;
    }).length + changeRequests.filter((cr: any) => {
      if (cr.status !== "completed" || !cr.completedAt) return false;
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(cr.completedAt) > weekAgo;
    }).length,
    avgResponseTime: maintenanceStats.avgResponseTime,
  };

  return (
    <MaintenanceClient 
      initialSchedules={schedules} 
      clients={clients} 
      stats={stats} 
      plans={plans}
      initialChangeRequests={changeRequests}
    />
  );
}


