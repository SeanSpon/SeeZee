"use server";

import { db } from "@/server/db";
import { getCurrentUser } from "@/lib/auth/requireRole";
import { revalidatePath } from "next/cache";
import { UserRole } from "@prisma/client";

/**
 * Admin action to manually assign a subscription to a project
 * This allows admins to give clients access to the dashboard before payment
 */
export async function assignSubscriptionToProject(data: {
  projectId: string;
  planName?: string;
  changeRequestsAllowed?: number;
}) {
  try {
    const user = await getCurrentUser();

    if (!user || (user.role !== UserRole.CEO && user.role !== UserRole.CFO)) {
      return { success: false, error: "Unauthorized - Admin access required" };
    }

    // Verify the project exists
    const project = await db.project.findUnique({
      where: { id: data.projectId },
      include: {
        subscriptions: {
          where: { status: "active" },
        },
      },
    });

    if (!project) {
      return { success: false, error: "Project not found" };
    }

    // Check if there's already an active subscription
    if (project.subscriptions.length > 0) {
      return {
        success: false,
        error: "Project already has an active subscription",
      };
    }

    // Create a manual subscription entry
    // Note: This is a "manual" subscription without Stripe integration
    const subscription = await db.subscription.create({
      data: {
        projectId: data.projectId,
        stripeId: `manual_${Date.now()}_${data.projectId}`, // Unique manual ID
        priceId: "manual", // Indicates this is manually assigned
        status: "active",
        planName: data.planName || "Quarterly Maintenance",
        changeRequestsAllowed: data.changeRequestsAllowed || 6,
        changeRequestsUsed: 0,
        currentPeriodEnd: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
        resetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
    });

    revalidatePath("/admin/clients");
    revalidatePath(`/admin/clients/${project.organizationId}`);
    revalidatePath(`/admin/projects/${data.projectId}`);

    return {
      success: true,
      subscription: {
        id: subscription.id,
        planName: subscription.planName,
        status: subscription.status,
      },
    };
  } catch (error) {
    console.error("[assignSubscriptionToProject]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to assign subscription",
    };
  }
}

/**
 * Admin action to revoke/cancel a manually assigned subscription
 */
export async function revokeSubscription(subscriptionId: string) {
  try {
    const user = await getCurrentUser();

    if (!user || (user.role !== UserRole.CEO && user.role !== UserRole.CFO)) {
      return { success: false, error: "Unauthorized - Admin access required" };
    }

    // Get the subscription
    const subscription = await db.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        project: true,
      },
    });

    if (!subscription) {
      return { success: false, error: "Subscription not found" };
    }

    // Only allow revoking manual subscriptions (ones without real Stripe IDs)
    if (!subscription.stripeId.startsWith("manual_")) {
      return {
        success: false,
        error: "Can only revoke manually assigned subscriptions. Use Stripe dashboard for paid subscriptions.",
      };
    }

    // Update subscription status to canceled
    await db.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: "canceled",
      },
    });

    revalidatePath("/admin/clients");
    revalidatePath(`/admin/clients/${subscription.project.organizationId}`);
    revalidatePath(`/admin/projects/${subscription.projectId}`);

    return { success: true };
  } catch (error) {
    console.error("[revokeSubscription]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to revoke subscription",
    };
  }
}

/**
 * Admin action to update a subscription's change request allowance
 */
export async function updateSubscriptionAllowance(data: {
  subscriptionId: string;
  changeRequestsAllowed: number;
}) {
  try {
    const user = await getCurrentUser();

    if (!user || (user.role !== UserRole.CEO && user.role !== UserRole.CFO)) {
      return { success: false, error: "Unauthorized - Admin access required" };
    }

    const subscription = await db.subscription.update({
      where: { id: data.subscriptionId },
      data: {
        changeRequestsAllowed: data.changeRequestsAllowed,
      },
      include: {
        project: true,
      },
    });

    revalidatePath("/admin/clients");
    revalidatePath(`/admin/clients/${subscription.project.organizationId}`);
    revalidatePath(`/admin/projects/${subscription.projectId}`);

    return { success: true };
  } catch (error) {
    console.error("[updateSubscriptionAllowance]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update allowance",
    };
  }
}
