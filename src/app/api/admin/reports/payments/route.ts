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

    // Fetch payments
    const payments = await db.payment.findMany({
      where: dateFilter,
      include: {
        invoice: {
          select: {
            number: true,
            title: true,
            organization: { select: { name: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Convert to CSV
    const headers = [
      "Payment ID",
      "Date",
      "Time",
      "Client Name",
      "Client Email",
      "Invoice Number",
      "Invoice Title",
      "Amount",
      "Payment Method",
      "Status",
      "Stripe Payment ID",
      "Is Manual Entry",
    ];

    const rows = payments.map(payment => {
      const isManual = payment.invoice?.number?.startsWith("MANUAL-");
      const date = new Date(payment.createdAt);

      return [
        payment.id,
        date.toISOString().split('T')[0],
        date.toTimeString().split(' ')[0],
        payment.invoice?.organization?.name || "No Client",
        payment.invoice?.organization?.email || "",
        isManual ? "Manual Entry" : (payment.invoice?.number || "N/A"),
        payment.invoice?.title || "External Transaction",
        Number(payment.amount).toFixed(2),
        payment.method || "N/A",
        payment.status,
        payment.stripePaymentId || "",
        isManual ? "Yes" : "No",
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
        "Content-Disposition": `attachment; filename="payments_${range}_${now.toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error generating payments report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
