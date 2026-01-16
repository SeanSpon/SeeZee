/**
 * Admin Hours Management Overview
 * View and manage all client hours and packages
 */

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/requireRole";
import { redirect } from "next/navigation";
import { HoursOverviewClient } from "./HoursOverviewClient";

export const dynamic = "force-dynamic";

export default async function AdminHoursPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  // Fetch all maintenance plans with their associated data
  const plans = await prisma.maintenancePlan.findMany({
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

  // Calculate statistics
  const stats = {
    totalPlans: plans.length,
    totalHoursAvailable: plans.reduce((sum, plan) => {
      const monthly = Math.max(0, plan.supportHoursIncluded - plan.supportHoursUsed);
      const rollover = plan.rolloverRecords.reduce((s: number, r) => s + r.hoursRemaining, 0);
      const packs = plan.hourPacks.reduce((s: number, p) => s + p.hoursRemaining, 0);
      return sum + monthly + rollover + packs;
    }, 0),
    totalHoursUsed: plans.reduce((sum, plan) => sum + plan.supportHoursUsed, 0),
    totalHourPacks: plans.reduce((sum, plan) => sum + plan.hourPacks.length, 0),
    expiringHours: plans.reduce((sum, plan) => {
      const expiringThreshold = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const expiring = plan.hourPacks
        .filter(p => p.expiresAt && new Date(p.expiresAt) < expiringThreshold)
        .reduce((s: number, p) => s + p.hoursRemaining, 0);
      return sum + expiring;
    }, 0),
  };

  // Serialize the data
  const serializedPlans = plans.map(plan => ({
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

  return <HoursOverviewClient plans={serializedPlans} stats={stats} />;
}
