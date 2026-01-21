import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/requireRole";
import { ROLE } from "@/lib/role";
import { prisma } from "@/lib/prisma";
import { TemplatesListClient } from "@/components/admin/marketing/TemplatesListClient";

export const dynamic = "force-dynamic";

export default async function TemplatesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const allowedRoles = [ROLE.CEO, ROLE.CFO, ROLE.OUTREACH];
  if (!allowedRoles.includes(user.role as any)) {
    redirect("/admin");
  }

  const templates = await prisma.emailTemplate.findMany({
    orderBy: { createdAt: "desc" },
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

  // Transform dates to strings for client component
  const templatesData = templates.map((t) => ({
    ...t,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  }));

  return <TemplatesListClient initialTemplates={templatesData} />;
}
