/**
 * Redirect to unified finance transactions page
 */

import { redirect } from "next/navigation";

export default function InvoicesRedirect() {
  redirect("/admin/finance/transactions?tab=invoices");
}

