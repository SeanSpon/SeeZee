import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/requireRole";
import { ROLE } from "@/lib/role";
import { prisma } from "@/lib/prisma";
import { DripCampaignsListClient } from "@/components/admin/marketing/DripCampaignsListClient";

export const dynamic = "force-dynamic";

export default async function DripCampaignsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const allowedRoles = [ROLE.CEO, ROLE.CFO, ROLE.OUTREACH];
  if (!allowedRoles.includes(user.role as any)) {
    redirect("/admin");
  }

  const campaigns = await prisma.dripCampaign.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      steps: {
        orderBy: { stepNumber: "asc" },
        include: {
          template: true,
        },
      },
      enrollments: {
        select: {
          id: true,
          prospectId: true,
          currentStep: true,
          completed: true,
          unsubscribed: true,
        },
      },
      _count: {
        select: {
          enrollments: true,
        },
      },
    },
  });

  // Transform for client
  const campaignsData = campaigns.map((c) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    steps: c.steps.map((s) => ({
      ...s,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    })),
    enrollments: c.enrollments || [],
  }));

  return <DripCampaignsListClient initialCampaigns={campaignsData} />;
}
