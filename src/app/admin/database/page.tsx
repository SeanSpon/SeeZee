/**
 * Database Management - CEO gets full access, Admin gets read-only
 */

import { listModels } from "@/server/actions/database";
import { DatabaseClient } from "@/components/admin/DatabaseClient";

export const dynamic = "force-dynamic";

export default async function DatabasePage() {
  const result = await listModels();
  const models = result.success ? result.models : [];

  return <DatabaseClient models={models} />;
}



