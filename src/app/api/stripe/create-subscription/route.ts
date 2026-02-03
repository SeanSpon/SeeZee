import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/server/db";
import { isStaffRole } from "@/lib/role";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

/**
 * @deprecated This endpoint is deprecated. Use MaintenancePlan checkout flow instead.
 * Organization-level subscriptions have been replaced with project-based MaintenancePlan.
 * See /api/checkout/maintenance for the new flow.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || !isStaffRole(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { organizationId, tier, startDate } = body;

    // Validate tier (deprecated - this endpoint should not be used)
    const tierUpper = tier.toUpperCase();
    const TIER_PRICING: Record<string, { price: number }> = {
      BASIC: { price: 99 },
      STANDARD: { price: 199 },
      PREMIUM: { price: 399 },
    };
    
    if (!TIER_PRICING[tierUpper]) {
      return NextResponse.json(
        { error: "Invalid tier. Must be BASIC, STANDARD, or PREMIUM" },
        { status: 400 }
      );
    }
    
    const tierConfig = TIER_PRICING[tierUpper];

    // Get organization
    const organization = await db.organization.findUnique({
      where: { id: organizationId },
      select: { id: true, name: true, email: true, stripeCustomerId: true },
    });

    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    // Create or get Stripe customer
    let stripeCustomerId = organization.stripeCustomerId;

    if (!stripeCustomerId && organization.email) {
      const customer = await stripe.customers.create({
        name: organization.name,
        email: organization.email,
        metadata: {
          organizationId: organization.id,
        },
      });
      stripeCustomerId = customer.id;

      await db.organization.update({
        where: { id: organization.id },
        data: { stripeCustomerId },
      });
    }

    if (!stripeCustomerId) {
      return NextResponse.json(
        { error: "Organization needs email to create subscription" },
        { status: 400 }
      );
    }

    // Create or find price in Stripe
    const priceId = await getOrCreatePrice(tierUpper, tierConfig.price);

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [{ price: priceId }],
      billing_cycle_anchor: startDate 
        ? Math.floor(new Date(startDate).getTime() / 1000)
        : undefined,
      metadata: {
        organizationId,
        tier: tierUpper,
      },
    });

    // NOTE: MaintenanceSubscription model has been removed.
    // This endpoint is deprecated. Return error directing to new flow.
    return NextResponse.json({
      error: "This endpoint is deprecated. Please use project-based MaintenancePlan checkout instead.",
      redirectTo: "/api/checkout/maintenance",
    }, { status: 410 }); // 410 Gone
  } catch (error) {
    console.error("Error creating subscription:", error);
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    );
  }
}

async function getOrCreatePrice(tier: string, amountCents: number): Promise<string> {
  // Check if price already exists
  const existingPrices = await stripe.prices.list({
    lookup_keys: [`maintenance_${tier.toLowerCase()}`],
    active: true,
  });

  if (existingPrices.data.length > 0) {
    return existingPrices.data[0].id;
  }

  // Create product if needed
  let product: Stripe.Product;
  const products = await stripe.products.list({
    active: true,
  });
  
  const existingProduct = products.data.find(
    (p) => p.metadata.type === "maintenance" && p.metadata.tier === tier
  );

  if (existingProduct) {
    product = existingProduct;
  } else {
    product = await stripe.products.create({
      name: `SeeZee ${tier.charAt(0) + tier.slice(1).toLowerCase()} Maintenance`,
      description: `Monthly maintenance plan - ${tier.charAt(0) + tier.slice(1).toLowerCase()} tier`,
      metadata: {
        type: "maintenance",
        tier,
      },
    });
  }

  // Create price
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: amountCents,
    currency: "usd",
    recurring: {
      interval: "month",
    },
    lookup_key: `maintenance_${tier.toLowerCase()}`,
  });

  return price.id;
}

