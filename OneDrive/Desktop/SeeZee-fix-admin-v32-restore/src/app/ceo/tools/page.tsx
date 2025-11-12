/**
 * CEO Tools Management - Redirects to /admin/learning/tools
 * CEO features are now consolidated into /admin with role-based sections
 */

import { redirect } from "next/navigation";

export default function CEOToolsPage() {
  redirect("/admin/learning/tools");
}
