/**
 * CEO System Logs - Redirects to /admin/ceo/systems/logs
 * CEO features are now consolidated into /admin/ceo
 */

import { redirect } from "next/navigation";

export default function CEOLogsPage() {
  redirect("/admin/ceo/systems/logs");
}
