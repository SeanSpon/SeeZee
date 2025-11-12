import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has admin role
    const adminRoles = ["ADMIN", "CEO", "STAFF", "FRONTEND", "BACKEND", "OUTREACH", "DESIGNER", "DEV"];
    if (!adminRoles.includes(session.user.role || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get query params
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const limit = searchParams.get("limit");

    // Build where clause
    const where: any = {};
    if (status) {
      where.status = status;
    }

    // Fetch invoices
    const invoices = await prisma.invoice.findMany({
      where,
      ...(limit && { take: parseInt(limit, 10) }),
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        items: true,
        payments: {
          select: {
            id: true,
            amount: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate stats
    const stats = {
      total: await prisma.invoice.count({ where }),
      draft: await prisma.invoice.count({ where: { ...where, status: "DRAFT" } }),
      sent: await prisma.invoice.count({ where: { ...where, status: "SENT" } }),
      paid: await prisma.invoice.count({ where: { ...where, status: "PAID" } }),
      overdue: await prisma.invoice.count({ where: { ...where, status: "OVERDUE" } }),
      totalAmount: await prisma.invoice.aggregate({
        where: { ...where, status: "PAID" },
        _sum: { total: true },
      }),
    };

    return NextResponse.json({
      invoices: invoices.map((i) => ({
        id: i.id,
        number: i.number,
        title: i.title,
        description: i.description,
        status: i.status,
        amount: Number(i.amount),
        tax: Number(i.tax || 0),
        total: Number(i.total),
        currency: i.currency,
        dueDate: i.dueDate,
        paidAt: i.paidAt,
        sentAt: i.sentAt,
        createdAt: i.createdAt,
        updatedAt: i.updatedAt,
        organization: i.organization,
        project: i.project,
        items: i.items.map((item) => ({
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          rate: Number(item.rate),
          amount: Number(item.amount),
        })),
        payments: i.payments.map((p) => ({
          id: p.id,
          amount: Number(p.amount),
          status: p.status,
          createdAt: p.createdAt,
        })),
      })),
      stats: {
        ...stats,
        totalAmount: Number(stats.totalAmount._sum.total || 0),
      },
    });
  } catch (error) {
    console.error("[GET /api/admin/invoices]", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}

