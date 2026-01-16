/**
 * Expense Statistics API
 * Aggregated stats and analytics for expenses
 * PROPERLY handles recurring vs one-time expenses
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { requireAdmin } from "@/lib/authz";
import {
  calculateCurrentMonthExpenses,
  calculateMonthlyExpenses,
  calculateExpenses,
} from "@/lib/finance/expense-calculator";

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

    // Map to calculation format
    const expenseItems = allExpenses.map((e) => ({
      amount: Number(e.amount),
      isRecurring: e.isRecurring,
      frequency: e.frequency,
      expenseDate: e.expenseDate,
    }));

    // This month's expenses (properly calculated)
    const thisMonthCalc = calculateCurrentMonthExpenses(expenseItems);
    const thisMonthTotal = thisMonthCalc.total;

    // Last month's expenses
    const lastMonthCalc = calculateMonthlyExpenses(
      expenseItems,
      lastMonth.getFullYear(),
      lastMonth.getMonth()
    );
    const lastMonthTotal = lastMonthCalc.total;

    // This year's expenses
    const thisYearCalc = calculateExpenses(expenseItems, thisYear);
    const thisYearTotal = thisYearCalc.total;

    // Monthly recurring cost (properly calculated)
    const totalMonthlyRecurring = thisMonthCalc.monthlyRecurringCost;

    // Get recurring expenses for filtering
    const recurringExpenses = allExpenses.filter((e: any) => e.isRecurring && e.status !== "CANCELLED");

    // Expenses by category (this month) - properly avoiding double-counting
    // Return values in DOLLARS (not cents) for display
    const thisMonthExpenses = allExpenses.filter(
      (e: any) => new Date(e.expenseDate) >= thisMonth
    );
    
    const byCategoryThisMonth: Record<string, number> = {};
    const seenRecurring = new Set<string>();
    
    for (const e of thisMonthExpenses) {
      const amountInDollars = Number(e.amount) / 100; // Convert cents to dollars
      
      if (e.isRecurring) {
        // For recurring, only count unique ones
        const key = `${e.category}-${e.amount}-${e.frequency}`;
        if (!seenRecurring.has(key)) {
          byCategoryThisMonth[e.category] = (byCategoryThisMonth[e.category] || 0) + amountInDollars;
          seenRecurring.add(key);
        }
      } else {
        // For one-time, count all
        byCategoryThisMonth[e.category] = (byCategoryThisMonth[e.category] || 0) + amountInDollars;
      }
    }

    // Expenses by vendor (this month) - Return in DOLLARS
    const byVendorThisMonth: Record<string, number> = {};
    const seenVendorRecurring = new Set<string>();
    
    for (const e of thisMonthExpenses) {
      const vendorKey = e.vendor || "Unknown";
      const amountInDollars = Number(e.amount) / 100; // Convert cents to dollars
      
      if (e.isRecurring) {
        const key = `${vendorKey}-${e.amount}-${e.frequency}`;
        if (!seenVendorRecurring.has(key)) {
          byVendorThisMonth[vendorKey] = (byVendorThisMonth[vendorKey] || 0) + amountInDollars;
          seenVendorRecurring.add(key);
        }
      } else {
        byVendorThisMonth[vendorKey] = (byVendorThisMonth[vendorKey] || 0) + amountInDollars;
      }
    }

    // Monthly trend (last 6 months) - properly calculated
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

      const monthCalc = calculateExpenses(expenseItems, monthStart, monthEnd);

      monthlyTrend.push({
        month: monthStart.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        total: monthCalc.total,
        count: allExpenses.filter(
          (e: any) => new Date(e.expenseDate) >= monthStart && new Date(e.expenseDate) <= monthEnd
        ).length,
      });
    }

    // Top vendors by spend (avoid double-counting recurring) - Return in DOLLARS
    const vendorTotals: Record<string, number> = {};
    const seenVendorRecurringAll = new Set<string>();
    
    for (const e of allExpenses) {
      const vendor = e.vendor || "Unknown";
      const amountInDollars = Number(e.amount) / 100; // Convert cents to dollars
      
      if (e.isRecurring) {
        const key = `${vendor}-${e.amount}-${e.frequency}`;
        if (!seenVendorRecurringAll.has(key)) {
          vendorTotals[vendor] = (vendorTotals[vendor] || 0) + amountInDollars;
          seenVendorRecurringAll.add(key);
        }
      } else {
        vendorTotals[vendor] = (vendorTotals[vendor] || 0) + amountInDollars;
      }
    }
    
    const topVendors = Object.entries(vendorTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([vendor, amount]) => ({ vendor, amount }));

    // Category totals (all time) - avoid double-counting recurring - Return in DOLLARS
    const categoryTotals: Record<string, number> = {};
    const seenCategoryRecurring = new Set<string>();
    
    for (const e of allExpenses) {
      const amountInDollars = Number(e.amount) / 100; // Convert cents to dollars
      
      if (e.isRecurring) {
        const key = `${e.category}-${e.amount}-${e.frequency}`;
        if (!seenCategoryRecurring.has(key)) {
          categoryTotals[e.category] = (categoryTotals[e.category] || 0) + amountInDollars;
          seenCategoryRecurring.add(key);
        }
      } else {
        categoryTotals[e.category] = (categoryTotals[e.category] || 0) + amountInDollars;
      }
    }
    
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
