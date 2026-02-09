/**
 * Armory — Encrypted Keycards
 * Issue, inspect, and revoke secret access for AI workers.
 */

import { requireAdmin } from "@/lib/authz";
import VaultClient from "@/components/admin/VaultClient";

export default async function VaultPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">🔐 Armory</h1>
        <p className="mt-2 text-slate-400">
          Encrypted keycards for your AI crew — issue, inspect, and revoke access
        </p>
      </div>
      <VaultClient />
    </div>
  );
}
