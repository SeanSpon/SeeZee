/**
 * Bank Token Exchange API
 * Exchange public token for access token after successful bank connection
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { requireAdmin } from "@/lib/authz";

/**
 * POST /api/admin/bank/exchange
 * Exchange public token for access token and save bank account
 */
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const { public_token, institution_id, institution_name, accounts } = await req.json();

    if (!public_token) {
      return NextResponse.json(
        { error: "public_token is required" },
        { status: 400 }
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

    // Exchange public token for access token
    const response = await plaidClient.itemPublicTokenExchange({
      public_token,
    });

    const access_token = response.data.access_token;
    const item_id = response.data.item_id;

    // Get account details
    const accountsResponse = await plaidClient.accountsGet({
      access_token,
    });

    // Save connected bank account to database
    const connectedAccount = await db.bankAccount.create({
      data: {
        plaidAccessToken: access_token,
        plaidItemId: item_id,
        institutionId: institution_id,
        institutionName: institution_name,
        accountName: accountsResponse.data.accounts[0]?.name || 'Primary Account',
        accountMask: accountsResponse.data.accounts[0]?.mask || null,
        accountType: accountsResponse.data.accounts[0]?.type || 'checking',
        accountSubtype: accountsResponse.data.accounts[0]?.subtype || null,
        currentBalance: accountsResponse.data.accounts[0]?.balances?.current || 0,
        availableBalance: accountsResponse.data.accounts[0]?.balances?.available || 0,
        currency: accountsResponse.data.accounts[0]?.balances?.iso_currency_code || 'USD',
        isActive: true,
        lastSyncedAt: new Date(),
      },
    });

    // Initial transaction sync
    try {
      await syncTransactions(plaidClient, access_token, connectedAccount.id);
    } catch (syncError) {
      console.error("Initial sync failed, will retry later:", syncError);
    }

    return NextResponse.json({
      success: true,
      account: {
        id: connectedAccount.id,
        institutionName: connectedAccount.institutionName,
        accountName: connectedAccount.accountName,
        accountMask: connectedAccount.accountMask,
        currentBalance: connectedAccount.currentBalance,
      },
    });
  } catch (error: any) {
    console.error("[POST /api/admin/bank/exchange]", error);
    return NextResponse.json(
      { error: error.message || "Failed to connect bank account" },
      { status: 500 }
    );
  }
}

// Helper function to sync transactions
async function syncTransactions(plaidClient: any, access_token: string, bankAccountId: string) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const transactionsResponse = await plaidClient.transactionsGet({
    access_token,
    start_date: thirtyDaysAgo.toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
  });

  const transactions = transactionsResponse.data.transactions;

  // Save transactions to database
  for (const tx of transactions) {
    await db.bankTransaction.upsert({
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
        bankAccountId,
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
  }

  return transactions.length;
}
