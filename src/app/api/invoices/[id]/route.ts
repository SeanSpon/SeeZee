import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { notFound } from "next/navigation";

/**
 * GET /api/invoices/[id]
 * Get invoice details with payment link
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user || !["CEO", "CFO"].includes(session.user.role || "")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            stripeCustomerId: true,
          },
        },
        items: true,
        payments: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Get payment link if invoice is unpaid
    let paymentUrl: string | null = null;
    
    if (invoice.status === "SENT" && invoice.stripeInvoiceId) {
      try {
        // Check if it's a checkout session ID
        const checkoutSession = await stripe.checkout.sessions.retrieve(
          invoice.stripeInvoiceId
        );
        
        if (checkoutSession.url) {
          paymentUrl = checkoutSession.url;
        }
      } catch (error) {
        // If it's not a checkout session, try to create a new one
        if (invoice.status === "SENT") {
          try {
            // Get or create Stripe customer
            let customerId = invoice.project?.stripeCustomerId;
            
            if (!customerId && invoice.organization) {
              // Try to get customer from organization
              const org = await prisma.organization.findUnique({
                where: { id: invoice.organizationId },
                include: {
                  members: {
                    include: {
                      user: true,
                    },
                  },
                },
              });
              
              const owner = org?.members.find(m => m.role === "OWNER");
              if (owner?.user.email) {
                const customer = await stripe.customers.create({
                  email: owner.user.email,
                  name: owner.user.name || undefined,
                  metadata: {
                    organizationId: invoice.organizationId,
                    invoiceId: invoice.id,
                  },
                });
                customerId = customer.id;
                
                // Update project if exists
                if (invoice.projectId) {
                  await prisma.project.update({
                    where: { id: invoice.projectId },
                    data: { stripeCustomerId: customerId },
                  });
                }
              }
            }
            
            if (customerId) {
              // Use invoice items if available, otherwise use total
              const lineItems = invoice.items.length > 0
                ? invoice.items.map((item) => ({
                    price_data: {
                      currency: invoice.currency?.toLowerCase() || "usd",
                      product_data: {
                        name: item.description,
                        description: invoice.description || undefined,
                      },
                      unit_amount: Math.round(Number(item.amount) * 100),
                    },
                    quantity: item.quantity,
                  }))
                : [
                    {
                      price_data: {
                        currency: invoice.currency?.toLowerCase() || "usd",
                        product_data: {
                          name: invoice.title,
                          description: invoice.description || undefined,
                        },
                        unit_amount: Math.round(Number(invoice.total) * 100),
                      },
                      quantity: 1,
                    },
                  ];
              
              const checkoutSession = await stripe.checkout.sessions.create({
                customer: customerId,
                mode: "payment",
                line_items: lineItems,
                success_url: `${process.env.NEXTAUTH_URL}/admin/pipeline/invoices/${invoice.id}?payment=success`,
                cancel_url: `${process.env.NEXTAUTH_URL}/admin/pipeline/invoices/${invoice.id}?payment=cancelled`,
                metadata: {
                  invoiceId: invoice.id,
                  invoiceNumber: invoice.number,
                  projectId: invoice.projectId || "",
                },
                payment_intent_data: {
                  metadata: {
                    invoiceId: invoice.id,
                    invoiceNumber: invoice.number,
                  },
                },
              });
              
              paymentUrl = checkoutSession.url;
              
              // Update invoice with new checkout session ID
              await prisma.invoice.update({
                where: { id: invoice.id },
                data: { stripeInvoiceId: checkoutSession.id },
              });
            }
          } catch (error) {
            console.error("Failed to create checkout session:", error);
          }
        }
      }
    }

    // For paid invoices, show Stripe invoice URL if available
    let stripeInvoiceUrl: string | null = null;
    if (invoice.status === "PAID" && invoice.stripeInvoiceId) {
      try {
        // Try to retrieve as a Stripe invoice
        const stripeInvoice = await stripe.invoices.retrieve(invoice.stripeInvoiceId);
        stripeInvoiceUrl = stripeInvoice.hosted_invoice_url || stripeInvoice.invoice_pdf || null;
      } catch (error) {
        // Not a Stripe invoice ID, that's okay
      }
    }

    // Calculate subtotal from items
    const subtotal = invoice.items.reduce((sum, item) => sum + Number(item.amount), 0);
    const total = Number(invoice.total);
    const tax = total - subtotal;
    
    return NextResponse.json({
      invoice: {
        ...invoice,
        amount: subtotal,
        total: total,
        tax: tax,
      },
      paymentUrl,
      stripeInvoiceUrl,
    });
  } catch (error: any) {
    console.error("[GET /api/invoices/[id]]", error);
    return NextResponse.json(
      { error: "Failed to fetch invoice" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/invoices/[id]
 * Update invoice status
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user || !["CEO", "CFO"].includes(session.user.role || "")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    // Fetch existing invoice to check if it needs paidAt update
    const existingInvoice = await prisma.invoice.findUnique({
      where: { id },
      select: { paidAt: true },
    });

    if (!existingInvoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        status,
        ...(status === "PAID" && !existingInvoice.paidAt
          ? { paidAt: new Date() }
          : {}),
      },
    });

    return NextResponse.json({ invoice });
  } catch (error: any) {
    console.error("[PATCH /api/invoices/[id]]", error);
    return NextResponse.json(
      { error: "Failed to update invoice" },
      { status: 500 }
    );
  }
}

