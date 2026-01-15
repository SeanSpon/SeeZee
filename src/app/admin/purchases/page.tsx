/**
 * Redirect to unified finance transactions page
 */

import { redirect } from 'next/navigation';

export default async function PurchasesRedirect() {
  redirect("/admin/finance/transactions?tab=subscriptions");
}










