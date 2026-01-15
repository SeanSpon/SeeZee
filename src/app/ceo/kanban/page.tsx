/**
 * CEO Kanban Board - Redirects to /admin/pipeline/view
 * CEO features are now consolidated into /admin with role-based sections
 */

import { redirect } from "next/navigation";

export default function CEOKanbanPage() {
  redirect("/admin/pipeline/view");
}
