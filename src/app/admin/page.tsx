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
  try {
    // Get current user for personalized greeting
    const user = await getCurrentUser();

    // Fetch all data in parallel — each query is wrapped to prevent one failure from crashing all
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
      getPipeline().catch((e) => { console.error("[Dashboard] getPipeline failed:", e); return { success: false, leads: [] }; }),
      getProjects().catch((e) => { console.error("[Dashboard] getProjects failed:", e); return { success: false, projects: [] }; }),
      getInvoices().catch((e) => { console.error("[Dashboard] getInvoices failed:", e); return { success: false, invoices: [] }; }),
      getTasks().catch((e) => { console.error("[Dashboard] getTasks failed:", e); return { success: false, tasks: [] }; }),
      getTaskStats().catch((e) => { console.error("[Dashboard] getTaskStats failed:", e); return { success: false, stats: { total: 0, todo: 0, inProgress: 0, done: 0, overdue: 0 } }; }),
      getActivityFeed({ limit: 10 }).catch((e) => { console.error("[Dashboard] getActivityFeed failed:", e); return { success: false, activities: [] }; }),
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
      }).catch((e) => { console.error("[Dashboard] maintenancePlan query failed:", e); return []; }),
      db.changeRequest.count({
        where: { status: "pending" },
      }).catch((e) => { console.error("[Dashboard] changeRequest count failed:", e); return 0; }),
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
    const totalRevenue = paidInvoices.reduce((sum, inv) => sum + Number(inv.total || 0), 0);

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

    // Fetch expenses
    let totalExpenses = 0;
    let thisMonthRevenue = 0;
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    try {
      const { calculateCurrentMonthExpenses } = await import("@/lib/finance/expense-calculator");
      const allExpenses = await db.businessExpense.findMany({
        select: { amount: true, isRecurring: true, frequency: true, expenseDate: true },
      });
      const expenseItems = allExpenses.map((exp) => ({
        amount: Number(exp.amount),
        isRecurring: exp.isRecurring,
        frequency: exp.frequency,
        expenseDate: exp.expenseDate,
      }));
      const thisMonthExpenseCalc = calculateCurrentMonthExpenses(expenseItems);
      totalExpenses = thisMonthExpenseCalc.total;
    } catch (e) {
      console.error("[Dashboard] expense calculation failed:", e);
    }

    thisMonthRevenue = paidInvoices
      .filter(inv => inv.paidAt && new Date(inv.paidAt) >= thisMonth)
      .reduce((sum, inv) => sum + Number(inv.total || 0), 0);

    const netProfit = thisMonthRevenue - (totalExpenses / 100);

    // Calculate maintenance metrics
    const activePlansCount = maintenancePlans.length;
    const monthlyRecurringRevenue = maintenancePlans.reduce((sum, plan) =>
      sum + (Number(plan.monthlyPrice) || 0), 0
    );
    const totalHoursAvailable = maintenancePlans.reduce((sum, plan) => {
      const included = plan.supportHoursIncluded || 0;
      const used = plan.supportHoursUsed || 0;
      const rollover = plan.rolloverHours || 0;
      if (plan.tier === 'COO') return sum;
      return sum + (included - used + rollover);
    }, 0);

    const stats = {
      activeProjects,
      totalRevenue,
      totalClients: clientIds.size,
      unpaidInvoices,
      thisMonthRevenue,
      thisMonthExpenses: totalExpenses / 100,
      netProfit,
      activePlans: activePlansCount,
      maintenanceMRR: monthlyRecurringRevenue,
      maintenanceARR: monthlyRecurringRevenue * 12,
      totalHoursAvailable,
      pendingChangeRequests,
    };

    const transformedActivities = activities.map((activity) => ({
      id: activity.id,
      type: activity.type ? String(activity.type) : null,
      message: activity.title || activity.description || "",
      timestamp: activity.createdAt,
    }));

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
        dueDate: task.dueDate || null,
      }));

    const recentLeads = leads.slice(0, 5).map((lead: any) => ({
      id: lead.id,
      company: lead.company,
      name: lead.name,
      status: lead.status,
      createdAt: lead.createdAt
        ? (typeof lead.createdAt === 'string' ? lead.createdAt : lead.createdAt.toISOString())
        : null,
    }));

    const newLeads = leads.filter((lead: any) => lead.status === "NEW").length;
    const openTasks = tasks.filter((task: any) => task.status !== "DONE").length;
    const pipelineProjects = projects.filter((proj: any) =>
      ["LEAD", "PROPOSAL", "QUOTE"].includes(proj.status)
    ).length;

    const metrics = { newLeads, openTasks, pipelineProjects };

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
  } catch (error) {
    console.error("[Dashboard] Fatal error rendering admin dashboard:", error);
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="max-w-md space-y-4 rounded-lg border border-red-500/20 bg-red-500/5 p-8 text-center">
          <h2 className="text-xl font-bold text-white">Dashboard Error</h2>
          <p className="text-sm text-white/60">
            Something went wrong loading the dashboard. Check the server logs for details.
          </p>
          <p className="font-mono text-xs text-red-400">
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
        </div>
      </div>
    );
  }
}
