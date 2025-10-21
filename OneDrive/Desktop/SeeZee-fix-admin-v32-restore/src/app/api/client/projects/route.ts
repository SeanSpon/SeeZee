import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/client/projects
 * Returns client's projects with filtering
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const q = searchParams.get("q");

    const userEmail = session.user.email!;

    // Find organization
    const lead = await prisma.lead.findFirst({
      where: { email: userEmail },
      select: { organizationId: true },
    });

    if (!lead?.organizationId) {
      return NextResponse.json({ items: [] });
    }

    const where: any = { organizationId: lead.organizationId };
    if (status) where.status = status;
    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }

    const projects = await prisma.project.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      take: 50,
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        startDate: true,
        endDate: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      items: projects.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        stage: p.status,
        progress: 0, // TODO: calculate from milestones
        dueAt: p.endDate,
        lastUpdated: p.updatedAt,
      })),
    });
  } catch (error: any) {
    console.error("[GET /api/client/projects]", error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}
