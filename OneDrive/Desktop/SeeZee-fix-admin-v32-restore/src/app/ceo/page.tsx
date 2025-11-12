/**
 * CEO Dashboard - Redirects to /admin
 * CEO dashboard is now part of /admin with role-based sections
 */

import { redirect } from "next/navigation";

export default function CEODashboardPage() {
  redirect("/admin");
}
