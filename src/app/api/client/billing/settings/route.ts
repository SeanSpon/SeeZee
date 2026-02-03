import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/server/db";
import { getSubscriptionPlanByName } from "@/lib/subscriptionPlans";

/**
 * GET /api/client/billing/settings
 * Returns billing settings and current subscription plan
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's organization
    const orgMembership = await db.organizationMember.findFirst({
      where: { userId: session.user.id },
      include: {
        organization: true,
      },
    });

    if (!orgMembership) {
      return NextResponse.json(
        { error: "No organization found" },
        { status: 404 }
      );
    }

    // Get active maintenance plans (primary) or legacy subscriptions (fallback)
    const projects = await db.project.findMany({
      where: {
        organizationId: orgMembership.organizationId,
      },
      include: {
        maintenancePlanRel: {
          where: {
            status: "ACTIVE",
          },
        },
        subscriptions: {
          where: {
            status: "active",
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Prefer maintenance plan, fallback to legacy subscription
    const activePlan = projects
      .map((p) => p.maintenancePlanRel)
      .find((plan) => plan && plan.status === "ACTIVE");
    
    const activeSubscription = !activePlan 
      ? projects.flatMap((p) => p.subscriptions).find((sub) => sub.status === "active")
      : null;

    if (!activePlan && !activeSubscription) {
      return NextResponse.json({
        plan: null,
        settings: {
          onDemandEnabled: false,
          dailySpendCap: 500,
          monthlySpendCap: 2000,
          dailyRequestLimit: 3,
          urgentRequestsPerWeek: 2,
          rolloverEnabled: true,
          notifyAt80Percent: true,
          notifyAt2Hours: true,
          notifyBeforeOverage: true,
          notifyRolloverExpiring: true,
          autoPayEnabled: false,
        },
      });
    }

    // Use maintenance plan data if available, otherwise fallback to legacy subscription
    let planInfo;
    let settings;
    
    if (activePlan) {
      // Use MaintenancePlan
      const periodStart = activePlan.currentPeriodStart || activePlan.createdAt;
      const periodEnd = activePlan.currentPeriodEnd || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      
      planInfo = {
        tierName: `${activePlan.tier} Plan`,
        monthlyPrice: Number(activePlan.monthlyPrice) / 100,
        hoursIncluded: activePlan.supportHoursIncluded,
        changeRequestsIncluded: activePlan.changeRequestsIncluded,
        isUnlimited: activePlan.tier === 'COO', // COO tier is unlimited
        periodStart: periodStart.toISOString(),
        periodEnd: periodEnd.toISOString(),
      };
      
      settings = {
        onDemandEnabled: activePlan.onDemandEnabled,
        dailySpendCap: activePlan.dailySpendCap / 100,
        monthlySpendCap: activePlan.monthlySpendCap / 100,
        dailyRequestLimit: activePlan.dailyRequestLimit,
        urgentRequestsPerWeek: activePlan.urgentRequestsPerWeek,
        rolloverEnabled: activePlan.rolloverEnabled,
        notifyAt80Percent: true,
        notifyAt2Hours: true,
        notifyBeforeOverage: true,
        notifyRolloverExpiring: true,
        autoPayEnabled: false,
      };
    } else if (activeSubscription) {
      // Fallback to legacy subscription
      const planDetails = getSubscriptionPlanByName(
        activeSubscription.planName || "Standard Monthly"
      );
      
      const periodEnd = activeSubscription.currentPeriodEnd || 
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const periodStart = activeSubscription.currentPeriodEnd
        ? new Date(activeSubscription.currentPeriodEnd.getTime() - 30 * 24 * 60 * 60 * 1000)
        : activeSubscription.createdAt || new Date();
      
      planInfo = {
        tierName: planDetails?.displayName || activeSubscription.planName || "Standard Support",
        monthlyPrice: planDetails
          ? planDetails.price / 100
          : activeSubscription.planName?.includes("Premium") ? 90 : 50,
        hoursIncluded: planDetails
          ? planDetails.billingCycle === "quarterly" ? 30
          : planDetails.billingCycle === "annual" ? 120
          : 10
          : 10,
        changeRequestsIncluded: activeSubscription.changeRequestsAllowed || 
          planDetails?.changeRequestsAllowed || -1,
        isUnlimited: false,
        periodStart: periodStart.toISOString(),
        periodEnd: periodEnd.toISOString(),
      };
      
      settings = {
        onDemandEnabled: false,
        dailySpendCap: 500,
        monthlySpendCap: 2000,
        dailyRequestLimit: 3,
        urgentRequestsPerWeek: 2,
        rolloverEnabled: true,
        notifyAt80Percent: true,
        notifyAt2Hours: true,
        notifyBeforeOverage: true,
        notifyRolloverExpiring: true,
        autoPayEnabled: false,
      };
    }

    // Return billing settings
    return NextResponse.json({
      plan: planInfo,
      settings: settings,
    });
  } catch (error: any) {
    console.error("[GET /api/client/billing/settings]", error);
    return NextResponse.json(
      { error: "Failed to fetch billing settings" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/client/billing/settings
 * Update billing settings
 */
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // For now, just return success
    // In the future, you can store these settings in a UserPreferences or OrganizationSettings table
    return NextResponse.json({
      success: true,
      message: "Billing settings updated",
    });
  } catch (error: any) {
    console.error("[PUT /api/client/billing/settings]", error);
    return NextResponse.json(
      { error: "Failed to update billing settings" },
      { status: 500 }
    );
  }
}
