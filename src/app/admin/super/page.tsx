/**
 * Super Dashboard Page - Unified admin command center
 * Combines all admin data into one massive view
 */

import { SuperDashboardClient } from "@/components/admin/super/SuperDashboardClient";
import { getPipeline, getProjects, getInvoices } from "@/server/actions/pipeline";
import { getTasks, getTaskStats } from "@/server/actions/tasks";
import { getActivityFeed } from "@/server/actions/activity";
import { getExecutiveMetrics, getTeamWorkload } from "@/server/actions/ceo";
import { getFinancialSummary, getCashFlowAnalysis } from "@/server/actions/finance";
import { getCurrentUser } from "@/lib/auth/requireRole";
import { isAdminLike } from "@/lib/role";
import { db } from "@/server/db";
import type { Alert } from "@/components/admin/dashboard/AlertsPanel";

export const dynamic = "force-dynamic";

export default async function SuperDashboardPage() {
  try {
    const user = await getCurrentUser();
    const isCeoOrCfo = isAdminLike(user?.role);

    // ── Universal fetches (all admin roles) ──
    const [
      pipelineResult,
      projectsResult,
      invoicesResult,
      tasksResult,
      taskStatsResult,
      activityResult,
      maintenancePlans,
      pendingChangeRequests,
      allExpenses,
    ] = await Promise.all([
      getPipeline().catch((e) => { console.error("[Super] getPipeline:", e); return { success: false, leads: [], pipeline: {} }; }),
      getProjects().catch((e) => { console.error("[Super] getProjects:", e); return { success: false, projects: [] }; }),
      getInvoices().catch((e) => { console.error("[Super] getInvoices:", e); return { success: false, invoices: [] }; }),
      getTasks({}).catch((e) => { console.error("[Super] getTasks:", e); return { success: false, tasks: [] }; }),
      getTaskStats().catch((e) => { console.error("[Super] getTaskStats:", e); return { success: false, stats: { total: 0, todo: 0, inProgress: 0, done: 0, overdue: 0 } }; }),
      getActivityFeed({ limit: 20 }).catch((e) => { console.error("[Super] getActivityFeed:", e); return { success: false, activities: [] }; }),
      db.maintenancePlan.findMany({
        where: { status: "ACTIVE" },
        select: { id: true, monthlyPrice: true, supportHoursIncluded: true, supportHoursUsed: true, rolloverHours: true, tier: true },
      }).catch((e) => { console.error("[Super] maintenancePlan:", e); return []; }),
      db.changeRequest.count({ where: { status: "pending" } }).catch(() => 0),
      db.businessExpense.findMany({
        select: { amount: true, isRecurring: true, frequency: true, expenseDate: true },
      }).catch(() => []),
    ]);

    // ── CEO/CFO gated fetches ──
    let teamWorkload: any[] | undefined;
    let cashFlow: any | undefined;

    if (isCeoOrCfo) {
      const [teamResult, cashFlowResult] = await Promise.all([
        getTeamWorkload().catch((e) => { console.error("[Super] getTeamWorkload:", e); return { success: false, workload: [] }; }),
        getCashFlowAnalysis().catch((e) => { console.error("[Super] getCashFlowAnalysis:", e); return { success: false, cashFlow: null }; }),
      ]);
      teamWorkload = teamResult.success ? teamResult.workload : undefined;
      cashFlow = cashFlowResult.success ? cashFlowResult.cashFlow : undefined;
    }

    // ── Extract data ──
    const leads = pipelineResult.success ? (pipelineResult as any).leads ?? [] : [];
    const projects = projectsResult.success ? (projectsResult as any).projects ?? [] : [];
    const invoices = invoicesResult.success ? (invoicesResult as any).invoices ?? [] : [];
    const tasks = tasksResult.success ? (tasksResult as any).tasks ?? [] : [];
    const taskStats = taskStatsResult.success
      ? taskStatsResult.stats
      : { total: 0, todo: 0, inProgress: 0, done: 0, overdue: 0 };
    const activities = activityResult.success ? (activityResult as any).activities ?? [] : [];

    // ── Compute stats ──
    const activeProjects = projects.filter((p: any) =>
      ["IN_PROGRESS", "ACTIVE", "DESIGN", "BUILD", "REVIEW"].includes(p.status)
    ).length;

    const paidInvoices = invoices.filter((inv: any) => inv.status === "PAID");
    const totalRevenue = paidInvoices.reduce((sum: number, inv: any) => sum + Number(inv.total || 0), 0);

    const clientIds = new Set<string>();
    invoices.forEach((inv: any) => { if (inv.organizationId) clientIds.add(inv.organizationId); });
    projects.forEach((proj: any) => { if (proj.organizationId) clientIds.add(proj.organizationId); });

    const unpaidInvoices = invoices.filter((inv: any) =>
      ["DRAFT", "SENT", "OVERDUE"].includes(inv.status)
    ).length;

    // Expenses
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    let thisMonthExpenses = 0;
    try {
      const { calculateCurrentMonthExpenses } = await import("@/lib/finance/expense-calculator");
      const expenseItems = allExpenses.map((exp: any) => ({
        amount: Number(exp.amount),
        isRecurring: exp.isRecurring,
        frequency: exp.frequency,
        expenseDate: exp.expenseDate,
      }));
      thisMonthExpenses = calculateCurrentMonthExpenses(expenseItems).total / 100;
    } catch {}

    const thisMonthRevenue = paidInvoices
      .filter((inv: any) => inv.paidAt && new Date(inv.paidAt) >= thisMonth)
      .reduce((sum: number, inv: any) => sum + Number(inv.total || 0), 0);

    const netProfit = thisMonthRevenue - thisMonthExpenses;

    // MRR
    const maintenanceMRR = maintenancePlans.reduce(
      (sum: number, plan: any) => sum + (Number(plan.monthlyPrice) || 0), 0
    );

    // ── Revenue chart data (last 6 months) ──
    const revenueData: { month: string; revenue: number; invoices: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      const monthLabel = d.toLocaleString("en-US", { month: "short" });
      const monthPaid = paidInvoices.filter((inv: any) => {
        const paidDate = inv.paidAt ? new Date(inv.paidAt) : null;
        return paidDate && paidDate >= d && paidDate <= monthEnd;
      });
      revenueData.push({
        month: monthLabel,
        revenue: monthPaid.reduce((s: number, inv: any) => s + Number(inv.total || 0), 0),
        invoices: monthPaid.length,
      });
    }

    // ── Leads by stage ──
    const stageColors: Record<string, string> = {
      NEW: "#3b82f6",
      CONTACTED: "#8b5cf6",
      QUALIFIED: "#f59e0b",
      PROPOSAL_SENT: "#ec4899",
      CONVERTED: "#10b981",
      LOST: "#ef4444",
    };
    const leadsByStage = Object.entries(
      leads.reduce((acc: Record<string, number>, lead: any) => {
        acc[lead.status] = (acc[lead.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([stage, count]) => ({
      stage: stage.replace(/_/g, " "),
      count: count as number,
      color: stageColors[stage] || "#64748b",
    }));

    // ── Projects by status ──
    const statusColors: Record<string, string> = {
      ACTIVE: "#10b981",
      IN_PROGRESS: "#3b82f6",
      DESIGN: "#8b5cf6",
      BUILD: "#f59e0b",
      REVIEW: "#ec4899",
      COMPLETED: "#22c55e",
      ON_HOLD: "#64748b",
      CANCELLED: "#ef4444",
    };
    const projectsByStatus = Object.entries(
      projects.reduce((acc: Record<string, number>, proj: any) => {
        acc[proj.status] = (acc[proj.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([status, count]) => ({
      status: status.replace(/_/g, " "),
      count: count as number,
      color: statusColors[status] || "#64748b",
    }));

    // ── Recent invoices ──
    const recentInvoices = invoices
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8)
      .map((inv: any) => ({
        id: inv.id,
        number: inv.invoiceNumber || inv.id.slice(0, 8),
        client: inv.organization?.name || "Unknown",
        amount: Number(inv.total || 0),
        status: inv.status,
        dueDate: inv.dueDate ? new Date(inv.dueDate).toISOString() : null,
      }));

    // ── Alerts ──
    const alerts: Alert[] = [];
    const overdueInvoices = invoices.filter((inv: any) => inv.status === "OVERDUE");
    overdueInvoices.forEach((inv: any) => {
      alerts.push({
        id: `inv-${inv.id}`,
        type: "overdue_invoice",
        title: `Overdue: ${inv.invoiceNumber || inv.id.slice(0, 8)}`,
        description: `${inv.organization?.name || "Client"} - $${Number(inv.total || 0).toLocaleString()}`,
        severity: "critical",
        link: "/admin/finance/transactions",
        createdAt: inv.dueDate || inv.createdAt,
      });
    });

    const overdueTasks = tasks.filter(
      (t: any) => t.status !== "DONE" && t.dueDate && new Date(t.dueDate) < now
    );
    overdueTasks.slice(0, 3).forEach((task: any) => {
      alerts.push({
        id: `task-${task.id}`,
        type: "task_due",
        title: `Overdue task: ${task.title}`,
        description: `Due ${new Date(task.dueDate).toLocaleDateString()}`,
        severity: "warning",
        link: "/admin/tasks",
        createdAt: task.dueDate,
      });
    });

    if (pendingChangeRequests > 0) {
      alerts.push({
        id: "pending-cr",
        type: "pending_approval",
        title: `${pendingChangeRequests} pending change request${pendingChangeRequests > 1 ? "s" : ""}`,
        description: "Awaiting review and approval",
        severity: "info",
        link: "/admin/service-plans",
        createdAt: new Date(),
      });
    }

    // ── Transform activities ──
    const transformedActivities = activities.map((activity: any) => ({
      id: activity.id,
      type: activity.type ? String(activity.type) : null,
      message: activity.title || activity.description || "",
      timestamp: activity.createdAt,
    }));

    return (
      <SuperDashboardClient
        stats={{
          totalRevenue,
          thisMonthRevenue,
          thisMonthExpenses,
          netProfit,
          activeProjects,
          totalClients: clientIds.size,
          unpaidInvoices,
          maintenanceMRR,
          maintenanceARR: maintenanceMRR * 12,
          pendingChangeRequests,
        }}
        taskStats={taskStats as any}
        activities={transformedActivities}
        revenueData={revenueData}
        leadsByStage={leadsByStage}
        projectsByStatus={projectsByStatus}
        recentInvoices={recentInvoices}
        alerts={alerts}
        teamWorkload={teamWorkload}
        cashFlow={cashFlow}
        isCeoOrCfo={isCeoOrCfo}
      />
    );
  } catch (error) {
    console.error("[Super Dashboard] Fatal error:", error);
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="max-w-md space-y-4 rounded-lg border border-red-500/20 bg-red-500/5 p-8 text-center">
          <h2 className="text-xl font-bold text-white">Dashboard Error</h2>
          <p className="text-sm text-white/60">
            Something went wrong loading the super dashboard.
          </p>
          <p className="font-mono text-xs text-red-400">
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
        </div>
      </div>
    );
  }
}
