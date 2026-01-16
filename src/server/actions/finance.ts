"use server";

/**
 * Finance Server Actions
 * Comprehensive financial data fetching for CEO dashboard
 */

import { db } from "@/server/db";
import { requireRole } from "@/lib/auth/requireRole";
import { ROLE } from "@/lib/role";
import {
  calculateTotalExpenses,
  calculateExpenses,
  calculateCurrentMonthExpenses,
} from "@/lib/finance/expense-calculator";

/**
 * Get all expenses with comprehensive stats
 * PROPERLY handles recurring vs one-time expenses
 */
export async function getExpenses() {
  await requireRole([ROLE.CEO, ROLE.CFO]);

  try {
    const expenses = await db.businessExpense.findMany({
      orderBy: { expenseDate: "desc" },
    });

    // Map to our calculation format
    const expenseItems = expenses.map((exp) => ({
      amount: Number(exp.amount),
      isRecurring: exp.isRecurring,
      frequency: exp.frequency,
      expenseDate: exp.expenseDate,
    }));

    // Calculate total expenses properly (avoiding double-counting recurring)
    const totalCalc = calculateTotalExpenses(expenseItems);
    
    // Calculate current month expenses
    const currentMonthCalc = calculateCurrentMonthExpenses(expenseItems);

    // Calculate expenses by category (for one-time purchases, sum all; for recurring, count unique)
    // Store in DOLLARS (not cents) for display
    const expensesByCategory = expenses.reduce((acc: Record<string, number>, expense) => {
      const category = expense.category || "Uncategorized";
      const amountInDollars = Number(expense.amount) / 100; // Convert cents to dollars
      
      if (!expense.isRecurring) {
        // One-time: sum all
        acc[category] = (acc[category] || 0) + amountInDollars;
      } else {
        // Recurring: only count unique ones (simplified - in production you'd track by ID)
        const key = `${category}-${expense.amount}-${expense.frequency}`;
        if (!acc[`_seen_${key}`]) {
          acc[category] = (acc[category] || 0) + amountInDollars;
          acc[`_seen_${key}`] = 1;
        }
      }
      return acc;
    }, {});

    // Remove tracking keys
    Object.keys(expensesByCategory).forEach((key) => {
      if (key.startsWith("_seen_")) {
        delete expensesByCategory[key];
      }
    });

    // Calculate recent expenses (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentCalc = calculateExpenses(expenseItems, thirtyDaysAgo);

    // Calculate previous period (30-60 days ago)
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    const previousCalc = calculateExpenses(expenseItems, sixtyDaysAgo, thirtyDaysAgo);

    const expenseTrend =
      previousCalc.total > 0
        ? ((recentCalc.total - previousCalc.total) / previousCalc.total) * 100
        : recentCalc.total > 0 ? 100 : 0;

    // Serialize expenses
    const serializedExpenses = expenses.map((expense) => ({
      ...expense,
      amount: Number(expense.amount),
    }));

    return {
      success: true,
      expenses: serializedExpenses,
      stats: {
        total: totalCalc.total / 100, // Convert cents to dollars
        totalOneTime: totalCalc.totalOneTime / 100,
        totalRecurring: totalCalc.totalRecurring / 100,
        monthlyRecurringCost: totalCalc.monthlyRecurringCost / 100,
        thisMonth: currentMonthCalc.total / 100,
        thisMonthOneTime: currentMonthCalc.totalOneTime / 100,
        thisMonthRecurring: currentMonthCalc.totalRecurring / 100,
        recent: recentCalc.total / 100,
        trend: expenseTrend,
        byCategory: expensesByCategory,
        count: expenses.length,
        recurringCount: expenses.filter((e) => e.isRecurring).length,
        oneTimeCount: expenses.filter((e) => !e.isRecurring).length,
      },
    };
  } catch (error) {
    console.error("Failed to fetch expenses:", error);
    return {
      success: false,
      error: "Failed to fetch expenses",
      expenses: [],
      stats: {
        total: 0,
        totalOneTime: 0,
        totalRecurring: 0,
        monthlyRecurringCost: 0,
        thisMonth: 0,
        thisMonthOneTime: 0,
        thisMonthRecurring: 0,
        recent: 0,
        trend: 0,
        byCategory: {},
        count: 0,
        recurringCount: 0,
        oneTimeCount: 0,
      },
    };
  }
}

/**
 * Get comprehensive financial summary including revenue, expenses, profit
 * PROPERLY handles recurring vs one-time expenses
 */
export async function getFinancialSummary() {
  await requireRole([ROLE.CEO, ROLE.CFO]);

  try {
    // Get invoices
    const invoices = await db.invoice.findMany({
      select: {
        total: true,
        status: true,
        paidAt: true,
        createdAt: true,
      },
    });

    // Calculate revenue
    const totalRevenue = invoices
      .filter((inv) => inv.status === "PAID")
      .reduce((sum, inv) => sum + Number(inv.total), 0);

    const pendingRevenue = invoices
      .filter((inv) => ["SENT", "OVERDUE"].includes(inv.status))
      .reduce((sum, inv) => sum + Number(inv.total), 0);

    // Get expenses with proper calculations
    const expensesResult = await getExpenses();
    const totalExpenses = expensesResult.stats.total; // Already in dollars
    const recentExpenses = expensesResult.stats.recent; // Already in dollars

    // Calculate profit (both in dollars now)
    const grossProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    // Recent data (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentRevenue = invoices
      .filter(
        (inv) =>
          inv.status === "PAID" && inv.paidAt && inv.paidAt >= thirtyDaysAgo
      )
      .reduce((sum, inv) => sum + Number(inv.total), 0);

    const recentProfit = recentRevenue - recentExpenses;

    // Monthly breakdown for last 6 months
    const monthlyData = [];
    const allExpenses = expensesResult.expenses.map((exp: any) => ({
      amount: Number(exp.amount),
      isRecurring: exp.isRecurring,
      frequency: exp.frequency,
      expenseDate: new Date(exp.expenseDate),
    }));

    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const monthRevenue = invoices
        .filter(
          (inv) =>
            inv.status === "PAID" &&
            inv.paidAt &&
            inv.paidAt >= monthStart &&
            inv.paidAt <= monthEnd
        )
        .reduce((sum, inv) => sum + Number(inv.total), 0);

      // Use proper expense calculation for this month
      const monthExpenseCalc = calculateExpenses(allExpenses, monthStart, monthEnd);
      const monthExpenses = monthExpenseCalc.total / 100; // Convert cents to dollars

      monthlyData.push({
        month: date.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        revenue: monthRevenue,
        expenses: monthExpenses,
        profit: monthRevenue - monthExpenses,
      });
    }

    return {
      success: true,
      summary: {
        revenue: {
          total: totalRevenue,
          pending: pendingRevenue,
          recent: recentRevenue,
        },
        expenses: {
          total: totalExpenses,
          totalOneTime: expensesResult.stats.totalOneTime,
          totalRecurring: expensesResult.stats.totalRecurring,
          monthlyRecurringCost: expensesResult.stats.monthlyRecurringCost,
          recent: recentExpenses,
          byCategory: expensesResult.stats.byCategory,
        },
        profit: {
          gross: grossProfit,
          margin: profitMargin,
          recent: recentProfit,
        },
        monthlyData,
      },
    };
  } catch (error) {
    console.error("Failed to fetch financial summary:", error);
    return {
      success: false,
      error: "Failed to fetch financial summary",
    };
  }
}

/**
 * Get cash flow analysis
 */
export async function getCashFlowAnalysis() {
  await requireRole([ROLE.CEO, ROLE.CFO]);

  try {
    const financialSummary = await getFinancialSummary();
    
    if (!financialSummary.success || !financialSummary.summary) {
      return {
        success: false,
        error: "Failed to calculate cash flow",
      };
    }

    const { revenue, expenses, profit } = financialSummary.summary;

    // Calculate burn rate (monthly expense average)
    const burnRate = expenses.total > 0 ? expenses.total / 6 : 0; // Last 6 months average

    // Calculate runway (months of operation at current burn rate)
    const cashOnHand = revenue.total - expenses.total;
    const runway = burnRate > 0 ? cashOnHand / burnRate : Infinity;

    // Operating cash flow
    const operatingCashFlow = profit.gross;

    return {
      success: true,
      cashFlow: {
        operatingCashFlow,
        burnRate,
        runway: runway === Infinity ? -1 : Math.max(0, runway),
        cashOnHand,
        healthScore: profit.margin, // Use profit margin as health score
      },
    };
  } catch (error) {
    console.error("Failed to calculate cash flow:", error);
    return {
      success: false,
      error: "Failed to calculate cash flow",
    };
  }
}
