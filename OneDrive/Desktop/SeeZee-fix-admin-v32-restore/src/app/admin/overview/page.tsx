/**
 * Redirect /admin/overview to /admin (dashboard)
 */

import { redirect } from "next/navigation";

export default function OverviewRedirect() {
  redirect("/admin");
}
