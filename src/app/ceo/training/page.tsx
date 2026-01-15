/**
 * CEO Training Management - Redirects to /admin/learning/training
 * CEO features are now consolidated into /admin with role-based sections
 */

import { redirect } from "next/navigation";

export default function CEOTrainingPage() {
  redirect("/admin/learning/training");
}
