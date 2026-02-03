import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { getCurrentUser } from "@/lib/auth/requireRole";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const range = searchParams.get("range") || "all";

    // Calculate date filter
    let dateFilter = {};
    const now = new Date();
    if (range === "month") {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { gte: thirtyDaysAgo } };
    } else if (range === "quarter") {
      const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { gte: ninetyDaysAgo } };
    } else if (range === "year") {
      const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { gte: oneYearAgo } };
    }

    // Fetch financial data
    const [invoices, payments, expenses] = await Promise.all([
      db.invoice.findMany({
        where: dateFilter,
        select: {
          id: true,
          number: true,
          total: true,
          status: true,
          createdAt: true,
          organization: { select: { name: true } },
        },
      }),
      db.payment.findMany({
        where: dateFilter,
        select: {
          id: true,
          amount: true,
          status: true,
          createdAt: true,
          invoice: {
            select: {
              number: true,
              organization: { select: { name: true } },
            },
          },
        },
      }),
      db.businessExpense.findMany({
        where: range === "all" 
          ? {} 
          : { date: (dateFilter as any).createdAt },
        select: {
          id: true,
          amount: true,
          category: true,
          description: true,
          date: true,
        },
      }),
    ]);

    // Calculate totals
    const totalInvoiced = invoices.reduce((sum, inv) => sum + Number(inv.total), 0);
    const totalPaid = invoices
      .filter(inv => inv.status === "PAID")
      .reduce((sum, inv) => sum + Number(inv.total), 0);
    const totalOutstanding = invoices
      .filter(inv => inv.status === "SENT" || inv.status === "OVERDUE")
      .reduce((sum, inv) => sum + Number(inv.total), 0);
    const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    const netProfit = totalPaid - totalExpenses;

    // Create summary CSV
    const summaryData = [
      ["Financial Summary Report", ""],
      ["Generated", now.toISOString()],
      ["Date Range", range === "all" ? "All Time" : range],
      ["", ""],
      ["REVENUE", ""],
      ["Total Invoiced", totalInvoiced.toFixed(2)],
      ["Total Paid", totalPaid.toFixed(2)],
      ["Outstanding", totalOutstanding.toFixed(2)],
      ["Total Invoices", invoices.length],
      ["Paid Invoices", invoices.filter(i => i.status === "PAID").length],
      ["", ""],
      ["EXPENSES", ""],
      ["Total Expenses", totalExpenses.toFixed(2)],
      ["Number of Expenses", expenses.length],
      ["", ""],
      ["PROFIT", ""],
      ["Net Profit (Paid - Expenses)", netProfit.toFixed(2)],
      ["Profit Margin", totalPaid > 0 ? ((netProfit / totalPaid) * 100).toFixed(2) + "%" : "0%"],
      ["", ""],
      ["", ""],
      ["DETAILED BREAKDOWN", ""],
      ["", ""],
      ["INVOICES BY CLIENT", ""],
      ["Client", "Total Invoiced", "Total Paid", "Outstanding"],
    ];

    // Group invoices by client
    const clientMap = new Map<string, { invoiced: number; paid: number; outstanding: number }>();
    invoices.forEach(inv => {
      const clientName = inv.organization?.name || "Unknown";
      const existing = clientMap.get(clientName) || { invoiced: 0, paid: 0, outstanding: 0 };
      const amount = Number(inv.total);
      
      existing.invoiced += amount;
      if (inv.status === "PAID") {
        existing.paid += amount;
      } else if (inv.status === "SENT" || inv.status === "OVERDUE") {
        existing.outstanding += amount;
      }
      
      clientMap.set(clientName, existing);
    });

    clientMap.forEach((data, client) => {
      summaryData.push([
        client,
        data.invoiced.toFixed(2),
        data.paid.toFixed(2),
        data.outstanding.toFixed(2),
      ]);
    });

    summaryData.push(["", ""], ["", ""], ["EXPENSES BY CATEGORY", ""]);
    summaryData.push(["Category", "Total Amount", "Count"]);

    // Group expenses by category
    const categoryMap = new Map<string, { total: number; count: number }>();
    expenses.forEach(exp => {
      const category = exp.category || "Uncategorized";
      const existing = categoryMap.get(category) || { total: 0, count: 0 };
      existing.total += Number(exp.amount);
      existing.count += 1;
      categoryMap.set(category, existing);
    });

    categoryMap.forEach((data, category) => {
      summaryData.push([
        category,
        data.total.toFixed(2),
        data.count.toString(),
      ]);
    });

    // Convert to CSV
    const csv = summaryData
      .map(row => 
        row.map(cell => {
          const value = String(cell);
          if (value.includes(",") || value.includes('"') || value.includes("\n")) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(",")
      )
      .join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="financial_summary_${range}_${now.toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error generating financial summary:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
