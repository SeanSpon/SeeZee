import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/server/db";
import { isStaffRole } from "@/lib/role";

/**
 * POST /api/projects/[id]/archive
 * Archive or restore a project
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || !isStaffRole(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id: projectId } = await params;
    const body = await request.json();
    const archived = body.archived ?? true;

    const project = await db.project.update({
      where: { id: projectId },
      data: {
        archived,
        archivedAt: archived ? new Date() : null,
        archivedBy: archived ? session.user.id : null,
      },
      include: {
        organization: {
          select: { id: true, name: true },
        },
        assignee: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Create activity log (non-blocking)
    try {
      await db.activity.create({
        data: {
          type: archived ? "PROJECT_UPDATED" : "PROJECT_UPDATED",
          title: archived ? "Project archived" : "Project restored",
          description: archived 
            ? `Archived project: ${project.name}`
            : `Restored project: ${project.name}`,
          userId: session.user.id,
          entityType: "PROJECT",
          entityId: projectId,
          projectId: projectId,
        },
      });
    } catch (activityError) {
      console.error("Failed to create activity log:", activityError);
    }

    // Serialize dates properly for JSON response
    return NextResponse.json({
      success: true,
      project: {
        ...project,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
        startDate: project.startDate?.toISOString() || null,
        endDate: project.endDate?.toISOString() || null,
        archivedAt: project.archivedAt?.toISOString() || null,
        nextBillingDate: project.nextBillingDate?.toISOString() || null,
        designApprovedAt: project.designApprovedAt?.toISOString() || null,
        launchedAt: project.launchedAt?.toISOString() || null,
      },
    });
  } catch (error) {
    console.error("Error archiving/restoring project:", error);
    return NextResponse.json(
      { error: "Failed to update project archive status" },
      { status: 500 }
    );
  }
}
