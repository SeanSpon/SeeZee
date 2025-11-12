/**
 * Executive Analytics Dashboard - Redirects to CEO Analytics
 */

import { redirect } from "next/navigation";

export default function ExecutiveAnalyticsPage() {
  redirect("/admin/ceo/analytics");
}


