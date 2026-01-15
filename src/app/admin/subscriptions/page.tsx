/**
 * Redirect to unified finance transactions page
 */

import { redirect } from "next/navigation";

export default async function SubscriptionsRedirect() {
  redirect("/admin/finance/transactions?tab=subscriptions");
}

