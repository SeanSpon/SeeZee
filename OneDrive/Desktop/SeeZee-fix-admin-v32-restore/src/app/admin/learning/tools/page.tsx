/**
 * Tools Directory
 */

import { AdminToolsClient } from "@/components/admin/AdminToolsClient";

export const dynamic = "force-dynamic";

export default async function ToolsPage() {
  // Fetch tools from the database
  const response = await fetch(`${process.env.NEXTAUTH_URL}/api/ceo/tools`, {
    cache: 'no-store',
  });
  
  let tools = [];
  if (response.ok) {
    const data = await response.json();
    tools = Array.isArray(data) ? data : data.items || [];
  }

  return <AdminToolsClient tools={tools} />;
}


