/**
 * Redirect to hours and packages management page
 */

import { redirect } from "next/navigation";

export default async function SubscriptionsRedirect() {
  redirect("/admin/hours");
}

