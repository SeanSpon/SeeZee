/**
 * Bank Accounts Page
 * Connect and manage business bank accounts
 */

import { BankAccountsManager } from "@/components/admin/finance/BankAccountsManager";
import { requireAdmin } from "@/lib/authz";

export const dynamic = "force-dynamic";

export default async function BankAccountsPage() {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="max-w-7xl mx-auto">
        <BankAccountsManager />
      </div>
    </div>
  );
}
