/**
 * Links Management
 */

import { getLinks } from "@/server/actions";
import { LinksClient } from "@/components/admin/LinksClient";
import { AdminAppShell } from "@/components/admin/AdminAppShell";
import { getCurrentUser } from "@/lib/auth/requireRole";

export const dynamic = "force-dynamic";

export default async function LinksPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    return null;
  }

  const result = await getLinks();
  const links = result.success ? result.links : [];

  return (
    <AdminAppShell user={user}>
      <LinksClient links={links} />
    </AdminAppShell>
  );
}


