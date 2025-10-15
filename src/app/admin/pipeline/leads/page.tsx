/**
 * Leads Management
 */

import { getPipeline } from "@/server/actions";
import { LeadsTableClient } from "@/components/admin/LeadsTableClient";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const result = await getPipeline();
  const leads = result.success ? result.leads : [];

  return (
    <div className="space-y-6">
      <LeadsTableClient leads={leads} />
    </div>
  );
}


