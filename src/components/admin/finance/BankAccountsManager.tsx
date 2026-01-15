"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  FiPlus,
  FiRefreshCw,
  FiTrash2,
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";
import Script from "next/script";

interface BankAccount {
  id: string;
  institutionName: string;
  accountName: string;
  accountMask: string | null;
  accountType: string;
  currentBalance: number;
  availableBalance: number;
  currency: string;
  lastSyncedAt: string | null;
  transactionCount: number;
  createdAt: string;
}

const formatCurrency = (amount: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

export function BankAccountsManager() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [plaidReady, setPlaidReady] = useState(false);

  const fetchAccounts = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/bank/accounts');
      const data = await res.json();
      if (res.ok) {
        setAccounts(data.accounts);
      }
    } catch (error) {
      console.error('Failed to fetch bank accounts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleConnectBank = async () => {
    try {
      // Get link token from backend
      const res = await fetch('/api/admin/bank/connect', { method: 'POST' });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Failed to initialize bank connection');
        if (data.message) {
          alert(data.message);
        }
        return;
      }

      // Initialize Plaid Link
      if (typeof window !== 'undefined' && (window as any).Plaid) {
        const handler = (window as any).Plaid.create({
          token: data.link_token,
          onSuccess: async (public_token: string, metadata: any) => {
            // Exchange public token for access token
            const exchangeRes = await fetch('/api/admin/bank/exchange', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                public_token,
                institution_id: metadata.institution.institution_id,
                institution_name: metadata.institution.name,
                accounts: metadata.accounts,
              }),
            });

            if (exchangeRes.ok) {
              alert('Bank account connected successfully!');
              fetchAccounts();
            } else {
              const errorData = await exchangeRes.json();
              alert(errorData.error || 'Failed to connect bank account');
            }
          },
          onExit: (err: any, metadata: any) => {
            if (err) {
              console.error('Plaid Link error:', err);
            }
          },
        });

        handler.open();
      } else {
        alert('Plaid SDK not loaded. Please refresh and try again.');
      }
    } catch (error) {
      console.error('Failed to connect bank:', error);
      alert('Failed to connect bank account');
    }
  };

  const handleSync = async (accountId: string) => {
    setSyncing(accountId);
    try {
      const res = await fetch('/api/admin/bank/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(`Synced successfully! ${data.newTransactions} new transactions.`);
        fetchAccounts();
      } else {
        alert(data.error || 'Failed to sync transactions');
      }
    } catch (error) {
      console.error('Sync failed:', error);
      alert('Failed to sync transactions');
    } finally {
      setSyncing(null);
    }
  };

  const handleDisconnect = async (accountId: string, institutionName: string) => {
    if (!confirm(`Are you sure you want to disconnect ${institutionName}?`)) {
      return;
    }

    try {
      const res = await fetch('/api/admin/bank/accounts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId }),
      });

      if (res.ok) {
        alert('Bank account disconnected');
        fetchAccounts();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to disconnect bank account');
      }
    } catch (error) {
      console.error('Disconnect failed:', error);
      alert('Failed to disconnect bank account');
    }
  };

  return (
    <>
      {/* Load Plaid Link SDK */}
      <Script
        src="https://cdn.plaid.com/link/v2/stable/link-initialize.js"
        onLoad={() => setPlaidReady(true)}
      />

      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Bank Accounts</h1>
            <p className="text-gray-400 mt-1">
              Connect and manage your business bank accounts
            </p>
          </div>
          <button
            onClick={handleConnectBank}
            disabled={!plaidReady}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors text-white flex items-center gap-2 disabled:opacity-50"
          >
            <FiPlus className="w-4 h-4" />
            Connect Bank Account
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          </div>
        )}

        {/* Accounts Grid */}
        {!loading && accounts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map((account) => (
              <motion.div
                key={account.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-emerald-500/30 transition-colors"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {account.institutionName}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {account.accountName} {account.accountMask && `••${account.accountMask}`}
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded border border-emerald-500/30">
                    {account.accountType}
                  </span>
                </div>

                {/* Balance */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Current Balance</span>
                    <span className="text-xl font-bold text-white">
                      {formatCurrency(account.currentBalance, account.currency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Available</span>
                    <span className="text-sm text-gray-300">
                      {formatCurrency(account.availableBalance, account.currency)}
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 mb-4 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <FiDollarSign className="w-4 h-4" />
                    {account.transactionCount} transactions
                  </div>
                </div>

                {/* Last Synced */}
                {account.lastSyncedAt && (
                  <p className="text-xs text-gray-500 mb-4">
                    Last synced: {new Date(account.lastSyncedAt).toLocaleString()}
                  </p>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSync(account.id)}
                    disabled={syncing === account.id}
                    className="flex-1 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-sm text-blue-400 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <FiRefreshCw className={`w-4 h-4 ${syncing === account.id ? 'animate-spin' : ''}`} />
                    Sync
                  </button>
                  <button
                    onClick={() => handleDisconnect(account.id, account.institutionName)}
                    className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-sm text-red-400 transition-colors"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && accounts.length === 0 && (
          <div className="text-center py-20 bg-white/5 border border-white/10 rounded-xl">
            <FiDollarSign className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No Bank Accounts Connected
            </h3>
            <p className="text-gray-400 mb-6">
              Connect your business bank account to automatically sync transactions
            </p>
            <button
              onClick={handleConnectBank}
              disabled={!plaidReady}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors text-white inline-flex items-center gap-2 disabled:opacity-50"
            >
              <FiPlus className="w-5 h-5" />
              Connect Your First Bank Account
            </button>
            {!plaidReady && (
              <p className="text-xs text-gray-500 mt-2">Loading Plaid SDK...</p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
