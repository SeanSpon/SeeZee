import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: projectId } = await params;
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50");

    // Verify user has access to this project
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        organizationId: true,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Check authorization
    const isAdmin = ["CEO", "ADMIN", "STAFF"].includes(session.user.role || "");
    
    if (!isAdmin) {
      // For clients, verify they're in the organization
      const member = await prisma.organizationMember.findFirst({
        where: {
          organizationId: project.organizationId,
          userId: session.user.id,
        },
      });

      if (!member) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // Get feed events
    const events = await prisma.feedEvent.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ events });
  } catch (error) {
    console.error("[Get Feed Error]", error);
    return NextResponse.json(
      { error: "Failed to fetch project feed" },
      { status: 500 }
    );
  }
}
