/**
 * CEO Systems Control - Redirects to /admin/ceo/systems
 * CEO features are now consolidated into /admin/ceo
 */

import { redirect } from "next/navigation";

export default function CEOSystemsPage() {
  redirect("/admin/ceo/systems");
}
