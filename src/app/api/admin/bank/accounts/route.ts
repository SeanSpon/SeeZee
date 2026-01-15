/**
 * Bank Accounts API
 * Manage connected bank accounts
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { requireAdmin } from "@/lib/authz";

/**
 * GET /api/admin/bank/accounts
 * List all connected bank accounts
 */
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const accounts = await db.bankAccount.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            transactions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      accounts: accounts.map(account => ({
        id: account.id,
        institutionName: account.institutionName,
        accountName: account.accountName,
        accountMask: account.accountMask,
        accountType: account.accountType,
        currentBalance: Number(account.currentBalance),
        availableBalance: Number(account.availableBalance),
        currency: account.currency,
        lastSyncedAt: account.lastSyncedAt?.toISOString(),
        transactionCount: account._count.transactions,
        createdAt: account.createdAt.toISOString(),
      })),
    });
  } catch (error: any) {
    console.error("[GET /api/admin/bank/accounts]", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch bank accounts" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/bank/accounts
 * Disconnect a bank account
 */
export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();

    const { accountId } = await req.json();

    if (!accountId) {
      return NextResponse.json(
        { error: "accountId is required" },
        { status: 400 }
      );
    }

    // Mark account as inactive instead of deleting
    await db.bankAccount.update({
      where: { id: accountId },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      message: "Bank account disconnected successfully",
    });
  } catch (error: any) {
    console.error("[DELETE /api/admin/bank/accounts]", error);
    return NextResponse.json(
      { error: error.message || "Failed to disconnect bank account" },
      { status: 500 }
    );
  }
}
