/**
 * CEO Analytics Dashboard - Redirects to /admin/ceo/analytics
 * CEO features are now consolidated into /admin/ceo
 */

import { redirect } from "next/navigation";

export default function CEOAnalyticsPage() {
  redirect("/admin/ceo/analytics");
}
