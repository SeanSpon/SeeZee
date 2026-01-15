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

    // Fetch maintenance schedules
    const schedules = await prisma.maintenanceSchedule.findMany({
      where,
      ...(limit && { take: parseInt(limit, 10) }),
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true,
            organization: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        scheduledFor: "asc",
      },
    });

    // Calculate stats
    const stats = {
      total: await prisma.maintenanceSchedule.count({ where }),
      active: await prisma.maintenanceSchedule.count({ where: { ...where, status: "ACTIVE" } }),
      upcoming: await prisma.maintenanceSchedule.count({ where: { ...where, status: "UPCOMING" } }),
      overdue: await prisma.maintenanceSchedule.count({ where: { ...where, status: "OVERDUE" } }),
      completed: await prisma.maintenanceSchedule.count({ where: { ...where, status: "COMPLETED" } }),
    };

    return NextResponse.json({
      schedules: schedules.map((s) => ({
        id: s.id,
        title: s.title,
        description: s.description,
        status: s.status,
        scheduledFor: s.scheduledFor,
        completedAt: s.completedAt,
        notes: s.notes,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
        project: s.project,
      })),
      stats,
    });
  } catch (error) {
    console.error("[GET /api/admin/maintenance]", error);
    return NextResponse.json(
      { error: "Failed to fetch maintenance schedules" },
      { status: 500 }
    );
  }
}

