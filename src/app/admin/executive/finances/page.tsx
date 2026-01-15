/**
 * Executive Finances Dashboard - Redirects to CEO Finances
 */

import { redirect } from "next/navigation";

export default function ExecutiveFinancesPage() {
  redirect("/admin/ceo/finances");
}


