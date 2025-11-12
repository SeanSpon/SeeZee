/**
 * CEO Dashboard Layout - Redirects to /admin
 * CEO features are now consolidated into /admin with role-based sections
 */

import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/requireRole";
import { ROLE } from "@/lib/role";

export default async function CEOLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // CEO-only access check
  await requireRole([ROLE.CEO]);
  
  // Redirect to admin dashboard where CEO features are now located
  redirect("/admin");
}
