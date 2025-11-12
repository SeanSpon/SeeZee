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
 * Create a Stripe Invoice for project (deposit or final payment)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || !["CEO", "CFO"].includes(session.user.role || "")) {
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

    // Create Stripe product for invoice item
    const productName = label === "deposit" 
      ? "Website Project Deposit (50%)" 
      : "Website Project Balance (50%)";
    
    const product = await stripe.products.create({
      name: productName,
      description: description || `${label === "deposit" ? "Deposit" : "Final Payment"} for ${project.name}`,
      metadata: {
        projectId,
        label,
      },
    });

    // Create price for the product
    const price = await stripe.prices.create({
      unit_amount: amountCents,
      currency: "usd",
      product: product.id,
    });

    // Create invoice item
    await stripe.invoiceItems.create({
      customer: customerId,
      price: price.id,
      description: description || `${label === "deposit" ? "50% Deposit" : "Final Payment (50%)"} - ${project.name}`,
    });

    // Create Stripe Invoice
    const stripeInvoice = await stripe.invoices.create({
      customer: customerId,
      collection_method: "send_invoice",
      days_until_due: 7,
      metadata: {
        projectId,
        label, // 'deposit' or 'final'
      },
    });

    // Finalize and send the invoice
    const finalizedInvoice = await stripe.invoices.finalizeInvoice(stripeInvoice.id);

    // Create invoice record in database
    const invoice = await prisma.invoice.create({
      data: {
        number: `INV-${Date.now()}`,
        title: description || `${label === "deposit" ? "Deposit" : "Final Payment"} - ${project.name}`,
        description: description || `${label === "deposit" ? "50% Deposit" : "Final Payment (50%)"} - ${project.name}`,
        amount: amountCents / 100, // Convert to dollars
        total: amountCents / 100,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        status: "SENT",
        organizationId: project.organizationId,
        projectId: project.id,
        stripeInvoiceId: finalizedInvoice.id,
        sentAt: new Date(),
        items: {
          create: {
            description: `${label === "deposit" ? "50% Deposit" : "Final Payment (50%)"} - ${project.name}`,
            quantity: 1,
            rate: amountCents / 100,
            amount: amountCents / 100,
          },
        },
      },
    });

    // Emit feed event
    await feedHelpers.invoiceCreated(projectId, invoice.id, amountCents / 100);

    return NextResponse.json({
      url: finalizedInvoice.hosted_invoice_url,
      invoiceId: invoice.id,
      invoiceUrl: finalizedInvoice.hosted_invoice_url,
    });
  } catch (error) {
    console.error("[Create Invoice Error]", error);
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}
