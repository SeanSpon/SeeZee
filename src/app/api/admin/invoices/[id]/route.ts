/**
 * Individual Invoice Management API (Admin)
 * CRUD operations for single invoices
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { requireAdmin } from "@/lib/authz";

/**
 * GET /api/admin/invoices/[id]
 * Get single invoice details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const invoice = await db.invoice.findUnique({
      where: { id },
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
            method: true,
            stripePaymentId: true,
            createdAt: true,
            processedAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    // Calculate subtotal from items
    const subtotal = invoice.items.reduce((sum, item) => sum + Number(item.amount), 0);
    const total = Number(invoice.total);
    const tax = total - subtotal;
    
    return NextResponse.json({
      invoice: {
        ...invoice,
        amount: subtotal,
        tax: tax,
        total: total,
        items: invoice.items.map((item) => ({
          ...item,
          rate: Number(item.rate),
          amount: Number(item.amount),
        })),
        payments: invoice.payments.map((p) => ({
          ...p,
          amount: Number(p.amount),
        })),
      },
    });
  } catch (error: any) {
    console.error("[GET /api/admin/invoices/[id]]", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch invoice" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/invoices/[id]
 * Update invoice details
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const data = await request.json();

    // Check if invoice exists
    const existingInvoice = await db.invoice.findUnique({
      where: { id },
      select: { id: true, status: true, paidAt: true, items: true },
    });

    if (!existingInvoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    const updateData: any = {};

    // Update basic fields
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) {
      updateData.status = data.status;
      
      // Auto-set timestamps based on status
      if (data.status === "PAID" && !existingInvoice.paidAt) {
        updateData.paidAt = new Date();
      }
      if (data.status === "SENT" && !updateData.sentAt) {
        updateData.sentAt = new Date();
      }
    }
    if (data.dueDate !== undefined) {
      updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    }
    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.notes !== undefined) updateData.notes = data.notes;

    // Update amounts if items are provided
    if (data.items && Array.isArray(data.items) && data.items.length > 0) {
      // Delete existing items first
      await db.invoiceItem.deleteMany({
        where: { invoiceId: id },
      });

      // Calculate new amounts
      const amount = data.items.reduce(
        (sum: number, item: any) => sum + (item.quantity * item.rate),
        0
      );
      const tax = data.tax || 0;
      const total = amount + tax;

      updateData.amount = amount;
      updateData.tax = tax;
      updateData.total = total;

      // Create new items
      updateData.items = {
        create: data.items.map((item: any) => ({
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.quantity * item.rate,
        })),
      };
    } else if (data.amount !== undefined || data.tax !== undefined || data.total !== undefined) {
      // Manual amount update
      if (data.amount !== undefined) updateData.amount = data.amount;
      if (data.tax !== undefined) updateData.tax = data.tax;
      if (data.total !== undefined) updateData.total = data.total;
    }

    const invoice = await db.invoice.update({
      where: { id },
      data: updateData,
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
        payments: true,
      },
    });

    // Calculate subtotal from items
    const subtotal = invoice!.items.reduce((sum, item) => sum + Number(item.amount), 0);
    const total = Number(invoice!.total);
    const tax = total - subtotal;
    
    return NextResponse.json({
      invoice: {
        ...invoice,
        amount: subtotal,
        tax: tax,
        total: total,
      },
    });
  } catch (error: any) {
    console.error("[PATCH /api/admin/invoices/[id]]", error);
    return NextResponse.json(
      { error: error.message || "Failed to update invoice" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/invoices/[id]
 * Delete invoice and all related items
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    // Check if invoice exists
    const invoice = await db.invoice.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    // Delete invoice items first
    await db.invoiceItem.deleteMany({
      where: { invoiceId: id },
    });

    // Delete payments (if any)
    await db.payment.deleteMany({
      where: { invoiceId: id },
    });

    // Delete invoice
    await db.invoice.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Invoice deleted successfully",
    });
  } catch (error: any) {
    console.error("[DELETE /api/admin/invoices/[id]]", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete invoice" },
      { status: 500 }
    );
  }
}
