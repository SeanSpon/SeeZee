import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/requireRole";
import { ROLE } from "@/lib/role";
import { TemplateEditorClient } from "@/components/admin/marketing/TemplateEditorClient";

export const dynamic = "force-dynamic";

export default async function NewTemplatePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const allowedRoles = [ROLE.CEO, ROLE.CFO, ROLE.OUTREACH];
  if (!allowedRoles.includes(user.role as any)) {
    redirect("/admin");
  }

  return <TemplateEditorClient mode="create" />;
}
