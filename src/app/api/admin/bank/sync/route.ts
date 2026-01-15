/**
 * Bank Sync API
 * Manually trigger transaction sync from bank
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { requireAdmin } from "@/lib/authz";

/**
 * POST /api/admin/bank/sync
 * Sync transactions from connected bank account
 */
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const { accountId } = await req.json();

    if (!accountId) {
      return NextResponse.json(
        { error: "accountId is required" },
        { status: 400 }
      );
    }

    // Get bank account
    const bankAccount = await db.bankAccount.findUnique({
      where: { id: accountId },
    });

    if (!bankAccount || !bankAccount.isActive) {
      return NextResponse.json(
        { error: "Bank account not found or inactive" },
        { status: 404 }
      );
    }

    // Check if Plaid is configured
    if (!process.env.PLAID_CLIENT_ID || !process.env.PLAID_SECRET) {
      return NextResponse.json(
        { error: "Bank integration not configured" },
        { status: 503 }
      );
    }

    const PlaidClient = await import('plaid').then(m => m.PlaidApi);
    const { Configuration, PlaidEnvironments } = await import('plaid');

    const configuration = new Configuration({
      basePath: process.env.PLAID_ENV === 'production' 
        ? PlaidEnvironments.production 
        : PlaidEnvironments.sandbox,
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
          'PLAID-SECRET': process.env.PLAID_SECRET,
        },
      },
    });

    const plaidClient = new PlaidClient(configuration);

    // Get updated balance
    const balanceResponse = await plaidClient.accountsBalanceGet({
      access_token: bankAccount.plaidAccessToken,
    });

    const currentBalance = balanceResponse.data.accounts[0]?.balances?.current || 0;
    const availableBalance = balanceResponse.data.accounts[0]?.balances?.available || 0;

    // Get transactions from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const transactionsResponse = await plaidClient.transactionsGet({
      access_token: bankAccount.plaidAccessToken,
      start_date: thirtyDaysAgo.toISOString().split('T')[0],
      end_date: new Date().toISOString().split('T')[0],
    });

    const transactions = transactionsResponse.data.transactions;

    // Save transactions to database
    let newTransactions = 0;
    let updatedTransactions = 0;

    for (const tx of transactions) {
      const result = await db.bankTransaction.upsert({
        where: { plaidTransactionId: tx.transaction_id },
        update: {
          amount: Math.abs(tx.amount),
          isIncome: tx.amount < 0, // Plaid uses negative for income
          description: tx.name,
          merchantName: tx.merchant_name,
          category: tx.category?.[0] || 'Other',
          date: new Date(tx.date),
        },
        create: {
          bankAccountId: accountId,
          plaidTransactionId: tx.transaction_id,
          amount: Math.abs(tx.amount),
          isIncome: tx.amount < 0,
          description: tx.name,
          merchantName: tx.merchant_name,
          category: tx.category?.[0] || 'Other',
          date: new Date(tx.date),
          isReconciled: false,
        },
      });

      if (result.createdAt === result.updatedAt) {
        newTransactions++;
      } else {
        updatedTransactions++;
      }
    }

    // Update account balance and last synced time
    await db.bankAccount.update({
      where: { id: accountId },
      data: {
        currentBalance,
        availableBalance,
        lastSyncedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      currentBalance,
      availableBalance,
      newTransactions,
      updatedTransactions,
      totalTransactions: transactions.length,
      lastSyncedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[POST /api/admin/bank/sync]", error);
    return NextResponse.json(
      { error: error.message || "Failed to sync bank transactions" },
      { status: 500 }
    );
  }
}
