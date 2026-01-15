/**
 * CEO Finances Dashboard - Redirects to /admin/ceo/finances
 * CEO features are now consolidated into /admin/ceo
 */

import { redirect } from "next/navigation";

export default function CEOFinancesPage() {
  redirect("/admin/ceo/finances");
}
