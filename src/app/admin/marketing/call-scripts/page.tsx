import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/requireRole";
import { ROLE } from "@/lib/role";
import { prisma } from "@/lib/prisma";
import { CallScriptsClient } from "@/components/admin/marketing/CallScriptsClient";

export const dynamic = "force-dynamic";

export default async function CallScriptsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const allowedRoles = [ROLE.CEO, ROLE.CFO, ROLE.OUTREACH];
  if (!allowedRoles.includes(user.role as any)) {
    redirect("/admin");
  }

  // Fetch prospects with call scripts or high lead scores
  const prospects = await prisma.prospect.findMany({
    where: {
      OR: [
        { callScript: { not: null } },
        { leadScore: { gte: 70 } },
      ],
      archived: false,
    },
    orderBy: [
      { leadScore: "desc" },
      { createdAt: "desc" },
    ],
    take: 100,
  });

  const prospectsData = prospects.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    convertedAt: p.convertedAt?.toISOString() || null,
    emailSentAt: p.emailSentAt?.toISOString() || null,
    emailOpenedAt: p.emailOpenedAt?.toISOString() || null,
    emailRepliedAt: p.emailRepliedAt?.toISOString() || null,
    lastContactedAt: p.lastContactedAt?.toISOString() || null,
    followUpDate: p.followUpDate?.toISOString() || null,
  }));

  return <CallScriptsClient initialProspects={prospectsData} />;
}
