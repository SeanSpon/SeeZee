/**
 * CEO Finances Dashboard
 */

import { SectionCard } from "@/components/admin/SectionCard";
import { StatCard } from "@/components/admin/StatCard";
import { DollarSign, CreditCard, TrendingDown, Download } from "lucide-react";
import { formatCurrency } from "@/lib/ui";
import { getFinancialMetrics, getRecentPayouts } from "@/server/actions/stripe";
import { FinancesClient } from "@/components/admin/FinancesClient";

export const dynamic = "force-dynamic";

export default async function CEOFinancesPage() {
  const [metricsResult, payoutsResult] = await Promise.all([
    getFinancialMetrics(),
    getRecentPayouts(5),
  ]);

  const metrics = metricsResult.success ? metricsResult.metrics : {
    totalIncome: 0,
    pendingPayments: 0,
    refunds: 0,
    growthPercent: 0,
    accountInfo: {
      accountId: "N/A",
      payoutSchedule: "Weekly",
      lastPayout: null,
      lastPayoutAmount: 0,
    },
  };

  const payouts = payoutsResult.success ? payoutsResult.payouts : [];

  return (
    <FinancesClient metrics={metrics} payouts={payouts} />
  );
}

