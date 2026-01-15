/**
 * Bank Transactions API
 * View and manage synced bank transactions
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { requireAdmin } from "@/lib/authz";

/**
 * GET /api/admin/bank/transactions
 * List bank transactions with optional filtering
 */
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get('accountId');
    const reconciled = searchParams.get('reconciled');
    const isIncome = searchParams.get('isIncome');
    const limit = parseInt(searchParams.get('limit') || '100');

    const where: any = {};

    if (accountId) {
      where.bankAccountId = accountId;
    }

    if (reconciled !== null && reconciled !== undefined) {
      where.isReconciled = reconciled === 'true';
    }

    if (isIncome !== null && isIncome !== undefined) {
      where.isIncome = isIncome === 'true';
    }

    const transactions = await db.bankTransaction.findMany({
      where,
      include: {
        bankAccount: {
          select: {
            institutionName: true,
            accountName: true,
            accountMask: true,
          },
        },
        matchedInvoice: {
          select: {
            id: true,
            number: true,
            title: true,
            total: true,
          },
        },
        matchedExpense: {
          select: {
            id: true,
            name: true,
            amount: true,
            category: true,
          },
        },
      },
      orderBy: { date: 'desc' },
      take: limit,
    });

    // Calculate summary stats
    const stats = {
      total: transactions.length,
      reconciled: transactions.filter(t => t.isReconciled).length,
      unreconciled: transactions.filter(t => !t.isReconciled).length,
      totalIncome: transactions
        .filter(t => t.isIncome)
        .reduce((sum, t) => sum + Number(t.amount), 0),
      totalExpenses: transactions
        .filter(t => !t.isIncome)
        .reduce((sum, t) => sum + Number(t.amount), 0),
    };

    return NextResponse.json({
      transactions: transactions.map(tx => ({
        id: tx.id,
        plaidTransactionId: tx.plaidTransactionId,
        amount: Number(tx.amount),
        isIncome: tx.isIncome,
        description: tx.description,
        merchantName: tx.merchantName,
        category: tx.category,
        date: tx.date.toISOString(),
        isReconciled: tx.isReconciled,
        bankAccount: tx.bankAccount,
        matchedInvoice: tx.matchedInvoice ? {
          id: tx.matchedInvoice.id,
          number: tx.matchedInvoice.number,
          title: tx.matchedInvoice.title,
          total: Number(tx.matchedInvoice.total),
        } : null,
        matchedExpense: tx.matchedExpense ? {
          id: tx.matchedExpense.id,
          name: tx.matchedExpense.name,
          amount: Number(tx.matchedExpense.amount),
          category: tx.matchedExpense.category,
        } : null,
        createdAt: tx.createdAt.toISOString(),
      })),
      stats,
    });
  } catch (error: any) {
    console.error("[GET /api/admin/bank/transactions]", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch bank transactions" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/bank/transactions
 * Reconcile bank transaction with invoice or expense
 */
export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin();

    const { transactionId, matchType, matchId } = await req.json();

    if (!transactionId) {
      return NextResponse.json(
        { error: "transactionId is required" },
        { status: 400 }
      );
    }

    const updateData: any = {
      isReconciled: true,
    };

    if (matchType === 'invoice' && matchId) {
      updateData.matchedInvoiceId = matchId;
    } else if (matchType === 'expense' && matchId) {
      updateData.matchedExpenseId = matchId;
    }

    const transaction = await db.bankTransaction.update({
      where: { id: transactionId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      transaction: {
        id: transaction.id,
        isReconciled: transaction.isReconciled,
        matchedInvoiceId: transaction.matchedInvoiceId,
        matchedExpenseId: transaction.matchedExpenseId,
      },
    });
  } catch (error: any) {
    console.error("[PATCH /api/admin/bank/transactions]", error);
    return NextResponse.json(
      { error: error.message || "Failed to reconcile transaction" },
      { status: 500 }
    );
  }
}
