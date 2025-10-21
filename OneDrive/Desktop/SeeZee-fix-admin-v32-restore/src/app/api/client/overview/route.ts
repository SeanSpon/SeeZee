import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/client/overview
 * Returns aggregated data for the client dashboard overview
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = session.user.email!;

    // Find user's organization through their lead
    const lead = await prisma.lead.findFirst({
      where: { email: userEmail },
      select: { organizationId: true },
    });

    if (!lead?.organizationId) {
      return NextResponse.json({
        projects: { active: 0, total: 0 },
        invoices: { open: 0, overdue: 0, paidThisMonth: 0 },
        activity: { items: [] },
        files: { recent: [] },
      });
    }

    const orgId = lead.organizationId;

    // Projects count
    const [activeProjects, totalProjects] = await Promise.all([
      prisma.project.count({
        where: {
          organizationId: orgId,
          status: { in: ["IN_PROGRESS", "REVIEW"] },
        },
      }),
      prisma.project.count({
        where: { organizationId: orgId },
      }),
    ]);

    // Invoices
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [openInvoices, overdueInvoices, paidThisMonth] = await Promise.all([
      prisma.invoice.count({
        where: { organizationId: orgId, status: "SENT" },
      }),
      prisma.invoice.count({
        where: {
          organizationId: orgId,
          status: "OVERDUE",
        },
      }),
      prisma.invoice.count({
        where: {
          organizationId: orgId,
          status: "PAID",
          paidAt: { gte: firstOfMonth },
        },
      }),
    ]);

    // Recent activity
    const activities = await prisma.activity.findMany({
      where: { entityType: "project", entityId: { not: null } },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });

    // Recent files (from projects in this org)
    const files = await prisma.file.findMany({
      where: {
        project: { organizationId: orgId },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        name: true,
        size: true,
        mimeType: true,
        url: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      projects: { active: activeProjects, total: totalProjects },
      invoices: { open: openInvoices, overdue: overdueInvoices, paidThisMonth },
      activity: {
        items: activities.map((a) => ({
          id: a.id,
          type: a.type,
          title: a.title,
          description: a.description,
          createdAt: a.createdAt,
          user: a.user
            ? { name: a.user.name, email: a.user.email }
            : null,
        })),
      },
      files: {
        recent: files.map((f) => ({
          id: f.id,
          name: f.name,
          size: f.size,
          mimeType: f.mimeType,
          url: f.url,
          uploadedAt: f.createdAt,
        })),
      },
    });
  } catch (error: any) {
    console.error("[GET /api/client/overview]", error);
    return NextResponse.json(
      { error: "Failed to fetch overview" },
      { status: 500 }
    );
  }
}
