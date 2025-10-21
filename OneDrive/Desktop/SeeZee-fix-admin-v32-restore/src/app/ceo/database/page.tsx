/**
 * CEO Database Management
 * Full CRUD access to all database models
 */

import { listModels } from "@/server/actions/database";
import { DatabaseClient } from "@/components/admin/DatabaseClient";

export const dynamic = "force-dynamic";

export default async function CEODatabasePage() {
  const result = await listModels();
  const models = result.success ? result.models : [];

  return <DatabaseClient models={models} />;
}
