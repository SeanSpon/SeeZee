import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/requireRole";
import { ROLE } from "@/lib/role";
import { prisma } from "@/lib/prisma";
import { DripCampaignBuilderClient } from "@/components/admin/marketing/DripCampaignBuilderClient";

export const dynamic = "force-dynamic";

export default async function NewDripCampaignPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const allowedRoles = [ROLE.CEO, ROLE.CFO, ROLE.OUTREACH];
  if (!allowedRoles.includes(user.role as any)) {
    redirect("/admin");
  }

  // Fetch available templates
  const templates = await prisma.emailTemplate.findMany({
    where: { active: true },
    select: {
      id: true,
      name: true,
      subject: true,
      category: true,
    },
    orderBy: { name: "asc" },
  });

  return <DripCampaignBuilderClient mode="create" templates={templates} />;
}
