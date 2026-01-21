/**
 * UNIFIED INVOICE SYSTEM
 * 
 * This replaces all the scattered invoice creation functions with ONE unified approach.
 * No more confusion about which endpoint or function to use!
 * 
 * REPLACES:
 * - /api/invoices/route.ts
 * - /api/invoices/create-final/route.ts
 * - /api/invoices/create-from-request/route.ts
 * - /api/admin/invoices/route.ts
 * - createInvoiceFromProject
 * - createInvoiceWithLineItems
 * - createAndSendInvoice
 */

import { db } from "@/server/db";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  rate: number; // In dollars (will be converted to cents for Stripe)
}

export interface CreateInvoiceOptions {
  // Who is being invoiced
  organizationId: string;
  projectId?: string;
  
  // Invoice details
  title: string;
  description?: string;
  items: InvoiceLineItem[];
  dueDate: Date;
  
  // Optional metadata (replaces the old invoiceType, isFirstInvoice, etc.)
  metadata?: {
    invoiceType?: "deposit" | "final" | "subscription" | "maintenance" | "custom";
    isFirstInvoice?: boolean;
    projectPhase?: string;
    milestoneId?: string;
    [key: string]: any;
  };
  
  // Internal notes (not visible to client)
  internalNotes?: string;
  
  // Auto-send via Stripe?
  autoSend?: boolean;
  
  // Custom due date offset (days from now)
  daysUntilDue?: number;
}

export interface CreateInvoiceResult {
  success: boolean;
  invoice?: any;
  paymentUrl?: string | null;
  error?: string;
}

/**
 * ONE FUNCTION TO RULE THEM ALL
 * 
 * Creates an invoice in the database and optionally sends it via Stripe.
 * Handles all invoice types uniformly.
 */
export async function createUnifiedInvoice(
  options: CreateInvoiceOptions
): Promise<CreateInvoiceResult> {
  try {
    // Validate organization exists
    const organization = await db.organization.findUnique({
      where: { id: options.organizationId },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!organization) {
      return { success: false, error: "Organization not found" };
    }

    // Validate project if provided
    if (options.projectId) {
      const project = await db.project.findUnique({
        where: { id: options.projectId },
      });

      if (!project) {
        return { success: false, error: "Project not found" };
      }

      if (project.organizationId !== options.organizationId) {
        return { success: false, error: "Project does not belong to this organization" };
      }
    }

    // Calculate totals
    const subtotal = options.items.reduce(
      (sum, item) => sum + item.quantity * item.rate,
      0
    );

    // Generate invoice number
    const invoiceCount = await db.invoice.count();
    const invoiceNumber = `INV-${String(invoiceCount + 1).padStart(5, "0")}`;

    // Create invoice in database
    const invoice = await db.invoice.create({
      data: {
        number: invoiceNumber,
        title: options.title,
        description: options.description,
        status: options.autoSend ? "SENT" : "DRAFT",
        organizationId: options.organizationId,
        projectId: options.projectId,
        total: subtotal,
        currency: "USD",
        dueDate: options.dueDate,
        sentAt: options.autoSend ? new Date() : null,
        metadata: options.metadata || {},
        internalNotes: options.internalNotes,
        items: {
          create: options.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.quantity * item.rate,
          })),
        },
      },
      include: {
        items: true,
        organization: true,
        project: true,
      },
    });

    // If autoSend, create and send Stripe invoice
    let paymentUrl: string | null | undefined;
    
    if (options.autoSend) {
      try {
        const stripeResult = await sendInvoiceViaStripe(invoice, options);
        if (stripeResult.success) {
          paymentUrl = stripeResult.paymentUrl ?? undefined;
          
          // Update invoice with Stripe info
          await db.invoice.update({
            where: { id: invoice.id },
            data: {
              stripeInvoiceId: stripeResult.stripeInvoiceId,
              stripePaymentUrl: paymentUrl || null,
            },
          });
        } else {
          console.error("Failed to send via Stripe:", stripeResult.error);
          // Don't fail the whole operation - invoice is still created
        }
      } catch (stripeError) {
        console.error("Stripe integration error:", stripeError);
        // Continue - invoice exists in our DB even if Stripe fails
      }
    }

    return {
      success: true,
      invoice,
      paymentUrl,
    };
  } catch (error: any) {
    console.error("Failed to create invoice:", error);
    return {
      success: false,
      error: error.message || "Failed to create invoice",
    };
  }
}

/**
 * Helper: Send invoice via Stripe
 */
async function sendInvoiceViaStripe(
  invoice: any,
  options: CreateInvoiceOptions
) {
  try {
    const organization = invoice.organization;

    // Get or create Stripe customer
    let stripeCustomerId = organization.stripeCustomerId;

    if (!stripeCustomerId) {
      const ownerEmail = organization.members[0]?.user?.email;
      if (!ownerEmail) {
        return {
          success: false,
          error: "No email found for organization owner",
        };
      }

      const customer = await stripe.customers.create({
        email: ownerEmail,
        name: organization.name,
        metadata: {
          organizationId: organization.id,
          projectId: invoice.projectId || "",
        },
      });

      stripeCustomerId = customer.id;

      // Update organization with Stripe customer ID
      await db.organization.update({
        where: { id: organization.id },
        data: { stripeCustomerId: customer.id },
      });
    }

    // Create Stripe invoice items
    for (const item of invoice.items) {
      const product = await stripe.products.create({
        name: item.description,
        metadata: {
          invoiceId: invoice.id,
          projectId: invoice.projectId || "",
        },
      });

      const price = await stripe.prices.create({
        unit_amount: Math.round(item.rate * 100), // Convert to cents
        currency: "usd",
        product: product.id,
      });

      await stripe.invoiceItems.create({
        customer: stripeCustomerId,
        price: price.id,
        quantity: item.quantity,
        description: item.description,
      });
    }

    // Prepare metadata for Stripe (convert all values to string/number/null)
    const stripeMetadata: Record<string, string | number | null> = {
      invoiceId: invoice.id,
      invoiceNumber: invoice.number,
      projectId: invoice.projectId || "",
    };
    
    // Add custom metadata, converting booleans to strings
    if (options.metadata) {
      Object.entries(options.metadata).forEach(([key, value]) => {
        if (typeof value === 'boolean') {
          stripeMetadata[key] = value.toString();
        } else if (typeof value === 'string' || typeof value === 'number' || value === null) {
          stripeMetadata[key] = value;
        } else if (value !== undefined) {
          stripeMetadata[key] = String(value);
        }
      });
    }

    // Create and finalize Stripe invoice
    const stripeInvoice = await stripe.invoices.create({
      customer: stripeCustomerId,
      collection_method: "send_invoice",
      days_until_due: options.daysUntilDue || 7,
      description: invoice.description || invoice.title,
      metadata: stripeMetadata,
    });

    const finalizedInvoice = await stripe.invoices.finalizeInvoice(
      stripeInvoice.id
    );

    return {
      success: true,
      stripeInvoiceId: finalizedInvoice.id,
      paymentUrl: finalizedInvoice.hosted_invoice_url,
    };
  } catch (error: any) {
    console.error("Stripe error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * CONVENIENCE FUNCTIONS
 * Quick wrappers for common invoice types
 */

export async function createDepositInvoice(
  organizationId: string,
  projectId: string,
  totalProjectCost: number,
  dueDate?: Date
) {
  const depositAmount = totalProjectCost * 0.5; // 50% deposit

  return createUnifiedInvoice({
    organizationId,
    projectId,
    title: "Project Deposit (50%)",
    description: "Initial deposit to begin project work",
    items: [
      {
        description: "50% Project Deposit",
        quantity: 1,
        rate: depositAmount,
      },
    ],
    dueDate: dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    metadata: {
      invoiceType: "deposit",
      isFirstInvoice: true,
    },
    autoSend: true,
  });
}

export async function createFinalInvoice(
  organizationId: string,
  projectId: string,
  totalProjectCost: number,
  dueDate?: Date
) {
  const finalAmount = totalProjectCost * 0.5; // Remaining 50%

  return createUnifiedInvoice({
    organizationId,
    projectId,
    title: "Final Project Payment (50%)",
    description: "Final payment for completed project",
    items: [
      {
        description: "Final Project Payment (50%)",
        quantity: 1,
        rate: finalAmount,
      },
    ],
    dueDate: dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    metadata: {
      invoiceType: "final",
    },
    autoSend: true,
  });
}

export async function createMaintenanceInvoice(
  organizationId: string,
  projectId: string,
  monthlyRate: number,
  dueDate?: Date
) {
  return createUnifiedInvoice({
    organizationId,
    projectId,
    title: `Maintenance Plan - ${new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}`,
    description: "Monthly maintenance and support services",
    items: [
      {
        description: "Monthly Maintenance Plan",
        quantity: 1,
        rate: monthlyRate,
      },
    ],
    dueDate: dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    metadata: {
      invoiceType: "maintenance",
    },
    autoSend: true,
  });
}

export async function createCustomInvoice(
  organizationId: string,
  projectId: string | undefined,
  title: string,
  items: InvoiceLineItem[],
  options?: {
    description?: string;
    dueDate?: Date;
    autoSend?: boolean;
    metadata?: any;
  }
) {
  return createUnifiedInvoice({
    organizationId,
    projectId,
    title,
    description: options?.description,
    items,
    dueDate: options?.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    metadata: {
      invoiceType: "custom",
      ...options?.metadata,
    },
    autoSend: options?.autoSend !== false, // Default to true
  });
}
