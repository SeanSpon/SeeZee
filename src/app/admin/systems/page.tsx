/**
 * Redirect /admin/systems to /admin/ceo/systems
 */

import { redirect } from "next/navigation";

export default function SystemsRedirect() {
  redirect("/admin/ceo/systems");
}
