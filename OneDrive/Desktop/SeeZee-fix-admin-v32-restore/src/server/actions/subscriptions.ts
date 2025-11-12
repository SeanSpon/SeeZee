"use server";

/**
 * Server actions for Subscription and Change Request management
 */

import { db } from "@/server/db";
import { requireAuth } from "@/lib/auth/requireAuth";
import { revalidatePath } from "next/cache";

/**
 * Create a change request for a subscription
 */
export async function createChangeRequest(data: {
  subscriptionId: string;
  projectId: string;
  description: string;
}) {
  const session = await requireAuth();

  try {
    // Get subscription with current usage
    const subscription = await db.subscription.findUnique({
      where: { id: data.subscriptionId },
      include: {
        project: {
          include: {
            organization: {
              include: {
                members: true,
              },
            },
          },
        },
      },
    });

    if (!subscription) {
      return { success: false, error: "Subscription not found" };
    }

    // Verify user has access to this subscription's project
    const hasAccess = subscription.project.organization.members.some(
      (member) => member.userId === session.user.id
    );

    if (!hasAccess && session.user.role !== "CEO") {
      return { success: false, error: "Unauthorized" };
    }

    // Check if user has exceeded their change request limit
    if (subscription.changeRequestsUsed >= subscription.changeRequestsAllowed) {
      return {
        success: false,
        error: `Change request limit reached. You have used ${subscription.changeRequestsUsed} of ${subscription.changeRequestsAllowed} requests this period.`,
      };
    }

    // Create the change request
    const changeRequest = await db.changeRequest.create({
      data: {
        projectId: data.projectId,
        subscriptionId: data.subscriptionId,
        description: data.description,
        status: "pending",
      },
    });

    // Increment the usage counter
    await db.subscription.update({
      where: { id: data.subscriptionId },
      data: {
        changeRequestsUsed: {
          increment: 1,
        },
      },
    });

    revalidatePath("/client/subscriptions");
    revalidatePath(`/client/projects/${data.projectId}`);

    return { success: true, changeRequest };
  } catch (error) {
    console.error("Failed to create change request:", error);
    return { success: false, error: "Failed to create change request" };
  }
}

/**
 * Get change requests for a subscription
 */
export async function getChangeRequests(subscriptionId: string) {
  const session = await requireAuth();

  try {
    const subscription = await db.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        project: {
          include: {
            organization: {
              include: {
                members: true,
              },
            },
          },
        },
        changeRequests: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!subscription) {
      return { success: false, error: "Subscription not found", changeRequests: [] };
    }

    // Verify access
    const hasAccess = subscription.project.organization.members.some(
      (member) => member.userId === session.user.id
    );

    if (!hasAccess && session.user.role !== "CEO" && session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized", changeRequests: [] };
    }

    return { success: true, changeRequests: subscription.changeRequests };
  } catch (error) {
    console.error("Failed to fetch change requests:", error);
    return { success: false, error: "Failed to fetch change requests", changeRequests: [] };
  }
}

/**
 * Update change request status (Admin/CEO only)
 */
export async function updateChangeRequestStatus(
  changeRequestId: string,
  status: "pending" | "approved" | "completed" | "rejected"
) {
  const session = await requireAuth();

  if (session.user.role !== "CEO" && session.user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const changeRequest = await db.changeRequest.update({
      where: { id: changeRequestId },
      data: {
        status,
        ...(status === "completed" ? { completedAt: new Date() } : {}),
      },
    });

    revalidatePath("/client/subscriptions");
    revalidatePath("/admin/projects");

    return { success: true, changeRequest };
  } catch (error) {
    console.error("Failed to update change request:", error);
    return { success: false, error: "Failed to update change request" };
  }
}

/**
 * Reset change request counter (called monthly by cron or admin)
 */
export async function resetChangeRequestCounters(subscriptionId?: string) {
  const session = await requireAuth();

  if (session.user.role !== "CEO") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const now = new Date();
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    if (subscriptionId) {
      // Reset specific subscription
      await db.subscription.update({
        where: { id: subscriptionId },
        data: {
          changeRequestsUsed: 0,
          resetDate: nextMonth,
        },
      });
    } else {
      // Reset all subscriptions that are due for reset
      await db.subscription.updateMany({
        where: {
          OR: [
            { resetDate: { lte: now } },
            { resetDate: null },
          ],
        },
        data: {
          changeRequestsUsed: 0,
          resetDate: nextMonth,
        },
      });
    }

    revalidatePath("/client/subscriptions");
    return { success: true };
  } catch (error) {
    console.error("Failed to reset change request counters:", error);
    return { success: false, error: "Failed to reset counters" };
  }
}

/**
 * Get subscription usage statistics
 */
export async function getSubscriptionStats(subscriptionId: string) {
  const session = await requireAuth();

  try {
    const subscriptionBase = await db.subscription.findUnique({
      where: { id: subscriptionId },
      select: { resetDate: true },
    });
    
    const subscription = await db.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        changeRequests: {
          where: {
            createdAt: {
              gte: subscriptionBase?.resetDate || new Date(0),
            },
          },
        },
        project: {
          include: {
            organization: {
              include: {
                members: true,
              },
            },
          },
        },
      },
    });

    if (!subscription) {
      return { success: false, error: "Subscription not found", stats: null };
    }

    // Verify access
    const hasAccess = subscription.project.organization.members.some(
      (member) => member.userId === session.user.id
    );

    if (!hasAccess && session.user.role !== "CEO" && session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized", stats: null };
    }

    const stats = {
      allowed: subscription.changeRequestsAllowed,
      used: subscription.changeRequestsUsed,
      remaining: subscription.changeRequestsAllowed - subscription.changeRequestsUsed,
      resetDate: subscription.resetDate,
      pending: subscription.changeRequests.filter((cr) => cr.status === "pending").length,
      approved: subscription.changeRequests.filter((cr) => cr.status === "approved").length,
      completed: subscription.changeRequests.filter((cr) => cr.status === "completed").length,
      rejected: subscription.changeRequests.filter((cr) => cr.status === "rejected").length,
    };

    return { success: true, stats };
  } catch (error) {
    console.error("Failed to fetch subscription stats:", error);
    return { success: false, error: "Failed to fetch stats", stats: null };
  }
}
