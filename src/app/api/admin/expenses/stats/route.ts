/**
 * Expense Statistics API
 * Aggregated stats and analytics for expenses
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { requireAdmin } from "@/lib/authz";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisYear = new Date(now.getFullYear(), 0, 1);

    // Get all expenses
    const allExpenses = await db.businessExpense.findMany({
      orderBy: { expenseDate: "desc" },
    });

    // This month's expenses
    const thisMonthExpenses = allExpenses.filter(
      (e: any) => new Date(e.expenseDate) >= thisMonth
    );
    const thisMonthTotal = thisMonthExpenses.reduce((sum: number, e: any) => sum + e.amount, 0);

    // Last month's expenses
    const lastMonthExpenses = allExpenses.filter(
      (e: any) => new Date(e.expenseDate) >= lastMonth && new Date(e.expenseDate) < thisMonth
    );
    const lastMonthTotal = lastMonthExpenses.reduce((sum: number, e: any) => sum + e.amount, 0);

    // This year's expenses
    const thisYearExpenses = allExpenses.filter(
      (e: any) => new Date(e.expenseDate) >= thisYear
    );
    const thisYearTotal = thisYearExpenses.reduce((sum: number, e: any) => sum + e.amount, 0);

    // Recurring expenses total (monthly cost)
    const recurringExpenses = allExpenses.filter((e: any) => e.isRecurring && e.status !== "CANCELLED");
    const monthlyRecurring = recurringExpenses
      .filter((e: any) => e.frequency === "monthly")
      .reduce((sum: number, e: any) => sum + e.amount, 0);
    const yearlyRecurring = recurringExpenses
      .filter((e: any) => e.frequency === "yearly")
      .reduce((sum: number, e: any) => sum + e.amount, 0);
    const totalMonthlyRecurring = monthlyRecurring + Math.round(yearlyRecurring / 12);

    // Expenses by category (this month)
    const byCategoryThisMonth = thisMonthExpenses.reduce(
      (acc: Record<string, number>, e: any) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount;
        return acc;
      },
      {}
    );

    // Expenses by vendor (this month)
    const byVendorThisMonth = thisMonthExpenses.reduce(
      (acc: Record<string, number>, e: any) => {
        const vendorKey = e.vendor || "Unknown";
        acc[vendorKey] = (acc[vendorKey] || 0) + e.amount;
        return acc;
      },
      {}
    );

    // Monthly trend (last 6 months)
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      const monthExpenses = allExpenses.filter(
        (e: any) => new Date(e.expenseDate) >= monthStart && new Date(e.expenseDate) < monthEnd
      );

      monthlyTrend.push({
        month: monthStart.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        total: monthExpenses.reduce((sum: number, e: any) => sum + e.amount, 0),
        count: monthExpenses.length,
      });
    }

    // Top vendors by spend
    const vendorTotals: Record<string, number> = {};
    allExpenses.forEach((e: any) => {
      const vendor = e.vendor || "Unknown";
      vendorTotals[vendor] = (vendorTotals[vendor] || 0) + e.amount;
    });
    const topVendors = Object.entries(vendorTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([vendor, amount]) => ({ vendor, amount }));

    // Category totals (all time)
    const categoryTotals: Record<string, number> = {};
    allExpenses.forEach((e: any) => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });
    const categoryBreakdown = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .map(([category, amount]) => ({ category, amount }));

    // Upcoming recurring expenses
    const upcomingRecurring = recurringExpenses
      .filter((e: any) => e.nextDueDate && new Date(e.nextDueDate) >= now)
      .sort((a: any, b: any) => new Date(a.nextDueDate!).getTime() - new Date(b.nextDueDate!).getTime())
      .slice(0, 10);

    // Growth percentage
    const monthOverMonthGrowth =
      lastMonthTotal > 0
        ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100
        : 0;

    return NextResponse.json({
      overview: {
        thisMonthTotal,
        lastMonthTotal,
        thisYearTotal,
        totalMonthlyRecurring,
        monthOverMonthGrowth,
        totalExpenseCount: allExpenses.length,
        recurringExpenseCount: recurringExpenses.length,
      },
      byCategoryThisMonth,
      byVendorThisMonth,
      monthlyTrend,
      topVendors,
      categoryBreakdown,
      upcomingRecurring,
    });
  } catch (error: any) {
    console.error("Error fetching expense stats:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch expense stats" },
      { status: 500 }
    );
  }
}
