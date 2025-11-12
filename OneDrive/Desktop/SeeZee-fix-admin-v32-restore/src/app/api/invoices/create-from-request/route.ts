import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { calculateTotals } from "@/lib/qwiz/pricing";
import { getPackage } from "@/lib/qwiz/packages";

/**
 * POST /api/invoices/create-from-request
 * Create an invoice from a project request/lead
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      leadId,
      packageId,
      email,
      name,
      phone,
      company,
      projectGoals,
      timeline,
      specialRequirements,
      totals,
    } = body;

    if (!leadId || !packageId || !email || !name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get lead
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // Calculate pricing if not provided
    let invoiceTotals = totals;
    if (!invoiceTotals) {
      const pkg = getPackage(packageId);
      invoiceTotals = calculateTotals({
        package: packageId,
        selectedFeatures: pkg.baseIncludedFeatures,
        rush: false,
      });
    }

    // Get or create organization for the user
    let organization = await prisma.organization.findFirst({
      where: {
        members: {
          some: {
            user: {
              email: email,
            },
          },
        },
      },
    });

    if (!organization) {
      // Create a default organization for the user
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        );
      }

      organization = await prisma.organization.create({
        data: {
          name: company || `${name}'s Organization`,
          slug: `${email.split("@")[0]}-${Date.now()}`,
          email: email,
          members: {
            create: {
              userId: user.id,
              role: "OWNER",
            },
          },
        },
      });
    }

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // Create invoice
    const invoice = await prisma.invoice.create({
      data: {
        number: invoiceNumber,
        title: `${getPackage(packageId).title} Package - Deposit Invoice`,
        description: `Deposit invoice for ${getPackage(packageId).title} package project. Total project cost: $${(invoiceTotals.total / 100).toFixed(2)}. Deposit due: $${(invoiceTotals.deposit / 100).toFixed(2)}.`,
        amount: invoiceTotals.deposit / 100, // Convert cents to dollars
        total: invoiceTotals.deposit / 100,
        currency: "USD",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        status: "DRAFT",
        invoiceType: "deposit",
        leadId: leadId,
        organizationId: organization.id,
        items: {
          create: {
            description: `${getPackage(packageId).title} Package - 25% Deposit`,
            quantity: 1,
            rate: invoiceTotals.deposit / 100,
            amount: invoiceTotals.deposit / 100,
          },
        },
      } as any,
      include: {
        items: true,
        organization: true,
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
        deposit: invoiceTotals.deposit / 100,
        remainingBalance: (invoiceTotals.total - invoiceTotals.deposit) / 100,
        totalProjectCost: invoiceTotals.total / 100,
        items: invoice.items,
        dueDate: invoice.dueDate,
        createdAt: invoice.createdAt,
      },
    });
  } catch (error: any) {
    console.error("[Create Invoice from Request Error]", error);
    return NextResponse.json(
      { error: error.message || "Failed to create invoice" },
      { status: 500 }
    );
  }
}

