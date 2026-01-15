import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { feedHelpers } from "@/lib/feed/emit";
import Stripe from "stripe";
import { ProjectStatus } from "@prisma/client";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

/**
 * Create final invoice (50% balance) when project is completed
 */
async function createFinalInvoice(projectId: string, projectTotal: number) {
  try {
    // Check if final invoice already exists
    const existingFinalInvoice = await prisma.invoice.findFirst({
      where: {
        projectId,
        title: {
          contains: "Final Payment",
        },
      },
    });

    if (existingFinalInvoice) {
      console.log("Final invoice already exists for project:", projectId);
      return;
    }

    // Get project with organization
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

    if (!project || !project.stripeCustomerId) {
      console.error("Project not found or no Stripe customer:", projectId);
      return;
    }

    // Calculate 50% of total (final payment)
    const finalAmount = projectTotal / 2;
    const finalAmountCents = Math.round(finalAmount * 100);

    // Create Stripe product for final invoice
    const product = await stripe.products.create({
      name: "Website Project Balance (50%)",
      description: `Final Payment (50%) for ${project.name}`,
      metadata: {
        projectId,
        label: "final",
      },
    });

    // Create price for the product
    const price = await stripe.prices.create({
      unit_amount: finalAmountCents,
      currency: "usd",
      product: product.id,
    });

    // Create invoice item
    await stripe.invoiceItems.create({
      customer: project.stripeCustomerId,
      price: price.id,
      description: `Final Payment (50%) - ${project.name}`,
    });

    // Create Stripe Invoice
    const stripeInvoice = await stripe.invoices.create({
      customer: project.stripeCustomerId,
      collection_method: "send_invoice",
      days_until_due: 7,
      metadata: {
        projectId,
        label: "final",
      },
    });

    // Finalize and send the invoice
    const finalizedInvoice = await stripe.invoices.finalizeInvoice(stripeInvoice.id);

    // Create invoice record in database
    const invoice = await prisma.invoice.create({
      data: {
        number: `INV-${Date.now()}-FINAL`,
        title: `Final Payment - ${project.name}`,
        description: `Final Payment (50%) - ${project.name}`,
        amount: finalAmount,
        total: finalAmount,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        status: "SENT",
        organizationId: project.organizationId,
        projectId: project.id,
        stripeInvoiceId: finalizedInvoice.id,
        sentAt: new Date(),
        items: {
          create: {
            description: `Final Payment (50%) - ${project.name}`,
            quantity: 1,
            rate: finalAmount,
            amount: finalAmount,
          },
        },
      },
    });

    // Emit feed event
    await feedHelpers.invoiceCreated(projectId, invoice.id, finalAmount);

    console.log("Final invoice created and sent:", invoice.id);
  } catch (error) {
    console.error("Error creating final invoice:", error);
    // Don't throw - we don't want to block status update if invoice creation fails
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user || !["CEO", "CFO"].includes(session.user.role || "")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId, status } = await req.json();

    if (!projectId || !status) {
      return NextResponse.json(
        { error: "projectId and status are required" },
        { status: 400 }
      );
    }

    // Get project with budget for final invoice calculation
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { status: true, budget: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const oldStatus = project.status;

    // Update project status
    const updated = await prisma.project.update({
      where: { id: projectId },
      data: { status },
    });

    // Emit feed event for status change
    await feedHelpers.statusChanged(projectId, oldStatus, status);

    // If status changed to COMPLETED, automatically create final invoice
    if (status === ProjectStatus.COMPLETED && oldStatus !== ProjectStatus.COMPLETED) {
      // Calculate total from budget (budget is total project amount)
      const projectTotal = project.budget ? Number(project.budget) : 0;
      
      if (projectTotal > 0) {
        // Create final invoice asynchronously (don't block response)
        createFinalInvoice(projectId, projectTotal).catch((error) => {
          console.error("Failed to create final invoice:", error);
        });
      } else {
        console.warn("Project has no budget set, cannot create final invoice:", projectId);
      }
    }

    return NextResponse.json({ success: true, project: updated });
  } catch (error) {
    console.error("Failed to update project status:", error);
    return NextResponse.json(
      { error: "Failed to update project status" },
      { status: 500 }
    );
  }
}