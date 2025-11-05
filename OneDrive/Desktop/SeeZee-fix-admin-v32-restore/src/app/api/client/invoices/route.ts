import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/client/invoices
 * Returns client's invoices with payment URLs
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = session.user.email!;

    // Find organization
    const lead = await prisma.lead.findFirst({
      where: { email: userEmail },
      select: { organizationId: true },
    });

    if (!lead?.organizationId) {
      return NextResponse.json({
        invoices: [],
        totalSpent: 0,
        pendingAmount: 0,
        totalInvoices: 0,
      });
    }

    const invoices = await prisma.invoice.findMany({
      where: { organizationId: lead.organizationId },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        project: {
          select: {
            name: true,
          },
        },
      },
    });

    const totalSpent = invoices
      .filter((inv) => inv.status === "PAID")
      .reduce((sum, inv) => sum + Number(inv.total), 0);

    const pendingAmount = invoices
      .filter((inv) => inv.status === "SENT")
      .reduce((sum, inv) => sum + Number(inv.total), 0);

    return NextResponse.json({
      invoices: invoices.map((inv) => ({
        id: inv.id,
        number: inv.number || inv.id.slice(0, 8),
        total: inv.total,
        status: inv.status,
        createdAt: inv.createdAt,
        dueDate: inv.dueDate,
        paidAt: inv.paidAt,
        project: inv.project,
        payUrl:
          inv.status === "SENT" && inv.stripeInvoiceId
            ? `https://invoice.stripe.com/i/${inv.stripeInvoiceId}`
            : null,
      })),
      totalSpent,
      pendingAmount,
      totalInvoices: invoices.length,
    });
  } catch (error: any) {
    console.error("[GET /api/client/invoices]", error);
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
  }
}
