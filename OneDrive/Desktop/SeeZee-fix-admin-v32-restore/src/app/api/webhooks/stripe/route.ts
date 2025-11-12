import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'
import { headers } from 'next/headers'
import { Prisma, ProjectStatus, InvoiceStatus, PaymentStatus, LeadStatus } from '@prisma/client'
import { feedHelpers } from '@/lib/feed/emit'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const sig = headersList.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  // Check for duplicate events
  const existingEvent = await prisma.webhookEvent.findUnique({
    where: { eventId: event.id }
  })

  if (existingEvent && existingEvent.processed) {
    console.log('Event already processed:', event.id)
    return NextResponse.json({ received: true })
  }

  // Store the webhook event
  await prisma.webhookEvent.upsert({
    where: { eventId: event.id },
    update: {},
    create: {
      eventId: event.id,
      type: event.type,
      data: event.data as any,
      processed: false,
    }
  })

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break
      case 'invoice.paid':
      case 'invoice.payment_succeeded':
        await handleInvoicePaid(event.data.object as Stripe.Invoice)
        break
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    // Mark event as processed
    await prisma.webhookEvent.update({
      where: { eventId: event.id },
      data: { processed: true }
    })

  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const metadata = session.metadata || {}
  const invoiceId = metadata.invoiceId || metadata.invoice_id
  
  // Handle invoice payment from pipeline
  if (invoiceId) {
    try {
      const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: {
          project: {
            select: {
              id: true,
              status: true,
            },
          },
          organization: true,
        },
      })

      if (!invoice) {
        console.error(`Invoice not found: ${invoiceId}`)
        return
      }

      // Update invoice status to PAID
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          status: InvoiceStatus.PAID,
          paidAt: new Date(),
          stripeInvoiceId: session.id, // Store checkout session ID
        },
      })

      // Get payment amount from session
      const amountTotal = session.amount_total ? session.amount_total / 100 : Number(invoice.total)
      const currency = session.currency?.toUpperCase() || invoice.currency || 'USD'

      // Create payment record
      await prisma.payment.create({
        data: {
          amount: amountTotal,
          currency: currency,
          status: PaymentStatus.COMPLETED,
          method: 'stripe',
          stripePaymentId: session.payment_intent as string,
          invoiceId: invoice.id,
          processedAt: new Date(),
        },
      })

      // Update project status if applicable
      if (invoice.projectId && invoice.project) {
        const project = invoice.project
        
        // If project is in LEAD status, update to PAID
        if (project.status === ProjectStatus.LEAD) {
          await prisma.project.update({
            where: { id: invoice.projectId },
            data: { status: ProjectStatus.PAID },
          })
          
          // Emit status change event
          await feedHelpers.statusChanged(invoice.projectId, ProjectStatus.LEAD, ProjectStatus.PAID)
        }

        // Emit payment succeeded event
        await feedHelpers.paymentSucceeded(invoice.projectId, amountTotal, invoice.id)
      }

      // Calculate project payouts when client pays
      if (invoice.projectId) {
        const { calculateProjectPayouts } = await import("@/lib/payouts")
        await calculateProjectPayouts(invoice.projectId)
      }

      // Revalidate invoice pages
      const { revalidatePath } = await import("next/cache")
      revalidatePath("/admin/pipeline/invoices")
      revalidatePath(`/admin/pipeline/invoices/${invoiceId}`)
      revalidatePath("/admin/pipeline")

      console.log('Successfully processed invoice payment:', {
        invoiceId,
        amount: amountTotal,
        projectId: invoice.projectId,
      })

      return
    } catch (error) {
      console.error('Error processing invoice payment:', error)
      throw error
    }
  }

  // Handle lead/quote payment (existing logic)
  const leadId = metadata.lead_id
  const quoteId = metadata.quote_id
  const fullAmount = parseFloat(metadata.full_amount || '0')
  const depositAmount = parseFloat(metadata.deposit_amount || '0')

  if (!leadId) {
    console.warn('Checkout session missing both invoiceId and lead_id in metadata')
    return
  }

  try {
    // Get the lead
    const lead = await prisma.lead.findUnique({
      where: { id: leadId }
    })

    if (!lead) {
      throw new Error(`Lead not found: ${leadId}`)
    }

    // Create or get organization for the customer
    const orgSlug = `${lead.company || lead.name}`.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    
    const organization = await prisma.organization.upsert({
      where: { slug: orgSlug },
      update: {},
      create: {
        name: lead.company || `${lead.name}'s Organization`,
        slug: orgSlug,
        email: lead.email,
        phone: lead.phone,
      }
    })

    // Create user account for the client
    const user = await prisma.user.upsert({
      where: { email: lead.email },
      update: {},
      create: {
        email: lead.email,
        name: lead.name,
        role: 'CLIENT',
        emailVerified: new Date(),
      }
    })

    // Add user to organization
    await prisma.organizationMember.upsert({
      where: {
        organizationId_userId: {
          organizationId: organization.id,
          userId: user.id,
        }
      },
      update: {},
      create: {
        organizationId: organization.id,
        userId: user.id,
        role: 'OWNER',
      }
    })

    // Create project
    const project = await prisma.project.create({
      data: {
        name: `${metadata.service_type.charAt(0).toUpperCase() + metadata.service_type.slice(1)} Development Project`,
        description: `${metadata.service_type} development project for ${organization.name}`,
        organizationId: organization.id,
        leadId: leadId,
        budget: fullAmount,
        status: ProjectStatus.PAID,
        milestones: {
          create: [
            {
              title: 'Project Planning & Design',
              description: 'Initial consultation, requirements gathering, and design mockups',
              dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
            },
            {
              title: 'Development Phase',
              description: 'Core development and feature implementation',
              dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 3 weeks
            },
            {
              title: 'Testing & Launch',
              description: 'Quality testing, optimization, and project launch',
              dueDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000), // 4 weeks
            },
          ]
        }
      }
    })

    // Create invoice for deposit
    const depositInvoice = await prisma.invoice.create({
      data: {
        number: `INV-${Date.now()}-DEP`,
        title: 'Project Deposit',
        description: `50% deposit for ${metadata.service_type} development project`,
        amount: depositAmount,
        tax: 0,
        total: depositAmount,
        status: InvoiceStatus.PAID,
        organizationId: organization.id,
        projectId: project.id,
        stripeInvoiceId: session.invoice as string,
        sentAt: new Date(),
        paidAt: new Date(),
        dueDate: new Date(),
        items: {
          create: {
            description: `${metadata.service_type} Development - Deposit (50%)`,
            quantity: 1,
            rate: depositAmount,
            amount: depositAmount,
          }
        }
      }
    })

    // Create payment record
    await prisma.payment.create({
      data: {
        amount: depositAmount,
        currency: 'USD',
        status: PaymentStatus.COMPLETED,
        method: 'stripe',
        stripePaymentId: session.payment_intent as string,
        invoiceId: depositInvoice.id,
        processedAt: new Date(),
      }
    })

    // Create remaining balance invoice
    const remainingAmount = fullAmount - depositAmount
    if (remainingAmount > 0) {
      await prisma.invoice.create({
        data: {
          number: `INV-${Date.now()}-BAL`,
          title: 'Project Balance',
          description: `Remaining balance for ${metadata.service_type} development project`,
          amount: remainingAmount,
          tax: 0,
          total: remainingAmount,
          status: InvoiceStatus.DRAFT,
          organizationId: organization.id,
          projectId: project.id,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          items: {
            create: {
              description: `${metadata.service_type} Development - Final Payment (50%)`,
              quantity: 1,
              rate: remainingAmount,
              amount: remainingAmount,
            }
          }
        }
      })
    }

    // Update lead status
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        status: LeadStatus.CONVERTED,
        convertedAt: new Date(),
        organizationId: organization.id,
      }
    })

    // Emit feed events
    await feedHelpers.projectCreated(project.id, project.name);
    await feedHelpers.paymentSucceeded(project.id, depositAmount, depositInvoice.id);

    // Calculate project payouts when client pays (deposit)
    const { calculateProjectPayouts } = await import("@/lib/payouts");
    await calculateProjectPayouts(project.id);

    // Create a client task for detailed project questionnaire
    await prisma.clientTask.create({
      data: {
        projectId: project.id,
        title: 'Complete Project Details Questionnaire',
        description: 'Please complete this questionnaire to help us understand your project requirements better. This will include details about your target audience, brand preferences, must-have features, and more.',
        type: 'questionnaire',
        status: 'pending',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      }
    })

    // Create notification for client
    await prisma.notification.create({
      data: {
        title: 'Welcome to SeeZee Studio!',
        message: `Your project has been successfully created. We'll be in touch within 24 hours to schedule your kick-off call.`,
        type: 'SUCCESS',
        userId: user.id,
      }
    })

    // Create notification for questionnaire task
    await prisma.notification.create({
      data: {
        title: 'Action Required: Complete Project Questionnaire',
        message: `Please complete the project details questionnaire in your dashboard to help us get started on your project.`,
        type: 'INFO',
        userId: user.id,
      }
    })

    console.log('Successfully processed checkout completion:', {
      leadId,
      organizationId: organization.id,
      projectId: project.id,
      userId: user.id,
    })

  } catch (error) {
    console.error('Error processing checkout completion:', error)
    throw error
  }
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  try {
    const stripeInvoiceId = invoice.id
    const projectId = invoice.metadata?.projectId
    const label = invoice.metadata?.label // 'deposit' or 'final'

    const dbInvoice = await prisma.invoice.findFirst({
      where: { stripeInvoiceId },
      include: {
        project: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    })

    if (dbInvoice) {
      // Update invoice status
      await prisma.invoice.update({
        where: { id: dbInvoice.id },
        data: {
          status: InvoiceStatus.PAID,
          paidAt: new Date(),
        }
      })

      // Create payment record
      await prisma.payment.create({
        data: {
          amount: invoice.amount_paid / 100, // Convert from cents
          currency: invoice.currency.toUpperCase(),
          status: PaymentStatus.COMPLETED,
          method: 'stripe',
          stripePaymentId: invoice.payment_intent as string,
          invoiceId: dbInvoice.id,
          processedAt: new Date(),
        }
      })

      // Update project status based on invoice type
      if (dbInvoice.projectId && dbInvoice.project) {
        const project = dbInvoice.project
        
        // If this is a deposit invoice and project is PLANNING, update to PAID
        if (label === 'deposit' && project.status === ProjectStatus.PLANNING) {
          await prisma.project.update({
            where: { id: dbInvoice.projectId },
            data: { status: ProjectStatus.PAID },
          })
          
          // Emit status change event
          await feedHelpers.statusChanged(dbInvoice.projectId, ProjectStatus.PLANNING, ProjectStatus.PAID);
        }
        
        // If final invoice paid, status should already be COMPLETED (set by admin)
        // Just ensure it stays as COMPLETED

        // Emit payment succeeded event
        await feedHelpers.paymentSucceeded(dbInvoice.projectId, invoice.amount_paid / 100, dbInvoice.id);
      }

      // Calculate project payouts when client pays
      if (dbInvoice.projectId) {
        const { calculateProjectPayouts } = await import("@/lib/payouts");
        await calculateProjectPayouts(dbInvoice.projectId);
      }

      console.log('Invoice marked as paid:', dbInvoice.id, 'Label:', label)
    }
  } catch (error) {
    console.error('Error processing invoice.paid:', error)
    throw error
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  try {
    const stripeInvoiceId = invoice.id

    const dbInvoice = await prisma.invoice.findFirst({
      where: { stripeInvoiceId }
    })

    if (dbInvoice) {
      await prisma.invoice.update({
        where: { id: dbInvoice.id },
        data: { status: InvoiceStatus.OVERDUE }
      })

      console.log('Invoice marked as overdue:', dbInvoice.id)
    }
  } catch (error) {
    console.error('Error processing invoice.payment_failed:', error)
    throw error
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  try {
    const projectId = subscription.metadata?.projectId;
    const maintenancePlan = subscription.metadata?.maintenancePlan || 'standard';

    if (!projectId) {
      console.warn('Subscription missing projectId in metadata:', subscription.id);
      return;
    }

    const priceId = subscription.items.data[0]?.price.id || '';

    // Create subscription record
    await prisma.subscription.create({
      data: {
        projectId,
        stripeId: subscription.id,
        priceId,
        status: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
    });

    // Update project with subscription details
    await prisma.project.update({
      where: { id: projectId },
      data: {
        stripeSubscriptionId: subscription.id,
        maintenancePlan,
        maintenanceStatus: subscription.status,
        nextBillingDate: new Date(subscription.current_period_end * 1000),
      },
    });

    console.log('Subscription created for project:', projectId, 'Plan:', maintenancePlan);
  } catch (error) {
    console.error('Error handling subscription.created:', error);
    throw error;
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    const projectId = subscription.metadata?.projectId

    if (!projectId) {
      console.warn('Subscription missing projectId in metadata:', subscription.id)
      return
    }

    // Find or create subscription record
    const existingSubscription = await prisma.subscription.findUnique({
      where: { stripeId: subscription.id }
    })

    const priceId = subscription.items.data[0]?.price.id || ''

    if (existingSubscription) {
      await prisma.subscription.update({
        where: { id: existingSubscription.id },
        data: {
          status: subscription.status,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        }
      })

      // Also update project maintenance status
      await prisma.project.update({
        where: { id: projectId },
        data: {
          maintenanceStatus: subscription.status,
          nextBillingDate: new Date(subscription.current_period_end * 1000),
        },
      });
    } else {
      await prisma.subscription.create({
        data: {
          projectId,
          stripeId: subscription.id,
          priceId,
          status: subscription.status,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        }
      })
    }

    console.log('Subscription updated:', subscription.id)
  } catch (error) {
    console.error('Error processing subscription.updated:', error)
    throw error
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    const existingSubscription = await prisma.subscription.findUnique({
      where: { stripeId: subscription.id }
    })

    if (existingSubscription) {
      await prisma.subscription.update({
        where: { id: existingSubscription.id },
        data: { status: 'canceled' }
      })

      console.log('Subscription canceled:', subscription.id)
    }
  } catch (error) {
    console.error('Error processing subscription.deleted:', error)
    throw error
  }
}