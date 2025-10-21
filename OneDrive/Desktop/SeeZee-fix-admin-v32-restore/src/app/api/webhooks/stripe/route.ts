import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'
import { headers } from 'next/headers'
import { Prisma, ProjectStatus, InvoiceStatus, PaymentStatus, LeadStatus } from '@prisma/client'

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
        await handleInvoicePaid(event.data.object as Stripe.Invoice)
        break
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
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
  const metadata = session.metadata!
  const leadId = metadata.lead_id
  const quoteId = metadata.quote_id
  const fullAmount = parseFloat(metadata.full_amount)
  const depositAmount = parseFloat(metadata.deposit_amount)

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

    // Create notification for client
    await prisma.notification.create({
      data: {
        title: 'Welcome to SeeZee Studio!',
        message: `Your project has been successfully created. We'll be in touch within 24 hours to schedule your kick-off call.`,
        type: 'SUCCESS',
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

    const dbInvoice = await prisma.invoice.findFirst({
      where: { stripeInvoiceId }
    })

    if (dbInvoice) {
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

      console.log('Invoice marked as paid:', dbInvoice.id)
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