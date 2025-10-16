/**
 * Links Management
 */

import { getLinks } from "@/server/actions";
import { LinksClient } from "@/components/admin/LinksClient";

export const dynamic = "force-dynamic";

export default async function LinksPage() {
  const result = await getLinks();
  const links = result.success ? result.links : [];

  return <LinksClient links={links} />;
}


