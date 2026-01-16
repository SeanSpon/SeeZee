/**
 * Unified Finance Dashboard
 * Comprehensive financial overview with metrics, charts, and quick actions
 */

import { db } from "@/server/db";
import { FinanceOverview } from "@/components/admin/finance/FinanceOverview";
import { getCurrentUser } from "@/lib/auth/requireRole";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function FinancePage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  // Fetch all financial data in parallel including expenses
  const [invoices, payments, maintenancePlans, projects, organizations, expenses] = await Promise.all([
    // All invoices with relationships
    db.invoice.findMany({
      include: {
        organization: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
        payments: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    
    // Recent payments
    db.payment.findMany({
      where: { status: "COMPLETED" },
      include: {
        invoice: {
          select: { number: true, title: true, organization: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    
    // Active maintenance plans (subscriptions)
    db.maintenancePlan.findMany({
      include: {
        project: {
          include: {
            organization: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    
    // Active projects for revenue tracking
    db.project.findMany({
      where: { status: { in: ["ACTIVE", "COMPLETED", "MAINTENANCE"] } },
      select: { 
        id: true, 
        name: true, 
        budget: true, 
        status: true,
        createdAt: true,
        organization: { select: { name: true } },
      },
    }),
    
    // Organizations with payment info
    db.organization.findMany({
      select: { 
        id: true, 
        name: true, 
        stripeCustomerId: true,
      },
    }),

    // Business expenses
    db.businessExpense.findMany({
      orderBy: { expenseDate: "desc" },
    }),
  ]);

  // Calculate key metrics
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const last90Days = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  const paidInvoices = invoices.filter(inv => inv.status === "PAID");
  const outstandingInvoices = invoices.filter(inv => 
    inv.status === "SENT" || inv.status === "OVERDUE"
  );

  // Revenue calculations
  const totalRevenue = paidInvoices.reduce((sum, inv) => sum + Number(inv.total), 0);
  
  const thisMonthRevenue = paidInvoices
    .filter(inv => inv.paidAt && new Date(inv.paidAt) >= thisMonth)
    .reduce((sum, inv) => sum + Number(inv.total), 0);
  
  const lastMonthRevenue = paidInvoices
    .filter(inv => 
      inv.paidAt && 
      new Date(inv.paidAt) >= lastMonth && 
      new Date(inv.paidAt) < thisMonth
    )
    .reduce((sum, inv) => sum + Number(inv.total), 0);

  const last30DaysRevenue = paidInvoices
    .filter(inv => inv.paidAt && new Date(inv.paidAt) >= last30Days)
    .reduce((sum, inv) => sum + Number(inv.total), 0);

  const outstandingAmount = outstandingInvoices.reduce(
    (sum, inv) => sum + Number(inv.total), 
    0
  );

  const overdueInvoices = invoices.filter(inv => {
    if (inv.status !== "SENT" && inv.status !== "OVERDUE") return false;
    if (!inv.dueDate) return false;
    return new Date(inv.dueDate) < now;
  });

  const overdueAmount = overdueInvoices.reduce(
    (sum, inv) => sum + Number(inv.total),
    0
  );

  // Expense calculations
  const thisMonthExpenses = expenses
    .filter(exp => new Date(exp.expenseDate) >= thisMonth)
    .reduce((sum, exp) => sum + Number(exp.amount), 0);
  
  const lastMonthExpenses = expenses
    .filter(exp => 
      new Date(exp.expenseDate) >= lastMonth && 
      new Date(exp.expenseDate) < thisMonth
    )
    .reduce((sum, exp) => sum + Number(exp.amount), 0);
  
  const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

  // Net profit calculations (convert cents to dollars)
  const thisMonthNetProfit = thisMonthRevenue - (thisMonthExpenses / 100);
  const lastMonthNetProfit = lastMonthRevenue - (lastMonthExpenses / 100);
  const totalNetProfit = totalRevenue - (totalExpenses / 100);

  // Available funds = total revenue - total expenses - outstanding amounts that need to be paid
  const availableFunds = totalRevenue - (totalExpenses / 100);

  // Subscription metrics
  const activeSubscriptions = maintenancePlans.filter(plan => plan.status === "ACTIVE");
  const monthlyRecurringRevenue = activeSubscriptions.reduce(
    (sum, plan) => sum + Number(plan.monthlyPrice),
    0
  );
  const annualRecurringRevenue = monthlyRecurringRevenue * 12;

  // Payment metrics
  const last30DaysPayments = payments.filter(
    payment => new Date(payment.createdAt) >= last30Days
  );
  const averagePaymentValue = last30DaysPayments.length > 0
    ? last30DaysPayments.reduce((sum, p) => sum + Number(p.amount), 0) / last30DaysPayments.length
    : 0;

  // Growth calculations
  const revenueGrowth = lastMonthRevenue > 0
    ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
    : 0;

  // Revenue and Expenses by month for chart (last 12 months)
  const revenueByMonth = [];
  const expensesByMonth = [];
  const revenueVsExpenses = [];
  
  for (let i = 11; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    
    const revenue = paidInvoices
      .filter(inv => 
        inv.paidAt && 
        new Date(inv.paidAt) >= monthStart && 
        new Date(inv.paidAt) < monthEnd
      )
      .reduce((sum, inv) => sum + Number(inv.total), 0);

    const monthExpenses = expenses
      .filter(exp => 
        new Date(exp.expenseDate) >= monthStart && 
        new Date(exp.expenseDate) < monthEnd
      )
      .reduce((sum, exp) => sum + Number(exp.amount), 0) / 100; // Convert cents to dollars

    const monthLabel = monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

    revenueByMonth.push({
      month: monthLabel,
      revenue,
    });

    expensesByMonth.push({
      month: monthLabel,
      expenses: monthExpenses,
    });

    revenueVsExpenses.push({
      month: monthLabel,
      revenue,
      expenses: monthExpenses,
      profit: revenue - monthExpenses,
    });
  }

  // Prepare data for client component
  const metrics = {
    totalRevenue,
    thisMonthRevenue,
    lastMonthRevenue,
    last30DaysRevenue,
    revenueGrowth,
    outstandingAmount,
    overdueAmount,
    monthlyRecurringRevenue,
    annualRecurringRevenue,
    activeSubscriptions: activeSubscriptions.length,
    totalSubscriptions: maintenancePlans.length,
    totalInvoices: invoices.length,
    paidInvoices: paidInvoices.length,
    outstandingInvoices: outstandingInvoices.length,
    overdueInvoices: overdueInvoices.length,
    totalPayments: payments.length,
    averagePaymentValue,
    revenueByMonth,
    revenueVsExpenses, // Combined revenue and expenses data
    // Expense metrics
    thisMonthExpenses: thisMonthExpenses / 100, // Convert cents to dollars
    lastMonthExpenses: lastMonthExpenses / 100,
    totalExpenses: totalExpenses / 100,
    thisMonthNetProfit,
    lastMonthNetProfit,
    totalNetProfit,
    availableFunds,
  };

  // Recent activity
  const recentInvoices = invoices.slice(0, 5).map(inv => ({
    id: inv.id,
    number: inv.number || `INV-${inv.id.slice(0, 6)}`,
    client: inv.organization?.name || "Unknown",
    amount: Number(inv.total),
    status: inv.status,
    dueDate: inv.dueDate?.toISOString() || null,
    createdAt: inv.createdAt.toISOString(),
  }));

  const recentPayments = payments.slice(0, 5).map(payment => ({
    id: payment.id,
    amount: Number(payment.amount),
    client: payment.invoice?.organization?.name || "No Client",
    invoiceNumber: payment.invoiceId ? (payment.invoice?.number || "N/A") : "Manual",
    date: payment.createdAt.toISOString(),
    method: payment.method || "Unknown",
  }));

  const subscriptionData = activeSubscriptions.map(plan => ({
    id: plan.id,
    client: plan.project?.organization?.name || "Unknown",
    project: plan.project?.name || "Unknown",
    amount: Number(plan.monthlyPrice),
    status: plan.status,
    billingCycle: "monthly",
    nextBillingDate: null,
  }));

  // Recent expenses for display
  const recentExpenses = expenses.slice(0, 10).map(exp => ({
    id: exp.id,
    name: exp.name,
    amount: Number(exp.amount) / 100, // Convert cents to dollars
    category: exp.category,
    vendor: exp.vendor,
    status: exp.status,
    expenseDate: exp.expenseDate.toISOString(),
    isRecurring: exp.isRecurring,
  }));

  return (
    <FinanceOverview
      metrics={metrics}
      recentInvoices={recentInvoices}
      recentPayments={recentPayments}
      subscriptions={subscriptionData}
      recentExpenses={recentExpenses}
    />
  );
}

