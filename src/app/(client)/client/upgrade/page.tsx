import { requireAuth } from "@/lib/auth/requireAuth";
import { db } from "@/server/db";
import { UpgradeClient } from "@/components/client/UpgradeClient";
import { SUBSCRIPTION_PLANS } from "@/lib/subscriptionPlans";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function UpgradePage() {
  const session = await requireAuth();

  // For maintenance plan subscriptions, redirect to the hours page
  // which handles the proper checkout flow
  redirect("/client/hours#select-plan");

  // Get user's organization (create if doesn't exist)
  let orgMembership = await db.organizationMember.findFirst({
    where: { userId: session.user.id },
    include: {
      organization: true,
    },
  });

  // If user has no organization, create one automatically
  if (!orgMembership) {
    const userName = session.user.name || session.user.email?.split('@')[0] || 'User';
    const orgSlug = `${userName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`;
    
    const newOrg = await db.organization.create({
      data: {
        name: `${userName}'s Organization`,
        slug: orgSlug,
        members: {
          create: {
            userId: session.user.id,
            role: "OWNER",
          },
        },
      },
      include: {
        members: {
          include: {
            organization: true,
          },
        },
      },
    });

    orgMembership = newOrg.members[0];
  }

  // TypeScript assertion: orgMembership is guaranteed to exist after the above logic
  if (!orgMembership) {
    throw new Error("Failed to create or find organization membership");
  }

  // Get all projects for this organization with their subscriptions
  const projects = await db.project.findMany({
    where: {
      organizationId: orgMembership!.organizationId,
    },
    include: {
      subscriptions: {
        where: {
          status: "active",
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Get current active subscriptions
  const currentSubscriptions = projects.flatMap((project) =>
    project.subscriptions.map((sub) => ({
      id: sub.id,
      projectId: sub.projectId,
      projectName: project.name,
      planName: sub.planName || "Standard Monthly",
      priceId: sub.priceId,
    }))
  );

  // Map projects to simple format for project selection
  const availableProjects = projects.map((project) => ({
    id: project.id,
    name: project.name,
  }));

  return (
    <UpgradeClient
      plans={SUBSCRIPTION_PLANS}
      currentSubscriptions={currentSubscriptions}
      projects={availableProjects}
    />
  );
}










