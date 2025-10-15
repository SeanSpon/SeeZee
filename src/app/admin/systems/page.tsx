/**
 * Redirect /admin/systems to /admin/executive/systems
 */

import { redirect } from "next/navigation";

export default function SystemsRedirect() {
  redirect("/admin/executive/systems");
}
