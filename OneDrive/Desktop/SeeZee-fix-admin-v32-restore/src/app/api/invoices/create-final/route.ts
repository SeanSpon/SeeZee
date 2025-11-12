import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/invoices/create-final
 * Create final invoice for remaining balance when project is done
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || !["ADMIN", "CEO", "CFO"].includes(session.user.role || "")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { projectId } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: "projectId is required" },
        { status: 400 }
      );
    }

    // Get project
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        organization: true,
        invoices: {
          where: {
            invoiceType: "deposit",
            status: "PAID",
          } as any,
        },
        questionnaire: true,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Check if project is completed
    if (project.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Project must be completed before creating final invoice" },
        { status: 400 }
      );
    }

    // Check if final invoice already exists
    const existingFinalInvoice = await prisma.invoice.findFirst({
      where: {
        projectId: projectId,
        invoiceType: "final",
      } as any,
    });

    if (existingFinalInvoice) {
      return NextResponse.json(
        { error: "Final invoice already exists for this project" },
        { status: 400 }
      );
    }

    // Calculate remaining balance
    const totalPaid = project.invoices.reduce(
      (sum, inv) => sum + Number(inv.amount),
      0
    );

    // Get total project cost from questionnaire or budget
    let totalProjectCost = 0;
    if (project.questionnaire) {
      const data = project.questionnaire.data as any;
      const totals = data?.totals;
      if (totals?.total) {
        totalProjectCost = totals.total / 100; // Convert from cents
      }
    }
    
    if (!totalProjectCost && project.budget) {
      totalProjectCost = Number(project.budget);
    }

    if (!totalProjectCost) {
      return NextResponse.json(
        { error: "Could not determine total project cost" },
        { status: 400 }
      );
    }

    const remainingBalance = totalProjectCost - totalPaid;

    if (remainingBalance <= 0) {
      return NextResponse.json(
        { error: "No remaining balance to invoice" },
        { status: 400 }
      );
    }

    // Generate invoice number
    const invoiceNumber = `INV-FINAL-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // Create final invoice
    const invoice = await prisma.invoice.create({
      data: {
        number: invoiceNumber,
        title: `Final Payment - ${project.name}`,
        description: `Final payment for completed project: ${project.name}. Total project cost: $${totalProjectCost.toFixed(2)}. Amount paid: $${totalPaid.toFixed(2)}. Remaining balance: $${remainingBalance.toFixed(2)}.`,
        amount: remainingBalance,
        total: remainingBalance,
        currency: "USD",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        status: "DRAFT",
        invoiceType: "final",
        organizationId: project.organizationId,
        projectId: project.id,
        items: {
          create: {
            description: `Final Payment - ${project.name}`,
            quantity: 1,
            rate: remainingBalance,
            amount: remainingBalance,
          },
        },
      } as any,
      include: {
        items: true,
        organization: true,
        project: true,
      },
    });

    return NextResponse.json({
      success: true,
      invoice: {
        id: invoice.id,
        number: invoice.number,
        title: invoice.title,
        description: invoice.description,
        amount: invoice.amount,
        total: invoice.total,
        items: invoice.items,
        dueDate: invoice.dueDate,
        createdAt: invoice.createdAt,
      },
    });
  } catch (error: any) {
    console.error("[Create Final Invoice Error]", error);
    return NextResponse.json(
      { error: error.message || "Failed to create final invoice" },
      { status: 500 }
    );
  }
}

