import { requireAuth } from "@/lib/auth/requireAuth";
import { db } from "@/server/db";
import { SubscriptionsClient } from "@/components/client/SubscriptionsClient";

export const dynamic = "force-dynamic";

export default async function SubscriptionsPage() {
  const session = await requireAuth();

  // Get user's organization
  const orgMembership = await db.organizationMember.findFirst({
    where: { userId: session.user.id },
    include: {
      organization: true,
    },
  });

  if (!orgMembership) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">No Organization Found</h2>
          <p className="text-gray-400">You are not associated with any organization.</p>
        </div>
      </div>
    );
  }

  // Get all projects for this organization
  const projects = await db.project.findMany({
    where: {
      organizationId: orgMembership.organizationId,
    },
    include: {
      subscriptions: {
        include: {
          changeRequests: {
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Serialize subscriptions data
  const subscriptionsData = projects.flatMap((project) =>
    project.subscriptions.map((sub) => ({
      id: sub.id,
      projectId: sub.projectId,
      projectName: project.name,
      stripeId: sub.stripeId,
      priceId: sub.priceId,
      status: sub.status,
      planName: sub.planName || 'Standard Monthly',
      currentPeriodEnd: sub.currentPeriodEnd?.toISOString() || null,
      changeRequestsAllowed: sub.changeRequestsAllowed,
      changeRequestsUsed: sub.changeRequestsUsed,
      resetDate: sub.resetDate?.toISOString() || null,
      createdAt: sub.createdAt.toISOString(),
      changeRequests: sub.changeRequests.map((cr) => ({
        id: cr.id,
        description: cr.description,
        status: cr.status,
        createdAt: cr.createdAt.toISOString(),
        completedAt: cr.completedAt?.toISOString() || null,
      })),
    }))
  );

  return <SubscriptionsClient subscriptions={subscriptionsData} />;
}



