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
  getMaintenanceStats 
} from "@/server/actions";
import { DashboardClient } from "@/components/admin/DashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  // Fetch all data in parallel
  const [activityResult, pipelineResult, taskStatsResult, maintenanceStatsResult] = await Promise.all([
    getActivityFeed({ limit: 5 }),
    getPipeline(),
    getTaskStats(),
    getMaintenanceStats(),
  ]);

  const activities = activityResult.success ? activityResult.activities : [];
  const leads = pipelineResult.success ? pipelineResult.leads : [];
  const taskStats = taskStatsResult.success ? taskStatsResult.stats : { total: 0, todo: 0, inProgress: 0, done: 0, overdue: 0 };
  const maintenanceStats = maintenanceStatsResult.success ? maintenanceStatsResult.stats : { total: 0, upcoming: 0, overdue: 0, completed: 0, active: 0 };

  // Calculate dashboard stats
  const stats = {
    activeProjects: 12, // TODO: Add getProjects() function
    newLeads: leads.filter((l: any) => l.status === 'NEW').length,
    openInvoices: 5, // TODO: Connect to Stripe
    activePlans: maintenanceStats.active,
    openTasks: taskStats.todo + taskStats.inProgress,
  };

  return (
    <DashboardClient 
      stats={stats}
      activities={activities}
      leads={leads}
      taskStats={taskStats}
      maintenanceStats={maintenanceStats}
    />
  );
}
