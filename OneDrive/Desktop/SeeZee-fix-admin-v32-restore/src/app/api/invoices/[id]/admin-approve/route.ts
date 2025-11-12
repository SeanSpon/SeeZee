import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/invoices/[id]/admin-approve
 * Admin approves an invoice and sends it to customer for payment
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user || !["ADMIN", "CEO", "CFO"].includes(session.user.role || "")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const invoiceId = id;

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
        project: true,
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    if (!(invoice as any).customerApprovedAt) {
      return NextResponse.json(
        { error: "Invoice must be approved by customer first" },
        { status: 400 }
      );
    }

    // Update invoice with admin approval
    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        adminApprovedAt: new Date(),
        status: "SENT",
        sentAt: new Date(),
      } as any,
      include: {
        items: true,
        project: true,
      },
    });

    // Send notification to customer (you can add email notification here)

    return NextResponse.json({
      success: true,
      invoice: updatedInvoice,
      message: "Invoice approved and sent to customer.",
    });
  } catch (error: any) {
    console.error("[Admin Approve Invoice Error]", error);
    return NextResponse.json(
      { error: error.message || "Failed to approve invoice" },
      { status: 500 }
    );
  }
}

