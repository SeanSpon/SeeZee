/**
 * Redirect /admin/finances to /admin/ceo/finances
 */

import { redirect } from "next/navigation";

export default function FinancesRedirect() {
  redirect("/admin/ceo/finances");
}
