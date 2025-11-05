import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { feedHelpers } from "@/lib/feed/emit";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

/**
 * POST /api/invoices
 * Create a Stripe checkout session for project invoice (deposit or final)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || !["CEO", "ADMIN"].includes(session.user.role || "")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { projectId, amountCents, label = "payment", description } = body;

    if (!projectId || !amountCents) {
      return NextResponse.json(
        { error: "projectId and amountCents required" },
        { status: 400 }
      );
    }

    // Get project and organization
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        organization: {
          include: {
            members: {
              where: { role: "OWNER" },
              take: 1,
              include: { user: true },
            },
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Get or create Stripe customer
    let customerId = project.stripeCustomerId;
    
    if (!customerId) {
      const ownerEmail = project.organization.members[0]?.user?.email;
      if (!ownerEmail) {
        return NextResponse.json(
          { error: "No owner email found for organization" },
          { status: 400 }
        );
      }

      const customer = await stripe.customers.create({
        email: ownerEmail,
        metadata: {
          projectId: project.id,
          organizationId: project.organizationId,
        },
      });

      customerId = customer.id;
      
      // Update project with customer ID
      await prisma.project.update({
        where: { id: projectId },
        data: { stripeCustomerId: customerId },
      });
    }

    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: description || `${label === "deposit" ? "Deposit" : "Payment"} for ${project.name}`,
              description: `Project: ${project.name}`,
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL}/admin/pipeline/projects/${projectId}?payment=success`,
      cancel_url: `${process.env.NEXTAUTH_URL}/admin/pipeline/projects/${projectId}?payment=cancelled`,
      metadata: {
        projectId,
        label, // 'deposit' or 'final'
      },
    });

    // Create invoice record
    const invoice = await prisma.invoice.create({
      data: {
        number: `INV-${Date.now()}`,
        title: description || `${label === "deposit" ? "Deposit" : "Payment"} - ${project.name}`,
        description: description,
        amount: amountCents / 100, // Convert to dollars
        total: amountCents / 100,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
        status: "SENT",
        organizationId: project.organizationId,
        projectId: project.id,
        stripeInvoiceId: checkoutSession.id,
        sentAt: new Date(),
      },
    });

    // Emit feed event
    await feedHelpers.invoiceCreated(projectId, invoice.id, amountCents / 100);

    return NextResponse.json({
      url: checkoutSession.url,
      invoiceId: invoice.id,
    });
  } catch (error) {
    console.error("[Create Invoice Error]", error);
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}
