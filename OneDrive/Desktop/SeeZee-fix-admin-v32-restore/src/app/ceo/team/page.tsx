/**
 * CEO Team Management - Redirects to /admin/team
 * CEO features are now consolidated into /admin with role-based sections
 */

import { redirect } from "next/navigation";

export default function CEOTeamPage() {
  redirect("/admin/team");
}
