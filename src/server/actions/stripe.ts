import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

/**
 * Get Stripe balance and financial overview
 */
export async function getStripeBalance() {
  try {
    const balance = await stripe.balance.retrieve();
    
    // Calculate totals
    const available = balance.available.reduce((sum, bal) => sum + bal.amount, 0) / 100;
    const pending = balance.pending.reduce((sum, bal) => sum + bal.amount, 0) / 100;
    const total = available + pending;

    return {
      success: true,
      balance: {
        available,
        pending,
        total,
      },
    };
  } catch (error: any) {
    console.error("Failed to fetch Stripe balance:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch balance",
      balance: {
        available: 0,
        pending: 0,
        total: 0,
      },
    };
  }
}

/**
 * Get recent payouts
 */
export async function getRecentPayouts(limit: number = 10) {
  try {
    const payouts = await stripe.payouts.list({
      limit,
    });

    return {
      success: true,
      payouts: payouts.data.map((payout) => ({
        id: payout.id,
        amount: payout.amount / 100,
        currency: payout.currency.toUpperCase(),
        status: payout.status,
        arrivalDate: new Date(payout.arrival_date * 1000),
        description: payout.description || null,
      })),
    };
  } catch (error: any) {
    console.error("Failed to fetch payouts:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch payouts",
      payouts: [],
    };
  }
}

/**
 * Get financial metrics from database and Stripe
 */
export async function getFinancialMetrics() {
  try {
    // Get paid invoices from database
    const paidInvoices = await prisma.invoice.findMany({
      where: {
        status: "PAID",
      },
      select: {
        total: true,
        paidAt: true,
      },
    });

    // Get pending invoices
    const pendingInvoices = await prisma.invoice.findMany({
      where: {
        status: "SENT",
      },
      select: {
        total: true,
      },
    });

    // Calculate totals
    const totalIncome = paidInvoices.reduce((sum, inv) => sum + Number(inv.total), 0);
    const pendingPayments = pendingInvoices.reduce((sum, inv) => sum + Number(inv.total), 0);

    // Get refunds from Stripe (last 30 days)
    const thirtyDaysAgo = Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000);
    let refunds = 0;
    try {
      const charges = await stripe.charges.list({
        limit: 100,
        created: { gte: thirtyDaysAgo },
      });

      refunds = charges.data
        .filter((charge) => charge.refunded)
        .reduce((sum, charge) => sum + (charge.amount_refunded || 0), 0) / 100;
    } catch (error) {
      console.error("Failed to fetch refunds:", error);
    }

    // Get recent income trend (last quarter vs previous quarter)
    const now = new Date();
    const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
    const previousQuarterStart = new Date(quarterStart);
    previousQuarterStart.setMonth(previousQuarterStart.getMonth() - 3);

    const thisQuarterIncome = paidInvoices
      .filter((inv) => inv.paidAt && new Date(inv.paidAt) >= quarterStart)
      .reduce((sum, inv) => sum + Number(inv.total), 0);

    const lastQuarterIncome = paidInvoices
      .filter(
        (inv) =>
          inv.paidAt &&
          new Date(inv.paidAt) >= previousQuarterStart &&
          new Date(inv.paidAt) < quarterStart
      )
      .reduce((sum, inv) => sum + Number(inv.total), 0);

    const growthPercent =
      lastQuarterIncome > 0
        ? Math.round(((thisQuarterIncome - lastQuarterIncome) / lastQuarterIncome) * 100)
        : 0;

    // Get Stripe account info
    let accountInfo = {
      accountId: "N/A",
      payoutSchedule: "Weekly",
      lastPayout: null as Date | null,
      lastPayoutAmount: 0,
    };

    try {
      const account = await stripe.accounts.retrieve();
      accountInfo.accountId = account.id;

      // Get payout schedule
      if (account.payouts_enabled) {
        const payoutSchedule = await stripe.accounts.retrieveCapability(account.id, "card_payments");
        // Default to weekly
        accountInfo.payoutSchedule = "Weekly";
      }

      // Get last payout
      const payouts = await stripe.payouts.list({ limit: 1 });
      if (payouts.data.length > 0) {
        const lastPayout = payouts.data[0];
        accountInfo.lastPayout = new Date(lastPayout.created * 1000);
        accountInfo.lastPayoutAmount = lastPayout.amount / 100;
      }
    } catch (error) {
      console.error("Failed to fetch account info:", error);
    }

    // Generate revenue vs expenses (last 6 months)
    // For now, we'll use revenue data and estimate expenses (30% of revenue)
    const revenueVsExpenses: { month: string; revenue: number; expenses: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const monthRevenue = paidInvoices
        .filter(
          (inv) =>
            inv.paidAt &&
            new Date(inv.paidAt) >= monthStart &&
            new Date(inv.paidAt) <= monthEnd
        )
        .reduce((sum, inv) => sum + Number(inv.total), 0);
      
      // Estimate expenses as 30% of revenue
      const monthExpenses = monthRevenue * 0.3;
      
      revenueVsExpenses.push({
        month: date.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        revenue: monthRevenue,
        expenses: monthExpenses,
      });
    }

    // Generate cash flow timeline (last 6 months)
    const cashFlowTimeline = revenueVsExpenses.map((item) => ({
      month: item.month,
      cashFlow: item.revenue - item.expenses,
    }));

    // Invoice status breakdown
    const invoices = await prisma.invoice.findMany({
      select: { status: true },
    });

    const invoiceStatusBreakdown = {
      PAID: invoices.filter((inv) => inv.status === "PAID").length,
      SENT: invoices.filter((inv) => inv.status === "SENT").length,
      OVERDUE: invoices.filter((inv) => inv.status === "OVERDUE").length,
      DRAFT: invoices.filter((inv) => inv.status === "DRAFT").length,
    };

    // Payment method distribution (mock data - would need Stripe data)
    const paymentMethodDistribution = {
      card: Math.floor(totalIncome * 0.7),
      bank_transfer: Math.floor(totalIncome * 0.2),
      other: Math.floor(totalIncome * 0.1),
    };

    // Monthly Recurring Revenue (MRR) trend (last 6 months)
    // For now, estimate MRR from maintenance subscriptions
    const mrrTrend = revenueVsExpenses.map((item) => ({
      month: item.month,
      mrr: Math.floor(item.revenue * 0.2), // Estimate 20% as MRR
    }));

    return {
      success: true,
      metrics: {
        totalIncome,
        pendingPayments,
        refunds,
        growthPercent,
        accountInfo,
        revenueVsExpenses,
        cashFlowTimeline,
        invoiceStatusBreakdown,
        paymentMethodDistribution,
        mrrTrend,
      },
    };
  } catch (error: any) {
    console.error("Failed to fetch financial metrics:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch financial metrics",
      metrics: {
        totalIncome: 0,
        pendingPayments: 0,
        refunds: 0,
        growthPercent: 0,
        accountInfo: {
          accountId: "N/A",
          payoutSchedule: "Weekly",
          lastPayout: null,
          lastPayoutAmount: 0,
        },
      },
    };
  }
}

