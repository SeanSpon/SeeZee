/**
 * Executive Analytics Dashboard
 */

import { getExecutiveMetrics } from "@/server/actions";
import { AnalyticsClient } from "@/components/admin/AnalyticsClient";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const result = await getExecutiveMetrics();
  const metrics = result.success ? result.metrics : null;

  return <AnalyticsClient metrics={metrics} />;
}


