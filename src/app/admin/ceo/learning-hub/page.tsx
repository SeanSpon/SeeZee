/**
 * CEO Learning Hub — Redirects to unified Learning Hub
 */

import { redirect } from "next/navigation";

export default function CEOLearningHubPage() {
  redirect("/admin/learning");
}
