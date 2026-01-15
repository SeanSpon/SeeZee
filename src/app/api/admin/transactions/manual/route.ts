/**
 * API Route: Record Manual Transaction
 * Allows admins to log external payments/revenue not tied to invoices
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/requireRole";
import { db } from "@/server/db";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

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

    // Validate required fields
    if (!amount || !description || !date) {
      return NextResponse.json(
        { error: "Amount, description, and date are required" },
        { status: 400 }
      );
    }

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization is required for manual transactions" },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than 0" },
        { status: 400 }
      );
    }

    // Create a manual invoice first (as a placeholder for the manual transaction)
    // Then create the payment linked to it
    const orgId = organizationId as string; // Already validated above
    const manualInvoice = await db.invoice.create({
      data: {
        number: `MANUAL-${Date.now()}`,
        title: "Manual Transaction",
        description: description,
        amount,
        tax: 0,
        total: amount,
        status: "PAID",
        dueDate: new Date(date),
        paidAt: new Date(date),
        createdAt: new Date(date),
        organization: { connect: { id: orgId } },
      },
    });

    const payment = await db.payment.create({
      data: {
        amount,
        currency: "USD",
        status: "COMPLETED",
        method: source || "other",
        invoiceId: manualInvoice.id,
        stripePaymentId: referenceId || undefined,
        processedAt: new Date(date),
        createdAt: new Date(date),
      },
    });

    // If there's an organization, log activity
    if (organizationId) {
      await db.activity.create({
        data: {
          type: "PROJECT_UPDATED",
          title: "Manual Payment Recorded",
          description: `Manual transaction of $${(amount / 100).toFixed(2)} recorded`,
          userId: user.id,
          metadata: {
            paymentId: payment.id,
            invoiceId: manualInvoice.id,
            amount,
            source,
            manual: true,
            action: "manual_payment_recorded",
          } as any,
        },
      }).catch(() => {
        // Activity logging is optional, don't fail the request
      });
    }

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        amount: payment.amount,
        date: payment.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Error recording manual transaction:", error);
    return NextResponse.json(
      { error: error.message || "Failed to record transaction" },
      { status: 500 }
    );
  }
}
