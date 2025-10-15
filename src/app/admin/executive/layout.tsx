/**
 * Executive Section Layout - CEO Only
 */

import { requireRole } from "@/lib/auth/requireRole";
import { ROLE } from "@/lib/role";

export default async function ExecutiveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Only CEO can access
  await requireRole([ROLE.CEO]);

  return <>{children}</>;
}

