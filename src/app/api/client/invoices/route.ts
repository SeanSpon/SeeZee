import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { handleCors, addCorsHeaders } from "@/lib/cors";
import { getClientAccessContext } from "@/lib/client-access";
import type { Prisma } from "@prisma/client";
import { InvoiceStatus } from "@prisma/client";

/**
 * OPTIONS /api/client/invoices
 * Handle CORS preflight
 */
export async function OPTIONS(req: NextRequest) {
  return handleCors(req) || new NextResponse(null, { status: 200 });
}

/**
 * GET /api/client/invoices
 * Returns client's invoices with payment URLs
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      const response = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      return addCorsHeaders(response, req.headers.get("origin"));
    }

    const identity = {
      userId: session.user.id,
      email: session.user.email,
    };
    const { organizationIds, leadProjectIds } = await getClientAccessContext(identity);

    if (organizationIds.length === 0 && leadProjectIds.length === 0) {
      const response = NextResponse.json({
        invoices: [],
        totalSpent: 0,
        pendingAmount: 0,
        totalInvoices: 0,
      });
      return addCorsHeaders(response, req.headers.get("origin"));
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const limit = searchParams.get("limit");

    const baseFilters: Prisma.InvoiceWhereInput[] = [];

    if (organizationIds.length > 0) {
      baseFilters.push({
        organizationId: {
          in: organizationIds,
        },
      });
    }

    if (leadProjectIds.length > 0) {
      baseFilters.push({
        projectId: {
          in: leadProjectIds,
        },
      });
    }

    const invoiceWhere: Prisma.InvoiceWhereInput = {
      OR: baseFilters,
    };

    if (status && Object.values(InvoiceStatus).includes(status as InvoiceStatus)) {
      invoiceWhere.status = status as InvoiceStatus;
    }

    const invoices = await prisma.invoice.findMany({
      where: invoiceWhere,
      ...(limit && { take: parseInt(limit, 10) }),
      orderBy: { createdAt: "desc" },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        items: {
          select: {
            id: true,
            description: true,
            quantity: true,
            rate: true,
            amount: true,
          },
        },
        payments: {
          select: {
            id: true,
            amount: true,
            status: true,
            method: true,
            createdAt: true,
            processedAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    // Calculate stats
    const totalSpent = invoices
      .filter((inv) => inv.status === "PAID")
      .reduce((sum, inv) => sum + Number(inv.total), 0);

    const pendingAmount = invoices
      .filter((inv) => inv.status === "SENT" || inv.status === "OVERDUE")
      .reduce((sum, inv) => sum + Number(inv.total), 0);

    const overdueAmount = invoices
      .filter((inv) => inv.status === "OVERDUE")
      .reduce((sum, inv) => sum + Number(inv.total), 0);

    const stats = {
      total: invoices.length,
      paid: invoices.filter((inv) => inv.status === "PAID").length,
      sent: invoices.filter((inv) => inv.status === "SENT").length,
      overdue: invoices.filter((inv) => inv.status === "OVERDUE").length,
      draft: invoices.filter((inv) => inv.status === "DRAFT").length,
    };

    const response = NextResponse.json({
      invoices: invoices.map((inv) => ({
        id: inv.id,
        number: inv.number || inv.id.slice(0, 8),
        title: inv.title,
        description: inv.description,
        amount: Number(inv.amount),
        tax: Number(inv.tax || 0),
        total: Number(inv.total),
        currency: inv.currency,
        status: inv.status,
        createdAt: inv.createdAt,
        updatedAt: inv.updatedAt,
        dueDate: inv.dueDate,
        paidAt: inv.paidAt,
        sentAt: inv.sentAt,
        project: inv.project,
        items: inv.items.map((item) => ({
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          rate: Number(item.rate),
          amount: Number(item.amount),
        })),
        payments: inv.payments.map((p) => ({
          id: p.id,
          amount: Number(p.amount),
          status: p.status,
          method: p.method,
          createdAt: p.createdAt,
          processedAt: p.processedAt,
        })),
        payUrl:
          inv.status === "SENT" && inv.stripeInvoiceId
            ? `https://invoice.stripe.com/i/${inv.stripeInvoiceId}`
            : null,
      })),
      stats: {
        ...stats,
        totalSpent,
        pendingAmount,
        overdueAmount,
      },
    });
    return addCorsHeaders(response, req.headers.get("origin"));
  } catch (error: any) {
    console.error("[GET /api/client/invoices]", error);
    const response = NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
    return addCorsHeaders(response, req.headers.get("origin"));
  }
}
