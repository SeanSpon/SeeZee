/**
 * Admin Dashboard - Central Overview
 * Live KPIs, Quick Actions, Activity Feed
 */

import { StatCard } from "@/components/admin/StatCard";
import { SectionCard } from "@/components/admin/SectionCard";
import { 
  Briefcase, 
  Users, 
  DollarSign, 
  FileText, 
  Wrench,
  Plus,
  CheckCircle,
  Send,
  TrendingUp,
  Clock,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { 
  getActivityFeed, 
  getPipeline, 
  getTaskStats,
  getMaintenanceStats,
  getProjects,
  getInvoices
} from "@/server/actions";
import { DashboardClient } from "@/components/admin/DashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const { getTasks } = await import("@/server/actions/tasks");
  
  // Fetch all data in parallel
  const [activityResult, pipelineResult, taskStatsResult, tasksResult, maintenanceStatsResult, projectsResult, invoicesResult] = await Promise.all([
    getActivityFeed({ limit: 5 }),
    getPipeline(),
    getTaskStats(),
    getTasks({ status: undefined }), // Get all my tasks (filtered by assignedToId)
    getMaintenanceStats(),
    getProjects(),
    getInvoices(),
  ]);

  const activities = activityResult.success ? activityResult.activities : [];
  const leads = pipelineResult.success ? pipelineResult.leads : [];
  const taskStats = taskStatsResult.success ? taskStatsResult.stats : { total: 0, todo: 0, inProgress: 0, done: 0, overdue: 0 };
  const myTasks = tasksResult.success ? tasksResult.tasks : [];
  const maintenanceStats = maintenanceStatsResult.success ? maintenanceStatsResult.stats : { total: 0, upcoming: 0, overdue: 0, completed: 0, active: 0 };
  const projects = projectsResult.success ? projectsResult.projects : [];
  const invoices = invoicesResult.success ? invoicesResult.invoices : [];

  // Calculate dashboard stats
  const stats = {
    activeProjects: projects.filter((p: any) => ['IN_PROGRESS', 'REVIEW', 'PAID'].includes(p.status)).length,
    newLeads: leads.filter((l: any) => l.status === 'NEW').length,
    openInvoices: invoices.filter((i: any) => ['SENT', 'OVERDUE', 'DRAFT'].includes(i.status)).length,
    activePlans: maintenanceStats.active,
    openTasks: taskStats.todo + taskStats.inProgress,
  };

  return (
    <DashboardClient 
      stats={stats}
      activities={activities}
      leads={leads}
      myTasks={myTasks}
      taskStats={taskStats}
      maintenanceStats={maintenanceStats}
    />
  );
}
