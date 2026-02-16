import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/requireRole";
import { ROLE } from "@/lib/role";
import { prisma } from "@/lib/prisma";
import { DripCampaignBuilderClient } from "@/components/admin/marketing/DripCampaignBuilderClient";

export const dynamic = "force-dynamic";

export default async function EditDripCampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const allowedRoles = [ROLE.CEO, ROLE.CFO, ROLE.OUTREACH];
  if (!allowedRoles.includes(user.role as any)) {
    redirect("/admin");
  }

  const campaign = await prisma.dripCampaign.findUnique({
    where: { id },
    include: {
      steps: {
        orderBy: { stepNumber: "asc" },
        include: {
          template: {
            select: {
              id: true,
              name: true,
              subject: true,
              category: true,
            },
          },
        },
      },
      enrollments: {
        select: {
          id: true,
          completed: true,
          unsubscribed: true,
        },
      },
    },
  });

  if (!campaign) {
    redirect("/admin/marketing/drip-campaigns");
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

  const campaignData = {
    ...campaign,
    createdAt: campaign.createdAt.toISOString(),
    updatedAt: campaign.updatedAt.toISOString(),
    steps: campaign.steps.map((s) => ({
      ...s,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    })),
  };

  return (
    <DripCampaignBuilderClient
      mode="edit"
      templates={templates}
      initialCampaign={campaignData}
    />
  );
}
