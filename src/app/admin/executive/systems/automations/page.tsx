/**
 * Executive Automations - Redirects to CEO Automations
 */

import { redirect } from "next/navigation";

export default function ExecutiveAutomationsPage() {
  redirect("/admin/ceo/systems/automations");
}


