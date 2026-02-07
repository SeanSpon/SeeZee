/**
 * Dispatch Yard — CEO AI Worker Fleet
 * Your crew, their buses, and every route on the board.
 */

import { requireAdmin } from "@/lib/authz";
import NodesClient from "@/components/admin/NodesClient";

export default async function NodesPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">🚌 Dispatch Yard</h1>
        <p className="mt-2 text-slate-400">
          Your crew, their buses, and every route on the board
        </p>
      </div>

      <NodesClient />
    </div>
  );
}
