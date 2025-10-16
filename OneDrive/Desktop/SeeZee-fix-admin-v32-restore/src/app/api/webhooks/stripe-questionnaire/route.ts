import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const sig = headersList.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Get questionnaire ID from client_reference_id or metadata
      const qid = session.client_reference_id || session.metadata?.qid;
      
      if (qid) {
        try {
          // Get questionnaire
          const questionnaire = await prisma.questionnaire.findUnique({
            where: { id: qid },
          });

          if (questionnaire) {
            const data = questionnaire.data as any;
            const { contact, selectedService, totals, questionnaire: answers } = data;

            // Update questionnaire status
            await prisma.questionnaire.update({
              where: { id: qid },
              data: {
                data: {
                  ...data,
                  status: 'PAYMENT_COMPLETE',
                  paidAt: new Date().toISOString(),
                },
              },
            });

            // Create user if doesn't exist
            let user = await prisma.user.findUnique({
              where: { email: contact.email },
            });

            if (!user) {
              user = await prisma.user.create({
                data: {
                  name: contact.name,
                  email: contact.email,
                  phone: contact.phone || null,
                  company: contact.company || null,
                  role: 'CLIENT',
                },
              });
            }

            // Find or create organization if company provided
            let organizationId: string | undefined;
            if (contact.company) {
              const orgSlug = contact.company
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '');
              
              let org = await prisma.organization.findUnique({
                where: { slug: orgSlug },
              });

              if (!org) {
                org = await prisma.organization.create({
                  data: {
                    name: contact.company,
                    slug: orgSlug,
                    email: contact.email,
                    phone: contact.phone || null,
                    website: contact.website || null,
                  },
                });

                // Add user as organization owner
                await prisma.organizationMember.create({
                  data: {
                    organizationId: org.id,
                    userId: user.id,
                    role: 'OWNER',
                  },
                });
              }

              organizationId = org.id;
            }

            // Create project
            const project = await prisma.project.create({
              data: {
                name: `${selectedService} for ${contact.company || contact.name}`,
                description: answers?.goals?.join(', ') || 'New project from questionnaire',
                status: 'PAID',
                questionnaireId: qid,
                organizationId: organizationId,
                stripeCustomerId: session.customer as string,
                budget: totals.total ? (totals.total / 100).toString() : undefined,
              },
            });

            console.log('Project created:', project.id);

            // TODO: Send confirmation email to client
            // TODO: Send notification email to admin team
          }
        } catch (error) {
          console.error('Error processing payment:', error);
        }
      }
      break;
    }

    case 'checkout.session.expired':
    case 'checkout.session.async_payment_failed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const qid = session.client_reference_id || session.metadata?.qid;

      if (qid) {
        try {
          const questionnaire = await prisma.questionnaire.findUnique({
            where: { id: qid },
          });

          if (questionnaire) {
            const data = questionnaire.data as any;
            
            await prisma.questionnaire.update({
              where: { id: qid },
              data: {
                data: {
                  ...data,
                  status: 'PAYMENT_FAILED',
                  failedAt: new Date().toISOString(),
                },
              },
            });
          }
        } catch (error) {
          console.error('Error updating failed payment:', error);
        }
      }
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

