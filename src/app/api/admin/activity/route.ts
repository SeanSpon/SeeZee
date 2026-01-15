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

    // Get limit from query params
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    // Fetch activities
    const activities = await prisma.activity.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({
      activities: activities.map((a) => ({
        id: a.id,
        type: a.type,
        title: a.title,
        description: a.description,
        metadata: a.metadata,
        userId: a.userId,
        entityType: a.entityType,
        entityId: a.entityId,
        read: a.read,
        readAt: a.readAt,
        createdAt: a.createdAt,
        user: a.user
          ? {
              id: a.user.id,
              name: a.user.name,
              email: a.user.email,
              image: a.user.image,
            }
          : null,
      })),
    });
  } catch (error) {
    console.error("[GET /api/admin/activity]", error);
    return NextResponse.json(
      { error: "Failed to fetch activity" },
      { status: 500 }
    );
  }
}