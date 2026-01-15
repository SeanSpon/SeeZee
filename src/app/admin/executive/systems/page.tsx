/**
 * Executive Systems Overview - Redirects to CEO Systems
 */

import { redirect } from "next/navigation";

export default function ExecutiveSystemsPage() {
  redirect("/admin/ceo/systems");
}


