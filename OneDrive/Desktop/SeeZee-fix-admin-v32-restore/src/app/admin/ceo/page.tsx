/**
 * CEO Dashboard - Main Executive Command Center
 * Connects all systems: Finances, Analytics, Systems, Tasks, Pipeline, Team
 */

import { getExecutiveMetrics, getTeamWorkload, getResourceUtilization } from "@/server/actions/ceo";
import { getPipeline, getProjects, getInvoices } from "@/server/actions/pipeline";
import { getTaskStats, getTasks } from "@/server/actions/tasks";
import { getActivityFeed } from "@/server/actions/activity";
import { getLearningResources, getTools } from "@/server/actions/learning";
import { CEODashboardClient } from "@/components/ceo/CEODashboardClient";
import { db } from "@/server/db";
import { requireRole } from "@/lib/auth/requireRole";
import { ROLE } from "@/lib/role";

export const dynamic = "force-dynamic";

export default async function CEODashboardPage() {
  await requireRole([ROLE.CEO]);

  // Fetch all data from all systems in parallel
  const [
    metricsResult,
    workloadResult,
    utilizationResult,
    pipelineResult,
    projectsResult,
    invoicesResult,
    taskStatsResult,
    activityResult,
    tasksResult,
    resourcesResult,
    toolsResult,
    usersResult,
  ] = await Promise.all([
    getExecutiveMetrics(),
    getTeamWorkload(),
    getResourceUtilization(),
    getPipeline(),
    getProjects(),
    getInvoices(),
    getTaskStats(),
    getActivityFeed({ limit: 10 }),
    getTasks({ status: "TODO" }),
    getLearningResources(),
    getTools(),
    // Get all team users directly (CEO has access)
    db.user.findMany({
      where: {
        role: { in: ["CEO", "CFO", "FRONTEND", "BACKEND", "OUTREACH"] },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
      },
      orderBy: { name: "asc" },
    }),
  ]);

  const metrics = metricsResult.success ? metricsResult.metrics : null;
  const workload = workloadResult.success ? (workloadResult.workload || []) : [];
  const utilization = utilizationResult.success ? utilizationResult.utilization : null;
  const leads = pipelineResult.success ? pipelineResult.leads : [];
  const projects = projectsResult.success ? projectsResult.projects : [];
  const invoices = invoicesResult.success ? invoicesResult.invoices : [];
  const taskStats = taskStatsResult.success ? taskStatsResult.stats : { total: 0, todo: 0, inProgress: 0, done: 0, overdue: 0 };
  const activities = activityResult.success ? activityResult.activities : [];
  const tasks = tasksResult.success ? (tasksResult.tasks || []) : [];
  const resources = resourcesResult.success ? (resourcesResult.resources || []) : [];
  const tools = toolsResult.success ? (toolsResult.tools || []) : [];
  const users = usersResult || [];

  return (
    <CEODashboardClient
      metrics={metrics}
      workload={workload}
      utilization={utilization}
      leads={leads}
      projects={projects}
      invoices={invoices}
      taskStats={taskStats}
      activities={activities}
      availableTasks={tasks}
      availableResources={resources}
      availableTools={tools}
      users={users}
    />
  );
}

