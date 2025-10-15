/**
 * Executive Finances Dashboard
 */

"use client";

import { SectionCard } from "@/components/admin/SectionCard";
import { StatCard } from "@/components/admin/StatCard";
import { DollarSign, CreditCard, TrendingDown, Download } from "lucide-react";
import { formatCurrency } from "@/lib/ui";

export default function FinancesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="admin-page-header">
          <h1 className="admin-page-title">Finances</h1>
          <p className="admin-page-subtitle">
            Stripe integration and financial overview
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium transition-all">
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Income"
          value={formatCurrency(127500)}
          icon={<DollarSign className="w-5 h-5" />}
          trend={{ value: 18, label: "this quarter" }}
        />
        <StatCard
          label="Pending Payments"
          value={formatCurrency(24000)}
          icon={<CreditCard className="w-5 h-5" />}
        />
        <StatCard
          label="Refunds"
          value={formatCurrency(2400)}
          icon={<TrendingDown className="w-5 h-5" />}
        />
        <StatCard
          label="Expenses"
          value={formatCurrency(42000)}
          icon={<TrendingDown className="w-5 h-5" />}
        />
      </div>

      {/* Stripe Summary */}
      <SectionCard title="Stripe Summary">
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-white/5">
            <span className="text-slate-400">Connected Account</span>
            <span className="text-white font-medium">acct_1234567890</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-white/5">
            <span className="text-slate-400">Payout Schedule</span>
            <span className="text-white font-medium">Weekly</span>
          </div>
          <div className="flex justify-between items-center py-3">
            <span className="text-slate-400">Last Payout</span>
            <span className="text-white font-medium">{formatCurrency(8500)} • 3 days ago</span>
          </div>
        </div>
      </SectionCard>

      <div className="text-sm text-slate-500 text-center py-4">
        TODO: Wire to Stripe API for real-time financial data
      </div>
    </div>
  );
}


