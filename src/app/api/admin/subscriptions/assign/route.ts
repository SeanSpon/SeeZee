import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/requireRole";
import { db } from "@/server/db";
import { revalidatePath } from "next/cache";
import { UserRole } from "@prisma/client";

/**
 * POST /api/admin/subscriptions/assign
 * Manually assign a subscription to a project
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || (user.role !== UserRole.CEO && user.role !== UserRole.CFO)) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { projectId, planName, changeRequestsAllowed } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    // Verify the project exists
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: {
        subscriptions: {
          where: { status: "active" },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Check if there's already an active subscription
    if (project.subscriptions.length > 0) {
      return NextResponse.json(
        { error: "Project already has an active subscription" },
        { status: 400 }
      );
    }

    // Create a manual subscription entry
    const subscription = await db.subscription.create({
      data: {
        projectId,
        stripeId: `manual_${Date.now()}_${projectId}`,
        priceId: "manual",
        status: "active",
        planName: planName || "Quarterly Maintenance",
        changeRequestsAllowed: changeRequestsAllowed || 6,
        changeRequestsUsed: 0,
        currentPeriodEnd: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
        resetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
    });

    revalidatePath("/admin/clients");
    revalidatePath(`/admin/clients/${project.organizationId}`);

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        planName: subscription.planName,
        status: subscription.status,
      },
    });
  } catch (error) {
    console.error("[POST /api/admin/subscriptions/assign]", error);
    return NextResponse.json(
      { error: "Failed to assign subscription" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/subscriptions/assign
 * Revoke a manually assigned subscription
 */
export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || (user.role !== UserRole.CEO && user.role !== UserRole.CFO)) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const subscriptionId = searchParams.get("id");

    if (!subscriptionId) {
      return NextResponse.json(
        { error: "Subscription ID is required" },
        { status: 400 }
      );
    }

    // Get the subscription
    const subscription = await db.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        project: true,
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    // Only allow revoking manual subscriptions
    if (!subscription.stripeId.startsWith("manual_")) {
      return NextResponse.json(
        {
          error:
            "Can only revoke manually assigned subscriptions. Use Stripe dashboard for paid subscriptions.",
        },
        { status: 400 }
      );
    }

    // Update subscription status
    await db.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: "canceled",
      },
    });

    revalidatePath("/admin/clients");
    revalidatePath(`/admin/clients/${subscription.project.organizationId}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/admin/subscriptions/assign]", error);
    return NextResponse.json(
      { error: "Failed to revoke subscription" },
      { status: 500 }
    );
  }
}
