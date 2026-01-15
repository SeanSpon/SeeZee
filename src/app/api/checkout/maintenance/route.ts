import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import Stripe from 'stripe';
import { SUBSCRIPTION_PLANS } from '@/lib/subscriptionPlans';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

// Maintenance plan pricing
const PLANS = {
  QUARTERLY: {
    name: 'Quarterly Maintenance Plan',
    price: 200000, // $2,000 in cents
    interval: 'month' as const,
    intervalCount: 3, // Every 3 months
    hours: 30,
    description: '30 support hours per quarter with priority service',
  },
  ANNUAL: {
    name: 'Annual Maintenance Plan',
    price: 680000, // $6,800 in cents (15% discount)
    interval: 'year' as const,
    intervalCount: 1,
    hours: 120,
    description: '120 support hours per year with priority service',
  },
};

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { plan } = body;

    if (!plan || !PLANS[plan as keyof typeof PLANS]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const selectedPlan = PLANS[plan as keyof typeof PLANS];

    // Get or create user's organization
    let user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        organizations: {
          include: {
            organization: {
              include: {
                projects: {
                  take: 1,
                  orderBy: { createdAt: 'desc' },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let organization;
    let project;

    if (user.organizations.length === 0) {
      // Create organization for user
      const userName = session.user.name || session.user.email.split('@')[0] || 'User';
      const orgSlug = `${userName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`;
      
      organization = await prisma.organization.create({
        data: {
          name: `${userName}'s Organization`,
          slug: orgSlug,
          members: {
            create: {
              userId: session.user.id,
              role: 'OWNER',
            },
          },
        },
      });
    } else {
      organization = user.organizations[0].organization;
    }

    // Get or create a project for this organization
    const existingProjects = await prisma.project.findMany({
      where: { organizationId: organization.id },
      orderBy: { createdAt: 'desc' },
      take: 1,
    });

    if (existingProjects.length > 0) {
      project = existingProjects[0];
    } else {
      // Create a maintenance project
      project = await prisma.project.create({
        data: {
          name: `${selectedPlan.name}`,
          organizationId: organization.id,
          status: 'ACTIVE',
          description: 'Maintenance subscription project',
        },
      });
    }

    // Create or get maintenance plan BEFORE checkout
    // This ensures the webhook can find and update it
    let maintenancePlan = await prisma.maintenancePlan.findUnique({
      where: { projectId: project.id },
    });

    // Determine tier based on plan type
    // QUARTERLY = 30 hours/quarter = 10 hours/month average
    // ANNUAL = 120 hours/year = 10 hours/month average
    // Both map to PROFESSIONAL tier (10 hours/month)
    const tier = 'PROFESSIONAL';
    const supportHoursIncluded = 10; // 10 hours per month

    if (!maintenancePlan) {
      maintenancePlan = await prisma.maintenancePlan.create({
        data: {
          projectId: project.id,
          tier: tier,
          supportHoursIncluded: supportHoursIncluded,
          monthlyPrice: new Prisma.Decimal(selectedPlan.price), // Store plan price
          status: 'PAUSED', // Will be activated by webhook when payment succeeds
          billingDay: 1,
          changeRequestsIncluded: -1, // Unlimited change requests
        },
      });
      console.log(`[Maintenance Checkout] Created maintenance plan ${maintenancePlan.id} with tier ${tier}`);
    } else {
      // Update existing plan with new tier and pricing
      maintenancePlan = await prisma.maintenancePlan.update({
        where: { id: maintenancePlan.id },
        data: {
          tier: tier,
          supportHoursIncluded: supportHoursIncluded,
          monthlyPrice: new Prisma.Decimal(selectedPlan.price),
          status: 'PAUSED',
          changeRequestsIncluded: -1,
        },
      });
      console.log(`[Maintenance Checkout] Updated maintenance plan ${maintenancePlan.id} with tier ${tier}`);
    }

    // Create or get Stripe customer
    let stripeCustomerId = organization.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: session.user.email,
        name: session.user.name || undefined,
        metadata: {
          userId: session.user.id,
          organizationId: organization.id,
        },
      });
      stripeCustomerId = customer.id;

      await prisma.organization.update({
        where: { id: organization.id },
        data: { stripeCustomerId },
      });
    }

    // Create Stripe subscription checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: selectedPlan.name,
              description: selectedPlan.description,
            },
            unit_amount: selectedPlan.price,
            recurring: {
              interval: selectedPlan.interval,
              interval_count: selectedPlan.intervalCount,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.AUTH_URL || process.env.NEXTAUTH_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '')}/client/hours?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${process.env.AUTH_URL || process.env.NEXTAUTH_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '')}/client/hours?canceled=true`,
      subscription_data: {
        metadata: {
          maintenancePlanId: maintenancePlan.id,
          projectId: project.id,
          userId: session.user.id,
          organizationId: organization.id,
          planType: plan,
        },
      },
      metadata: {
        userId: session.user.id,
        organizationId: organization.id,
        projectId: project.id,
        maintenancePlanId: maintenancePlan.id,
        planType: plan,
        type: 'maintenance-subscription',
      },
    });

    return NextResponse.json({ 
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });

  } catch (error) {
    console.error('[Maintenance Checkout] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
