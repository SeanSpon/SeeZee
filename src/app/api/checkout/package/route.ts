import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';
import { getPackage, getFeature, MAINTENANCE } from '@/lib/qwiz/packages';
import { calculateTotals } from '@/lib/qwiz/pricing';
import type { PackageTier } from '@/lib/qwiz/packages';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(req: NextRequest) {
  try {
    const { packageId, features, email } = await req.json();

    if (!packageId) {
      return NextResponse.json({ error: 'Missing package' }, { status: 400 });
    }

    // Calculate totals
    const totals = calculateTotals({
      package: packageId as PackageTier,
      selectedFeatures: features || [],
      rush: false,
    });

    const pkg = getPackage(packageId as PackageTier);

    // Build line items for Stripe - charge deposit upfront
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    
    // Deposit (25% or $250 minimum) - charge this upfront
    const depositAmount = totals.deposit;
    
    // Add deposit as a line item
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: `${pkg.title} Package - Project Deposit`,
          description: `Deposit to start your ${pkg.title} package project (${pkg.description}). Total project cost: ${(totals.total / 100).toFixed(2)}. Remaining balance will be invoiced after project completion.`,
        },
        unit_amount: depositAmount,
      },
      quantity: 1,
    });

    // Create or get Stripe customer if email provided
    let customerId: string | undefined;
    if (email) {
      const existingCustomers = await stripe.customers.list({
        email,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        customerId = existingCustomers.data[0].id;
      } else {
        const customer = await stripe.customers.create({
          email,
          metadata: {
            package: packageId,
          },
        });
        customerId = customer.id;
      }
    }

    // Create Stripe checkout session - charge deposit now
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'payment', // One-time payment for deposit
      line_items: lineItems,
      payment_intent_data: {
        metadata: {
          package: packageId,
          package_base: totals.packageBase.toString(),
          addons: totals.addons.toString(),
          deposit: depositAmount.toString(),
          total: totals.total.toString(),
          features: JSON.stringify(features || []),
          maintenance: totals.monthly.toString(),
        },
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL}/start/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL}/start`,
      metadata: {
        package: packageId,
        package_base: totals.packageBase.toString(),
        addons: totals.addons.toString(),
        deposit: depositAmount.toString(),
        total: totals.total.toString(),
        features: JSON.stringify(features || []),
        maintenance: totals.monthly.toString(),
      },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Package checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

