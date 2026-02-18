import { getMaintenanceSchedules, getMaintenanceClients, getMaintenanceStats, getMaintenancePlans } from "@/server/actions";
import { prisma } from "@/lib/prisma";
import { ServicePlansClient } from "./ServicePlansClient";

export const dynamic = "force-dynamic";

export default async function ServicePlansPage() {
  try {
    const [schedulesResult, clientsResult, statsResult, plansResult] = await Promise.all([
      getMaintenanceSchedules(),
      getMaintenanceClients(),
      getMaintenanceStats(),
      getMaintenancePlans(),
    ]);

    // Serialize maintenance schedules
    const schedules = schedulesResult.success ? schedulesResult.schedules.map(s => ({
      ...s,
      scheduledFor: s.scheduledFor.toISOString(),
      completedAt: s.completedAt?.toISOString() || null,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    })) : [];

    const maintenanceStats = statsResult.success ? statsResult.stats : {
      total: 0,
      upcoming: 0,
      overdue: 0,
      completed: 0,
      active: 0,
      avgResponseTime: "N/A"
    };

    // Serialize maintenance plans (from getMaintenancePlans server action)
    const maintenancePlans = plansResult.success ? plansResult.plans.map(p => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      cancelledAt: p.cancelledAt?.toISOString() || null,
      currentPeriodStart: p.currentPeriodStart?.toISOString() || null,
      currentPeriodEnd: p.currentPeriodEnd?.toISOString() || null,
      lastRequestDate: p.lastRequestDate?.toISOString() || null,
      project: p.project || null,
    })) : [];

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

    const changeRequests = changeRequestsRaw.map(cr => ({
      ...cr,
      createdAt: cr.createdAt.toISOString(),
      updatedAt: cr.updatedAt.toISOString(),
      completedAt: cr.completedAt?.toISOString() || null,
      subscription: cr.subscription || null,
    }));

    // Fetch hours data: active plans with hour packs and rollover
    const hoursPlansRaw = await prisma.maintenancePlan.findMany({
      where: {
        status: { in: ['ACTIVE'] },
      },
      include: {
        project: {
          include: {
            organization: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        hourPacks: {
          where: { isActive: true },
          orderBy: { expiresAt: 'asc' },
        },
        rolloverRecords: {
          where: { isExpired: false },
          orderBy: { expiresAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const hoursPlans = hoursPlansRaw.map(plan => ({
      id: plan.id,
      tier: plan.tier,
      status: plan.status,
      supportHoursIncluded: plan.supportHoursIncluded,
      supportHoursUsed: plan.supportHoursUsed,
      changeRequestsIncluded: plan.changeRequestsIncluded,
      changeRequestsUsed: plan.changeRequestsUsed,
      onDemandEnabled: plan.onDemandEnabled,
      createdAt: plan.createdAt.toISOString(),
      project: {
        id: plan.project.id,
        name: plan.project.name,
        status: plan.project.status,
        organization: plan.project.organization,
      },
      hourPacks: plan.hourPacks.map(pack => ({
        id: pack.id,
        packType: pack.packType,
        hours: pack.hours,
        hoursRemaining: pack.hoursRemaining,
        cost: pack.cost,
        purchasedAt: pack.purchasedAt.toISOString(),
        expiresAt: pack.expiresAt?.toISOString() || null,
        neverExpires: pack.neverExpires,
        isActive: pack.isActive,
      })),
      rolloverRecords: plan.rolloverRecords.map(record => ({
        id: record.id,
        hours: record.hours,
        hoursRemaining: record.hoursRemaining,
        expiresAt: record.expiresAt.toISOString(),
        sourceMonth: record.sourceMonth.toISOString(),
      })),
      monthlyRemaining: Math.max(0, plan.supportHoursIncluded - plan.supportHoursUsed),
      packHoursTotal: plan.hourPacks.reduce((sum: number, p) => sum + p.hoursRemaining, 0),
      rolloverHoursTotal: plan.rolloverRecords.reduce((sum: number, r) => sum + r.hoursRemaining, 0),
      totalAvailable: Math.max(0, plan.supportHoursIncluded - plan.supportHoursUsed) +
        plan.hourPacks.reduce((sum: number, p) => sum + p.hoursRemaining, 0) +
        plan.rolloverRecords.reduce((sum: number, r) => sum + r.hoursRemaining, 0),
    }));

    const hoursStats = {
      totalPlans: hoursPlansRaw.length,
      totalHoursAvailable: hoursPlansRaw.reduce((sum, plan) => {
        const monthly = Math.max(0, plan.supportHoursIncluded - plan.supportHoursUsed);
        const rollover = plan.rolloverRecords.reduce((s: number, r) => s + r.hoursRemaining, 0);
        const packs = plan.hourPacks.reduce((s: number, p) => s + p.hoursRemaining, 0);
        return sum + monthly + rollover + packs;
      }, 0),
      totalHoursUsed: hoursPlansRaw.reduce((sum, plan) => sum + plan.supportHoursUsed, 0),
      totalHourPacks: hoursPlansRaw.reduce((sum, plan) => sum + plan.hourPacks.length, 0),
      expiringHours: hoursPlansRaw.reduce((sum, plan) => {
        const expiringThreshold = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        const expiring = plan.hourPacks
          .filter(p => p.expiresAt && new Date(p.expiresAt) < expiringThreshold)
          .reduce((s: number, p) => s + p.hoursRemaining, 0);
        return sum + expiring;
      }, 0),
    };

    // Calculate combined stats
    const activePlansCount = maintenancePlans.filter((p: any) => p.status === "ACTIVE" || p.status === "PENDING").length;
    const pendingChangeRequests = changeRequests.filter((cr: any) => cr.status === "pending").length;

    const combinedStats = {
      activePlans: activePlansCount,
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
      <ServicePlansClient
        plans={maintenancePlans}
        schedules={schedules}
        changeRequests={changeRequests}
        stats={combinedStats}
        hoursPlans={hoursPlans}
        hoursStats={hoursStats}
      />
    );
  } catch (error) {
    console.error('Service Plans Page Error:', error);

    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 max-w-lg">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Error Loading Service Plans</h1>
          <p className="text-gray-300 mb-4">
            There was an error loading the service plans page. This could be due to:
          </p>
          <ul className="list-disc list-inside text-gray-400 space-y-2 mb-6">
            <li>Database connection issue</li>
            <li>Missing environment variables</li>
            <li>Data retrieval error</li>
          </ul>
          <details className="bg-black/30 p-4 rounded-lg">
            <summary className="text-sm text-gray-400 cursor-pointer">Technical Details</summary>
            <pre className="text-xs text-red-300 mt-2 overflow-auto">
              {error instanceof Error ? error.message : String(error)}
            </pre>
          </details>
        </div>
      </div>
    );
  }
}
