import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/invoices/[id]/approve
 * Customer approves an invoice
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: invoiceId } = await params;

    // Get invoice
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        organization: {
          include: {
            members: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Check if user is part of the organization
    const isMember = invoice.organization.members.some(
      (member) => member.user.email === session.user.email
    );

    if (!isMember) {
      return NextResponse.json(
        { error: "Not authorized to approve this invoice" },
        { status: 403 }
      );
    }

    // Update invoice with customer approval
    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        customerApprovedAt: new Date(),
        status: "SENT", // Move to SENT status after customer approval
      } as any,
      include: {
        items: true,
      },
    });

    // Notify admin (you can add notification logic here)
    // For now, we'll just return success

    return NextResponse.json({
      success: true,
      invoice: updatedInvoice,
      message: "Invoice approved. An admin will review it shortly.",
    });
  } catch (error: any) {
    console.error("[Approve Invoice Error]", error);
    return NextResponse.json(
      { error: error.message || "Failed to approve invoice" },
      { status: 500 }
    );
  }
}

