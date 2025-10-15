/**
 * Tools Directory
 */

import { getTools } from "@/server/actions";
import { ToolsClient } from "@/components/admin/ToolsClient";

export const dynamic = "force-dynamic";

export default async function ToolsPage() {
  const result = await getTools();
  const tools = result.success ? result.tools : [];

  return <ToolsClient tools={tools} />;
}


