import { NextRequest, NextResponse } from 'next/server';
import { getQuestionnaireWithPricing } from '@/lib/questionnaire';
import Stripe from 'stripe';
import { z } from 'zod';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const QuestionnaireDataSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().optional(),
  phone: z.string().optional(),
  projectTypes: z.array(z.string()).optional(),
  companyName: z.string().optional(),
  budget: z.string().optional(),
  timeline: z.string().optional(),
  description: z.string().optional(),
  features: z.array(z.string()).optional(),
  additionalInfo: z.string().optional(),
});

export async function POST(request: NextRequest) {
  // Disabled: This route bypasses lead/project creation
  // Projects must be created manually through the admin dashboard
  return NextResponse.json(
    { 
      error: 'This checkout route is disabled. Please create a project through the admin dashboard and send an invoice manually.',
      message: 'Manual project creation is required. Contact an admin to create your project.'
    },
    { status: 410 } // 410 Gone - indicates the resource is no longer available
  );
  
  /* DISABLED CODE - Keeping for reference
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

    if (!data) {
      return NextResponse.json(
        { error: 'Invalid questionnaire data' },
        { status: 400 }
      );
    }

    // Validate and parse questionnaire data with Zod
    const parsedData = QuestionnaireDataSchema.safeParse(data);
    
    if (!parsedData.success) {
      return NextResponse.json(
        { error: 'Invalid questionnaire data format' },
        { status: 400 }
      );
    }

    const { email = '', name = '', phone = '', projectTypes = [] } = parsedData.data;

    // Create or retrieve Stripe customer
    let customer: Stripe.Customer;

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
          name,
          phone,
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
              description: `Deposit for your ${projectTypes.join(', ')} project`,
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
  */
}
