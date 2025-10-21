/**
 * Invoices Management
 */

import { getInvoices } from "@/server/actions/pipeline";
import { InvoicesClient } from "@/components/admin/InvoicesClient";

export const dynamic = "force-dynamic";

export default async function InvoicesPage() {
  const result = await getInvoices();
  const invoices = result.success ? result.invoices : [];

  return <InvoicesClient invoices={invoices} />;
}
