/**
 * CEO Settings Page - Redirects to /settings
 * CEO features are now consolidated into /admin with role-based sections
 */

import { redirect } from "next/navigation";

export default function CEOSettingsPage() {
  redirect("/settings");
}
