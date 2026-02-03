import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { getCurrentUser } from "@/lib/auth/requireRole";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const ADMIN_ROLES = ["CEO", "CFO", "ADMIN", "DEV", "FRONTEND", "BACKEND"];
    if (!user || !ADMIN_ROLES.includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const range = searchParams.get("range") || "all";

    // Calculate date filter
    let dateFilter = {};
    const now = new Date();
    if (range === "month") {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateFilter = { expenseDate: { gte: thirtyDaysAgo } };
    } else if (range === "quarter") {
      const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      dateFilter = { expenseDate: { gte: ninetyDaysAgo } };
    } else if (range === "year") {
      const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      dateFilter = { expenseDate: { gte: oneYearAgo } };
    }

    // Fetch expenses
    const expenses = await db.businessExpense.findMany({
      where: dateFilter,
      orderBy: { expenseDate: "desc" },
    });

    // Convert to CSV
    const headers = [
      "Expense ID",
      "Date",
      "Category",
      "Description",
      "Amount",
      "Vendor",
      "Receipt URL",
      "Is Recurring",
      "Created Date",
    ];

    const rows = expenses.map(expense => {
      return [
        expense.id,
        expense.expenseDate.toISOString().split('T')[0],
        expense.category,
        (expense.description || "").replace(/"/g, '""'),
        Number(expense.amount).toFixed(2),
        expense.vendor || "",
        expense.receiptUrl || "",
        expense.isRecurring ? "Yes" : "No",
        expense.createdAt.toISOString(),
      ];
    });

    const csv = [
      headers.join(","),
      ...rows.map(row => 
        row.map(cell => {
          const value = String(cell);
          if (value.includes(",") || value.includes('"') || value.includes("\n")) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(",")
      ),
    ].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="expenses_${range}_${now.toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error generating expenses report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
