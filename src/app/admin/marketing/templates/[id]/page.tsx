import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/requireRole";
import { ROLE } from "@/lib/role";
import { prisma } from "@/lib/prisma";
import { TemplateEditorClient } from "@/components/admin/marketing/TemplateEditorClient";

export const dynamic = "force-dynamic";

export default async function EditTemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const allowedRoles = [ROLE.CEO, ROLE.CFO, ROLE.OUTREACH];
  if (!allowedRoles.includes(user.role as any)) {
    redirect("/admin");
  }

  const template = await prisma.emailTemplate.findUnique({
    where: { id },
    include: {
      campaigns: {
        select: {
          id: true,
          name: true,
          status: true,
          totalSent: true,
        },
      },
    },
  });

  if (!template) {
    redirect("/admin/marketing/templates");
  }

  return (
    <TemplateEditorClient
      mode="edit"
      initialTemplate={{
        ...template,
        createdAt: template.createdAt.toISOString(),
        updatedAt: template.updatedAt.toISOString(),
      }}
    />
  );
}
