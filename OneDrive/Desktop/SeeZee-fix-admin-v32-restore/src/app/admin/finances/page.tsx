/**
 * Redirect /admin/finances to /admin/executive/finances
 */

import { redirect } from "next/navigation";

export default function FinancesRedirect() {
  redirect("/admin/executive/finances");
}
