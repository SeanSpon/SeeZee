import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(req: NextRequest) {
  try {
    const { qid } = await req.json();

    if (!qid) {
      return NextResponse.json({ error: 'Missing qid' }, { status: 400 });
    }

    // Get questionnaire
    const questionnaire = await prisma.questionnaire.findUnique({
      where: { id: qid },
    });

    if (!questionnaire) {
      return NextResponse.json({ error: 'Questionnaire not found' }, { status: 404 });
    }

    const data = questionnaire.data as any;
    const { contact, totals, selectedService } = data;

    if (!contact?.email) {
      return NextResponse.json({ error: 'Missing contact info' }, { status: 400 });
    }

    // Create or retrieve Stripe customer
    let customer: Stripe.Customer;
    const existingCustomers = await stripe.customers.list({
      email: contact.email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: contact.email,
        name: contact.name,
        phone: contact.phone,
        metadata: {
          qid,
          company: contact.company || '',
        },
      });
    }

    // Build line items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    // Base service
    if (totals.base > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${selectedService} Development`,
            description: 'Base service fee',
          },
          unit_amount: totals.base,
        },
        quantity: 1,
      });
    }

    // Add-ons
    if (totals.addons > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Additional Features',
            description: 'Selected add-on features',
          },
          unit_amount: totals.addons,
        },
        quantity: 1,
      });
    }

    // Rush fee
    if (totals.rush > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Rush Delivery Fee',
            description: '15% expedited delivery fee',
          },
          unit_amount: totals.rush,
        },
        quantity: 1,
      });
    }

    // Monthly recurring (if applicable)
    if (totals.recurring > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Monthly Maintenance',
            description: 'Recurring monthly service',
          },
          unit_amount: totals.recurring,
          recurring: {
            interval: 'month',
          },
        },
        quantity: 1,
      });
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      mode: totals.recurring > 0 ? 'subscription' : 'payment',
      line_items: lineItems,
      success_url: `${process.env.NEXTAUTH_URL}/start/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/start?q=${qid}`,
      client_reference_id: qid,
      metadata: {
        qid,
        service: selectedService,
      },
      payment_intent_data: totals.recurring === 0 ? {
        metadata: {
          qid,
          service: selectedService,
        },
      } : undefined,
    });

    // Update questionnaire with session ID and status
    await prisma.questionnaire.update({
      where: { id: qid },
      data: {
        data: {
          ...data,
          status: 'CHECKOUT_INITIATED',
          stripeSessionId: session.id,
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout session error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
