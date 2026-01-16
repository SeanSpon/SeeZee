import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/server/db";
import { requireAdmin } from "@/lib/authz";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    // Get query params
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const limit = searchParams.get("limit");

    // Build where clause
    const where: any = {};
    if (status) {
      where.status = status;
    }

    // Fetch invoices
    const invoices = await db.invoice.findMany({
      where,
      ...(limit && { take: parseInt(limit, 10) }),
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        items: true,
        payments: {
          select: {
            id: true,
            amount: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate stats
    const stats = {
      total: await db.invoice.count({ where }),
      draft: await db.invoice.count({ where: { ...where, status: "DRAFT" } }),
      sent: await db.invoice.count({ where: { ...where, status: "SENT" } }),
      paid: await db.invoice.count({ where: { ...where, status: "PAID" } }),
      overdue: await db.invoice.count({ where: { ...where, status: "OVERDUE" } }),
      totalAmount: await db.invoice.aggregate({
        where: { ...where, status: "PAID" },
        _sum: { total: true },
      }),
    };

    return NextResponse.json({
      invoices: invoices.map((i) => {
        // Calculate subtotal from items
        const subtotal = i.items.reduce((sum, item) => sum + Number(item.amount), 0);
        const total = Number(i.total);
        const tax = total - subtotal;
        
        return {
          id: i.id,
          number: i.number,
          title: i.title,
          description: i.description,
          status: i.status,
          amount: subtotal,
          tax: tax,
          total: total,
          currency: i.currency,
          dueDate: i.dueDate,
          paidAt: i.paidAt,
          sentAt: i.sentAt,
          createdAt: i.createdAt,
          updatedAt: i.updatedAt,
          organization: i.organization,
          project: i.project,
          items: i.items.map((item) => ({
            id: item.id,
            description: item.description,
            quantity: item.quantity,
            rate: Number(item.rate),
            amount: Number(item.amount),
          })),
          payments: i.payments.map((p) => ({
            id: p.id,
            amount: Number(p.amount),
            status: p.status,
            createdAt: p.createdAt,
          })),
        };
      }),
      stats: {
        ...stats,
        totalAmount: Number(stats.totalAmount._sum.total || 0),
      },
    });
  } catch (error) {
    console.error("[GET /api/admin/invoices]", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/invoices
 * Create a new invoice (admin only)
 */
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const body = await req.json();
    const {
      organizationId,
      projectId,
      title,
      description,
      items,
      amount,
      tax,
      total,
      dueDate,
      currency = "USD",
      invoiceType = "custom",
    } = body;

    if (!organizationId || !title || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields: organizationId, title, items" },
        { status: 400 }
      );
    }

    // Calculate amounts from items if not provided
    const calculatedAmount = items.reduce(
      (sum: number, item: any) => sum + (item.quantity * item.rate),
      0
    );
    const calculatedTax = tax || 0;
    const calculatedTotal = total || (calculatedAmount + calculatedTax);

    // Generate invoice number
    const invoiceCount = await db.invoice.count();
    const invoiceNumber = `INV-${(invoiceCount + 1).toString().padStart(5, '0')}`;

    // Create invoice
    const invoice = await db.invoice.create({
      data: {
        number: invoiceNumber,
        title,
        description: description || null,
        total: calculatedTotal,
        currency,
        status: "DRAFT",
        dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days default
        organizationId,
        projectId: projectId || null,
        items: {
          create: items.map((item: any) => ({
            description: item.description,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.quantity * item.rate,
          })),
        },
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        items: true,
      },
    });

    // Calculate subtotal from items
    const invoiceSubtotal = invoice.items.reduce((sum, item) => sum + Number(item.amount), 0);
    const invoiceTotal = Number(invoice.total);
    const invoiceTax = invoiceTotal - invoiceSubtotal;
    
    return NextResponse.json({
      invoice: {
        ...invoice,
        amount: invoiceSubtotal,
        tax: invoiceTax,
        total: invoiceTotal,
      },
    });
  } catch (error: any) {
    console.error("[POST /api/admin/invoices]", error);
    return NextResponse.json(
      { error: error.message || "Failed to create invoice" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/invoices
 * Bulk update invoices (admin only)
 */
export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin();

    const body = await req.json();
    const { invoiceIds, status } = body;

    if (!invoiceIds || !Array.isArray(invoiceIds) || invoiceIds.length === 0) {
      return NextResponse.json(
        { error: "invoiceIds array is required" },
        { status: 400 }
      );
    }

    if (!status) {
      return NextResponse.json(
        { error: "status is required" },
        { status: 400 }
      );
    }

    // Update multiple invoices
    const result = await db.invoice.updateMany({
      where: {
        id: {
          in: invoiceIds,
        },
      },
      data: {
        status,
        ...(status === "PAID" ? { paidAt: new Date() } : {}),
        ...(status === "SENT" ? { sentAt: new Date() } : {}),
      },
    });

    return NextResponse.json({
      updated: result.count,
      status,
    });
  } catch (error: any) {
    console.error("[PATCH /api/admin/invoices]", error);
    return NextResponse.json(
      { error: error.message || "Failed to update invoices" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/invoices
 * Bulk delete invoices (admin only)
 */
export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();

    const body = await req.json();
    const { invoiceIds } = body;

    if (!invoiceIds || !Array.isArray(invoiceIds) || invoiceIds.length === 0) {
      return NextResponse.json(
        { error: "invoiceIds array is required" },
        { status: 400 }
      );
    }

    // Delete invoice items first (due to foreign key constraints)
    await db.invoiceItem.deleteMany({
      where: {
        invoiceId: {
          in: invoiceIds,
        },
      },
    });

    // Delete invoices
    const result = await db.invoice.deleteMany({
      where: {
        id: {
          in: invoiceIds,
        },
      },
    });

    return NextResponse.json({
      deleted: result.count,
    });
  } catch (error: any) {
    console.error("[DELETE /api/admin/invoices]", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete invoices" },
      { status: 500 }
    );
  }
}

