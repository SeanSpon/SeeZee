/**
 * Redirect to unified finance overview
 */

import { redirect } from "next/navigation";

export default async function CEOFinancesRedirect() {
  redirect("/admin/finance");
}

