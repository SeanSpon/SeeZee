/**
 * CEO Resources Management - Redirects to /admin/learning/resources
 * CEO features are now consolidated into /admin with role-based sections
 */

import { redirect } from "next/navigation";

export default function CEOResourcesPage() {
  redirect("/admin/learning/resources");
}
