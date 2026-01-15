/**
 * Individual Expense API
 * Update and delete operations for single expenses
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { requireAdmin } from "@/lib/authz";

// GET - Fetch single expense
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const expense = await db.businessExpense.findUnique({
      where: { id },
    });

    if (!expense) {
      return NextResponse.json(
        { error: "Expense not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ expense });
  } catch (error: any) {
    console.error("Error fetching expense:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch expense" },
      { status: 500 }
    );
  }
}

// PATCH - Update expense
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const data = await request.json();

    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.amount !== undefined) updateData.amount = Math.round(data.amount * 100);
    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.status !== undefined) {
      updateData.status = data.status;
      if (data.status === "PAID" && !data.paidAt) {
        updateData.paidAt = new Date();
      }
    }
    if (data.vendor !== undefined) updateData.vendor = data.vendor;
    if (data.isRecurring !== undefined) updateData.isRecurring = data.isRecurring;
    if (data.frequency !== undefined) updateData.frequency = data.frequency;
    if (data.nextDueDate !== undefined) {
      updateData.nextDueDate = data.nextDueDate ? new Date(data.nextDueDate) : null;
    }
    if (data.expenseDate !== undefined) {
      updateData.expenseDate = new Date(data.expenseDate);
    }
    if (data.paidAt !== undefined) {
      updateData.paidAt = data.paidAt ? new Date(data.paidAt) : null;
    }
    if (data.receiptUrl !== undefined) updateData.receiptUrl = data.receiptUrl;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.tags !== undefined) updateData.tags = data.tags;

    const expense = await db.businessExpense.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ expense });
  } catch (error: any) {
    console.error("Error updating expense:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update expense" },
      { status: 500 }
    );
  }
}

// DELETE - Remove expense
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    await db.businessExpense.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting expense:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete expense" },
      { status: 500 }
    );
  }
}
