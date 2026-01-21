/**
 * Manual Transaction Recording API
 * For recording external payments and revenue
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { requireAdmin } from "@/lib/authz";

/**
 * POST /api/admin/transactions/manual
 * Record a manual transaction (payment or revenue)
 */
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const body = await req.json();
    const {
      type,
      amount,
      description,
      organizationId,
      source,
      referenceId,
      date,
    } = body;

    if (!amount || !description || !date) {
      return NextResponse.json(
        { error: "Missing required fields: amount, description, date" },
        { status: 400 }
      );
    }

    // Convert amount to number
    const amountValue = typeof amount === "number" ? amount : parseFloat(amount);

    if (isNaN(amountValue) || amountValue <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    if (type === "payment") {
      // Create a manual invoice and payment entry
      // First create a manual invoice
      const invoiceNumber = `MANUAL-${Date.now()}`;
      
      const invoice = await db.invoice.create({
        data: {
          number: invoiceNumber,
          title: description,
          description: `Manual entry: ${description}`,
          total: amountValue,
          currency: "USD",
          status: "PAID",
          paidAt: new Date(date),
          sentAt: new Date(date),
          dueDate: new Date(date),
          organizationId: organizationId || null,
          items: {
            create: {
              description: description,
              quantity: 1,
              rate: amountValue,
              amount: amountValue,
            },
          },
        },
      });

      // Create payment record
      const payment = await db.payment.create({
        data: {
          amount: amountValue,
          status: "COMPLETED",
          method: source || "manual",
          stripePaymentId: referenceId || null,
          invoiceId: invoice.id,
          processedAt: new Date(date),
        },
      });

      return NextResponse.json({
        success: true,
        type: "payment",
        invoice,
        payment,
      });
    } else if (type === "revenue") {
      // For non-invoice revenue, still create a payment record
      // But mark it as revenue-only
      const payment = await db.payment.create({
        data: {
          amount: amountValue,
          status: "COMPLETED",
          method: source || "manual",
          stripePaymentId: referenceId || null,
          invoiceId: null, // No invoice for direct revenue
          processedAt: new Date(date),
        },
      });

      return NextResponse.json({
        success: true,
        type: "revenue",
        payment,
      });
    } else {
      return NextResponse.json(
        { error: "Invalid transaction type. Must be 'payment' or 'revenue'" },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("[POST /api/admin/transactions/manual]", error);
    return NextResponse.json(
      { error: error.message || "Failed to record transaction" },
      { status: 500 }
    );
  }
}
