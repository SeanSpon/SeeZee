/**
 * Redirect to unified finance transactions page
 */

import { redirect } from "next/navigation";

export default async function PipelineInvoicesRedirect() {
  redirect("/admin/finance/transactions?tab=invoices");
}
