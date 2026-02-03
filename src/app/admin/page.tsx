/**
 * Admin Dashboard - SeeZee Studio Branded Dashboard
 * Main admin command center with stats, activities, tasks, and leads
 */

import { DashboardClient } from "@/components/admin/DashboardClient";
import { getPipeline, getProjects, getInvoices } from "@/server/actions/pipeline";
import { getTasks, getTaskStats } from "@/server/actions/tasks";
import { getActivityFeed } from "@/server/actions/activity";
import { getCurrentUser } from "@/lib/auth/requireRole";
import { db } from "@/server/db";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  // Get current user for personalized greeting
  const user = await getCurrentUser();

  // Fetch all data in parallel
  
  const [
    pipelineResult,
    projectsResult,
    invoicesResult,
    tasksResult,
    taskStatsResult,
    activityResult,
    maintenancePlans,
    pendingChangeRequests,
  ] = await Promise.all([
    getPipeline(),
    getProjects(),
    getInvoices(),
    getTasks(),
    getTaskStats(),
    getActivityFeed({ limit: 10 }),
    // Fetch active maintenance plans for recurring revenue tracking
    db.maintenancePlan.findMany({
      where: { status: "ACTIVE" },
      select: {
        id: true,
        monthlyPrice: true,
        supportHoursIncluded: true,
        supportHoursUsed: true,
        rolloverHours: true,
        tier: true,
      },
    }),
    // Fetch pending change requests count
    db.changeRequest.count({
      where: { status: "pending" },
    }),
  ]);

  const leads = pipelineResult.success ? pipelineResult.leads : [];
  const projects = projectsResult.success ? projectsResult.projects : [];
  const invoices = invoicesResult.success ? invoicesResult.invoices : [];
  const tasks = tasksResult.success ? tasksResult.tasks : [];
  const taskStats = taskStatsResult.success ? taskStatsResult.stats : { total: 0, todo: 0, inProgress: 0, done: 0, overdue: 0 };
  const activities = activityResult.success ? activityResult.activities : [];

  // Calculate stats
  const activeProjects = projects.filter((p) =>
    ["IN_PROGRESS", "ACTIVE", "DESIGN", "BUILD", "REVIEW"].includes(p.status)
  ).length;

  const paidInvoices = invoices.filter((inv) => inv.status === "PAID");
  // Invoice totals are stored in dollars
  const totalRevenue = paidInvoices.reduce((sum, inv) => sum + Number(inv.total || 0), 0);

  // Get unique clients from invoices and projects
  const clientIds = new Set<string>();
  invoices.forEach((inv) => {
    if (inv.organizationId) clientIds.add(inv.organizationId);
  });
  projects.forEach((proj) => {
    if (proj.organizationId) clientIds.add(proj.organizationId);
  });

  const unpaidInvoices = invoices.filter((inv) =>
    ["DRAFT", "SENT", "OVERDUE"].includes(inv.status)
  ).length;

  // Fetch expenses for this month to calculate net profit (PROPERLY)
  const { calculateCurrentMonthExpenses } = await import("@/lib/finance/expense-calculator");
  
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const allExpenses = await db.businessExpense.findMany({
    select: {
      amount: true,
      isRecurring: true,
      frequency: true,
      expenseDate: true,
    },
  });

  // Map to calculation format
  const expenseItems = allExpenses.map((exp) => ({
    amount: Number(exp.amount),
    isRecurring: exp.isRecurring,
    frequency: exp.frequency,
    expenseDate: exp.expenseDate,
  }));

  // Calculate this month's expenses properly (handles recurring vs one-time)
  const thisMonthExpenseCalc = calculateCurrentMonthExpenses(expenseItems);
  const totalExpenses = thisMonthExpenseCalc.total; // Already in cents
  
  // Calculate this month's revenue (invoice totals are in dollars)
  const thisMonthRevenue = paidInvoices
    .filter(inv => inv.paidAt && new Date(inv.paidAt) >= thisMonth)
    .reduce((sum, inv) => sum + Number(inv.total || 0), 0);
  
  const netProfit = thisMonthRevenue - (totalExpenses / 100); // Convert cents to dollars

  // Calculate maintenance metrics
  const activePlansCount = maintenancePlans.length;
  const monthlyRecurringRevenue = maintenancePlans.reduce((sum, plan) => 
    sum + (Number(plan.monthlyPrice) || 0), 0
  );
  const totalHoursAvailable = maintenancePlans.reduce((sum, plan) => {
    const included = plan.supportHoursIncluded || 0;
    const used = plan.supportHoursUsed || 0;
    const rollover = plan.rolloverHours || 0;
    // For COO tier (unlimited), treat as -1
    if (plan.tier === 'COO') return sum;
    return sum + (included - used + rollover);
  }, 0);

  const stats = {
    activeProjects,
    totalRevenue,
    totalClients: clientIds.size,
    unpaidInvoices,
    thisMonthRevenue,
    thisMonthExpenses: totalExpenses / 100, // Convert cents to dollars
    netProfit,
    // Maintenance metrics
    activePlans: activePlansCount,
    maintenanceMRR: monthlyRecurringRevenue,
    maintenanceARR: monthlyRecurringRevenue * 12,
    totalHoursAvailable,
    pendingChangeRequests,
  };

  // Transform activities to match ActivityFeed format
  const transformedActivities = activities.map((activity) => ({
    id: activity.id,
    type: activity.type ? String(activity.type) : null,
    message: activity.title || activity.description || "",
    timestamp: activity.createdAt,
  }));

  // Get top tasks (high priority, not done)
  const topTasks = (tasks as any[])
    .filter((task: any) => task.status !== "DONE")
    .sort((a: any, b: any) => {
      const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
      return bPriority - aPriority;
    })
    .slice(0, 5)
    .map((task: any) => ({
      id: task.id,
      title: task.title,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate || null, // Already serialized as ISO string from getTasks
    }));

  // Get recent leads
  // Note: lead.createdAt is already a string from toPlain() serialization
  const recentLeads = leads.slice(0, 5).map((lead: any) => ({
    id: lead.id,
    company: lead.company,
    name: lead.name,
    status: lead.status,
    createdAt: lead.createdAt 
      ? (typeof lead.createdAt === 'string' ? lead.createdAt : lead.createdAt.toISOString())
      : null,
  }));

  // Calculate metrics
  const newLeads = leads.filter((lead: any) => lead.status === "NEW").length;
  const openTasks = tasks.filter((task: any) => task.status !== "DONE").length;
  const pipelineProjects = projects.filter((proj: any) =>
    ["LEAD", "PROPOSAL", "QUOTE"].includes(proj.status)
  ).length;

  const metrics = {
    newLeads,
    openTasks,
    pipelineProjects,
  };

  return (
    <DashboardClient
      userName={user?.name || user?.email || "there"}
      stats={stats}
      activities={transformedActivities}
      topTasks={topTasks}
      recentLeads={recentLeads}
      metrics={metrics}
    />
  );
}
