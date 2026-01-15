import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { InvoiceDetailClient } from "@/components/admin/InvoiceDetailClient";
import { toPlain } from "@/lib/serialize";
import { toStripeCents } from "@/lib/currency";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function InvoiceDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();

    if (!session?.user || !["CEO", "CFO"].includes(session.user.role || "")) {
    redirect("/login");
  }

  // Fetch invoice directly from database
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
    notFound();
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
                    unit_amount: toStripeCents(item.amount.toString()),
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
                      unit_amount: toStripeCents(invoice.total.toString()),
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

  const plainInvoice = toPlain(invoice);

  return (
    <InvoiceDetailClient
      invoice={{
        ...plainInvoice,
        amount: Number(plainInvoice.amount),
        total: Number(plainInvoice.total),
        tax: plainInvoice.tax ? Number(plainInvoice.tax) : 0,
        items: plainInvoice.items.map((item: any) => ({
          ...item,
          rate: Number(item.rate),
          amount: Number(item.amount),
        })),
        payments: plainInvoice.payments.map((payment: any) => ({
          ...payment,
          amount: Number(payment.amount),
        })),
      }}
      paymentUrl={paymentUrl}
      stripeInvoiceUrl={stripeInvoiceUrl}
    />
  );
}

