/**
 * Return Bay — Incoming Bus Results
 * Returned buses, cargo to inspect, and drivers waiting for directions.
 */

import { requireAdmin } from "@/lib/authz";
import InboxClient from "@/components/admin/InboxClient";

export default async function InboxPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">🏗️ Return Bay</h1>
        <p className="mt-2 text-slate-400">
          Returned buses, cargo to inspect, and drivers waiting for directions
        </p>
      </div>
      <InboxClient />
    </div>
  );
}
