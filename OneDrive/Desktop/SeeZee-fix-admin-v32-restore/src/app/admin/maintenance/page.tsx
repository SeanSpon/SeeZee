/**
 * Maintenance Requests and Plans Management
 */

import { getMaintenanceSchedules, getMaintenanceClients } from "@/server/actions";
import { MaintenanceClient } from "@/components/admin/MaintenanceClient";

export const dynamic = "force-dynamic";

export default async function MaintenancePage() {
  const [schedulesResult, clientsResult] = await Promise.all([
    getMaintenanceSchedules(),
    getMaintenanceClients(),
  ]);

  const schedules = schedulesResult.success ? schedulesResult.schedules : [];
  const clients = clientsResult.success ? clientsResult.clients : [];

  // Calculate stats
  const stats = {
    activePlans: clients.filter((c: any) => c.maintenanceSchedules?.some((s: any) => s.isActive)).length,
    pending: schedules.filter((s: any) => s.status === "PENDING").length,
    resolvedThisWeek: schedules.filter((s: any) => {
      if (s.status !== "COMPLETED" || !s.completedAt) return false;
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(s.completedAt) > weekAgo;
    }).length,
    avgResponseTime: "2.4h", // TODO: Calculate from actual data
  };

  return <MaintenanceClient initialSchedules={schedules} clients={clients} stats={stats} />;
}


