/**
 * Database Management - CEO gets full access, Admin gets read-only
 */

import { listModels } from "@/server/actions/database";
import { DatabaseClient } from "@/components/admin/DatabaseClient";
import { AdminAppShell } from "@/components/admin/AdminAppShell";
import { getCurrentUser } from "@/lib/auth/requireRole";

export const dynamic = "force-dynamic";

export default async function DatabasePage() {
  const user = await getCurrentUser();
  
  if (!user) {
    return null;
  }

  const result = await listModels();
  const models = result.success ? result.models : [];

  return (
    <AdminAppShell user={user}>
      <DatabaseClient models={models} />
    </AdminAppShell>
  );
}



