/**
 * Redirect /admin/analytics to /admin/executive/analytics
 */

import { redirect } from "next/navigation";

export default function AnalyticsRedirect() {
  redirect("/admin/executive/analytics");
}
