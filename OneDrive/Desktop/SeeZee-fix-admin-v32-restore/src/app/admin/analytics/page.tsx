/**
 * Redirect /admin/analytics to /admin/ceo/analytics
 */

import { redirect } from "next/navigation";

export default function AnalyticsRedirect() {
  redirect("/admin/ceo/analytics");
}
