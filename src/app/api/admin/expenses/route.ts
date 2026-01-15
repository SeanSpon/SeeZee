/**
 * Business Expenses API
 * CRUD operations for tracking business expenses
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { requireAdmin } from "@/lib/authz";

// GET - Fetch all expenses with filtering
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const vendor = searchParams.get("vendor");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const limit = parseInt(searchParams.get("limit") || "100");

    const where: any = {};

    if (category) {
      where.category = category;
    }

    if (status) {
      where.status = status;
    }

    if (vendor) {
      where.vendor = { contains: vendor, mode: "insensitive" };
    }

    if (startDate || endDate) {
      where.expenseDate = {};
      if (startDate) {
        where.expenseDate.gte = new Date(startDate);
      }
      if (endDate) {
        where.expenseDate.lte = new Date(endDate);
      }
    }

    const expenses = await db.businessExpense.findMany({
      where,
      orderBy: { expenseDate: "desc" },
      take: limit,
    });

    // Calculate totals
    const totalExpenses = expenses.reduce((sum: number, e: any) => sum + e.amount, 0);
    
    // Group by category
    const byCategory = expenses.reduce((acc: Record<string, number>, e: any) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {});

    // Group by vendor
    const byVendor = expenses.reduce((acc: Record<string, number>, e: any) => {
      const vendorKey = e.vendor || "Unknown";
      acc[vendorKey] = (acc[vendorKey] || 0) + e.amount;
      return acc;
    }, {});

    return NextResponse.json({
      expenses,
      totalCount: expenses.length,
      totalAmount: totalExpenses,
      byCategory,
      byVendor,
    });
  } catch (error: any) {
    console.error("Error fetching expenses:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch expenses" },
      { status: 500 }
    );
  }
}

// POST - Create new expense
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const data = await request.json();

    // Validate required fields
    if (!data.name || !data.amount || !data.category) {
      return NextResponse.json(
        { error: "Missing required fields: name, amount, category" },
        { status: 400 }
      );
    }

    const expense = await db.businessExpense.create({
      data: {
        name: data.name,
        description: data.description || null,
        amount: Math.round(data.amount * 100), // Convert to cents
        currency: data.currency || "USD",
        category: data.category,
        status: data.status || "PAID",
        vendor: data.vendor || null,
        isRecurring: data.isRecurring || false,
        frequency: data.isRecurring ? (data.frequency || null) : null,
        nextDueDate: data.nextDueDate ? new Date(data.nextDueDate) : null,
        expenseDate: data.expenseDate ? new Date(data.expenseDate) : new Date(),
        paidAt: data.status === "PAID" ? new Date() : null,
        receiptUrl: data.receiptUrl || null,
        notes: data.notes || null,
        tags: data.tags || [],
      },
    });

    return NextResponse.json({ expense });
  } catch (error: any) {
    console.error("Error creating expense:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create expense" },
      { status: 500 }
    );
  }
}
