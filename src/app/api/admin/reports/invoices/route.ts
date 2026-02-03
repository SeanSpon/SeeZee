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

    // Fetch invoices
    const invoices = await db.invoice.findMany({
      where: dateFilter,
      include: {
        organization: { select: { name: true, email: true } },
        project: { select: { name: true } },
        items: true,
        payments: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Convert to CSV
    const headers = [
      "Invoice Number",
      "Client Name",
      "Client Email",
      "Project",
      "Title",
      "Description",
      "Subtotal",
      "Tax",
      "Total",
      "Status",
      "Issue Date",
      "Due Date",
      "Paid Date",
      "Payment Count",
      "Created Date",
    ];

    const rows = invoices.map(inv => {
      const subtotal = inv.items.reduce((sum, item) => sum + Number(item.amount), 0);
      const total = Number(inv.total);
      const tax = total - subtotal;

      return [
        inv.number || `INV-${inv.id.slice(0, 6)}`,
        inv.organization?.name || "Unknown",
        inv.organization?.email || "",
        inv.project?.name || "",
        inv.title || "",
        (inv.description || "").replace(/"/g, '""'),
        subtotal.toFixed(2),
        tax.toFixed(2),
        total.toFixed(2),
        inv.status,
        inv.createdAt.toISOString().split('T')[0],
        inv.dueDate ? inv.dueDate.toISOString().split('T')[0] : "",
        inv.paidAt ? inv.paidAt.toISOString().split('T')[0] : "",
        inv.payments.length,
        inv.createdAt.toISOString(),
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
        "Content-Disposition": `attachment; filename="invoices_${range}_${now.toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error generating invoices report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
