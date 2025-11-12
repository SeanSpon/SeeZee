/**
 * CEO Database Management - Redirects to /admin/database
 * CEO features are now consolidated into /admin with role-based sections
 */

import { redirect } from "next/navigation";

export default function CEODatabasePage() {
  redirect("/admin/database");
}
