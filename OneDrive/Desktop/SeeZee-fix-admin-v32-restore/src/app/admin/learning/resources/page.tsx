/**
 * Resources Library
 */

import { ResourcesClient } from "@/components/admin/ResourcesClient";

export const dynamic = "force-dynamic";

export default async function ResourcesPage() {
  // Fetch resources from the database
  const response = await fetch(`${process.env.NEXTAUTH_URL}/api/ceo/resources`, {
    cache: 'no-store',
  });
  
  let resources = [];
  if (response.ok) {
    const data = await response.json();
    resources = Array.isArray(data) ? data : data.items || [];
  }

  return <ResourcesClient resources={resources} />;
}


