/**
 * CEO Automations - Redirects to /admin/ceo/systems/automations
 * CEO features are now consolidated into /admin/ceo
 */

import { redirect } from "next/navigation";

export default function CEOAutomationsPage() {
  redirect("/admin/ceo/systems/automations");
}
