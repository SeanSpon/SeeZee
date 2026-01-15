/**
 * Executive System Logs - Redirects to CEO System Logs
 */

import { redirect } from "next/navigation";

export default function ExecutiveLogsPage() {
  redirect("/admin/ceo/systems/logs");
}


