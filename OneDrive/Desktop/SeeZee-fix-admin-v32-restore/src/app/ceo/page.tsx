/**
 * CEO Dashboard - Executive Overview
 * Master control center with KPIs, quick actions, and real-time insights
 */

import { getExecutiveMetrics, getTeamWorkload, getResourceUtilization } from "@/server/actions";
import { CEODashboardClient } from "@/components/ceo/CEODashboardClient";

export const dynamic = "force-dynamic";

export default async function CEODashboardPage() {
  // Fetch all data in parallel
  const [metricsResult, workloadResult, utilizationResult] = await Promise.all([
    getExecutiveMetrics(),
    getTeamWorkload(),
    getResourceUtilization(),
  ]);

  const metrics = metricsResult.success ? metricsResult.metrics : null;
  const workload = workloadResult.success ? workloadResult.workload : [];
  const utilization = utilizationResult.success ? utilizationResult.utilization : null;

  return (
    <CEODashboardClient 
      metrics={metrics}
      workload={workload || []}
      utilization={utilization}
    />
  );
}
