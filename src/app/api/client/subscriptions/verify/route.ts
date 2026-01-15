import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/requireAuth";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing session_id" },
        { status: 400 }
      );
    }

    // Retrieve the checkout session from Stripe (with expanded subscription)
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    });

    if (checkoutSession.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment not completed" },
        { status: 400 }
      );
    }

    // CRITICAL FIX: Immediately activate the maintenance plan instead of waiting for webhook
    // This fixes the issue where clients don't see their subscription on localhost (webhooks don't fire without Stripe CLI)
    if (checkoutSession.metadata?.type === 'maintenance-plan-subscription') {
      const maintenancePlanId = checkoutSession.metadata?.maintenancePlanId;
      
      if (maintenancePlanId) {
        // Get subscription ID
        let subscriptionId: string | null = null;
        
        if (typeof checkoutSession.subscription === 'string') {
          subscriptionId = checkoutSession.subscription;
        } else if (checkoutSession.subscription && typeof checkoutSession.subscription === 'object' && 'id' in checkoutSession.subscription) {
          subscriptionId = (checkoutSession.subscription as Stripe.Subscription).id;
        }
        
        if (subscriptionId) {
          console.log(`[VERIFY] Activating maintenance plan ${maintenancePlanId} with subscription ${subscriptionId}`);
          
          // Retrieve subscription details for billing period
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const periodStart = new Date(subscription.current_period_start * 1000);
          const periodEnd = new Date(subscription.current_period_end * 1000);
          
          // Check if already activated to avoid duplicate processing
          const existingPlan = await prisma.maintenancePlan.findUnique({
            where: { id: maintenancePlanId },
            select: { stripeSubscriptionId: true, status: true },
          });
          
          if (!existingPlan?.stripeSubscriptionId) {
            // Activate the plan and reset usage counters
            await prisma.maintenancePlan.update({
              where: { id: maintenancePlanId },
              data: {
                stripeSubscriptionId: subscriptionId,
                status: 'ACTIVE',
                supportHoursUsed: 0,
                changeRequestsUsed: 0,
                urgentRequestsUsed: 0,
                requestsToday: 0,
                currentPeriodStart: periodStart,
                currentPeriodEnd: periodEnd,
              },
            });
            
            console.log(`[VERIFY] ✅ Maintenance plan ${maintenancePlanId} activated successfully`);
          } else {
            console.log(`[VERIFY] Maintenance plan ${maintenancePlanId} already activated, skipping`);
          }
        }
      }
    }

    // Return success
    return NextResponse.json({
      success: true,
      subscriptionId: checkoutSession.subscription,
      customerId: checkoutSession.customer,
      paymentStatus: checkoutSession.payment_status,
    });
  } catch (error: any) {
    console.error("Subscription verification error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify subscription" },
      { status: 500 }
    );
  }
}
