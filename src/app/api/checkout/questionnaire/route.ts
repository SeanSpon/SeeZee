import { NextRequest, NextResponse } from 'next/server';
import { getQuestionnaireWithPricing } from '@/lib/questionnaire';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const questionnaireId = formData.get('questionnaireId') as string;
    const amount = parseInt(formData.get('amount') as string);

    if (!questionnaireId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get questionnaire data
    const questionnaire = await getQuestionnaireWithPricing(questionnaireId);

    if (!questionnaire) {
      return NextResponse.json(
        { error: 'Questionnaire not found' },
        { status: 404 }
      );
    }

    const { data, estimate, deposit } = questionnaire;

    // Create or retrieve Stripe customer
    let customer: Stripe.Customer;
    const email = data.email as string;

    if (email) {
      const existingCustomers = await stripe.customers.list({
        email,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0];
      } else {
        customer = await stripe.customers.create({
          email,
          name: data.name as string,
          phone: data.phone as string,
          metadata: {
            questionnaireId,
          },
        });
      }
    } else {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Project Deposit',
              description: `Deposit for your ${(data.projectTypes as string[])?.join(', ')} project`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      success_url: `${request.nextUrl.origin}/client?first=true&qs=${questionnaireId}`,
      cancel_url: `${request.nextUrl.origin}/questionnaire/summary`,
      metadata: {
        questionnaireId,
        type: 'deposit',
        estimate: estimate?.toString() || '',
      },
    });

    // Redirect to Stripe Checkout
    return NextResponse.redirect(session.url!);
  } catch (error) {
    console.error('Checkout session error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
