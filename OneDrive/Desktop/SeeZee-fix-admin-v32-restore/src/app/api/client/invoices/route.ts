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
      return NextResponse.json({ items: [] });
    }

    const invoices = await prisma.invoice.findMany({
      where: { organizationId: lead.organizationId },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        number: true,
        title: true,
        amount: true,
        total: true,
        currency: true,
        status: true,
        dueDate: true,
        paidAt: true,
        stripeInvoiceId: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      items: invoices.map((inv) => ({
        id: inv.id,
        number: inv.number,
        title: inv.title,
        amount: inv.total,
        currency: inv.currency,
        status: inv.status,
        dueDate: inv.dueDate,
        paidAt: inv.paidAt,
        // Add payUrl for unpaid invoices (Stripe hosted page)
        payUrl:
          inv.status === "SENT" && inv.stripeInvoiceId
            ? `https://invoice.stripe.com/i/${inv.stripeInvoiceId}`
            : null,
        pdfUrl: null, // TODO: implement PDF generation
        createdAt: inv.createdAt,
      })),
    });
  } catch (error: any) {
    console.error("[GET /api/client/invoices]", error);
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
  }
}
