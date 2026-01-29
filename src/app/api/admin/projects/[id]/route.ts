import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const ADMIN_ROLES = ["ADMIN", "CEO", "CFO", "STAFF", "FRONTEND", "BACKEND", "OUTREACH", "DESIGNER", "DEV"];

/**
 * GET /api/admin/projects/[id]
 * Get a single project (Admin only)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has admin role
    if (!ADMIN_ROLES.includes(session.user.role || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const projectId = id;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        lead: {
          select: {
            id: true,
            name: true,
            email: true,
            status: true,
          },
        },
        files: {
          select: {
            id: true,
            name: true,
            originalName: true,
            url: true,
            mimeType: true,
            size: true,
            type: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            files: true,
            invoices: true,
            requests: true,
            milestones: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        teamType: project.teamType,
        budget: project.budget ? Number(project.budget) : null,
        startDate: project.startDate,
        endDate: project.endDate,
        githubRepo: project.githubRepo,
        vercelUrl: project.vercelUrl,
        liveUrl: project.liveUrl,
        currentStage: project.currentStage,
        progress: project.progress,
        isNonprofit: project.isNonprofit,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        organization: project.organization,
        assignee: project.assignee,
        lead: project.lead,
        files: project.files,
        counts: {
          files: project._count.files,
          invoices: project._count.invoices,
          requests: project._count.requests,
          milestones: project._count.milestones,
        },
      },
    });
  } catch (error) {
    console.error("[GET /api/admin/projects/[id]]", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/projects/[id]
 * Update a project's settings (Admin only)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has admin role
    if (!ADMIN_ROLES.includes(session.user.role || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    // Validate the project exists
    const existingProject = await prisma.project.findUnique({
      where: { id },
      select: { id: true, name: true },
    });

    if (!existingProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Build update data from allowed fields
    const updateData: Record<string, any> = {};

    // Basic fields
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.teamType !== undefined) updateData.teamType = body.teamType;
    if (body.budget !== undefined) updateData.budget = body.budget;
    if (body.startDate !== undefined) updateData.startDate = body.startDate ? new Date(body.startDate) : null;
    if (body.endDate !== undefined) updateData.endDate = body.endDate ? new Date(body.endDate) : null;
    if (body.isNonprofit !== undefined) updateData.isNonprofit = body.isNonprofit;
    
    // Integration fields
    if (body.githubRepo !== undefined) updateData.githubRepo = body.githubRepo;
    if (body.vercelUrl !== undefined) updateData.vercelUrl = body.vercelUrl;
    if (body.liveUrl !== undefined) updateData.liveUrl = body.liveUrl;
    
    // Assignee
    if (body.assigneeId !== undefined) {
      updateData.assigneeId = body.assigneeId || null;
    }

    // Progress fields
    if (body.currentStage !== undefined) updateData.currentStage = body.currentStage;
    if (body.progress !== undefined) updateData.progress = body.progress;

    // Update the project
    const updatedProject = await prisma.project.update({
      where: { id },
      data: updateData,
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    // Log activity
    try {
      await prisma.systemLog.create({
        data: {
          action: "ADMIN_PROJECT_UPDATED",
          entityType: "Project",
          entityId: id,
          userId: session.user.id,
          metadata: { 
            projectName: updatedProject.name,
            updatedFields: Object.keys(updateData),
            updatedBy: session.user.email,
          },
        },
      });
    } catch (logError) {
      console.error("[PATCH /api/admin/projects/[id]] Failed to log update:", logError);
    }

    return NextResponse.json({
      success: true,
      project: {
        id: updatedProject.id,
        name: updatedProject.name,
        description: updatedProject.description,
        status: updatedProject.status,
        teamType: updatedProject.teamType,
        budget: updatedProject.budget ? Number(updatedProject.budget) : null,
        startDate: updatedProject.startDate,
        endDate: updatedProject.endDate,
        githubRepo: updatedProject.githubRepo,
        vercelUrl: updatedProject.vercelUrl,
        liveUrl: updatedProject.liveUrl,
        currentStage: updatedProject.currentStage,
        progress: updatedProject.progress,
        isNonprofit: updatedProject.isNonprofit,
        assigneeId: updatedProject.assigneeId,
        organization: updatedProject.organization,
        assignee: updatedProject.assignee,
        updatedAt: updatedProject.updatedAt,
      },
    });
  } catch (error: any) {
    console.error("[PATCH /api/admin/projects/[id]]", error);
    return NextResponse.json(
      { 
        error: error.message || "Failed to update project",
        code: error.code || "UNKNOWN_ERROR",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/projects/[id]
 * Delete a project (Admin only)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has admin role
    if (!ADMIN_ROLES.includes(session.user.role || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const projectId = id;

    // Verify project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        name: true,
        status: true,
        organizationId: true,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Use a transaction to delete related records and then the project
    await prisma.$transaction(async (tx) => {
      // Delete related records that don't have cascade delete
      // Files
      await tx.file.deleteMany({
        where: { projectId: projectId },
      });

      // Invoices - unlink them by setting projectId to null
      await tx.invoice.updateMany({
        where: { projectId: projectId },
        data: { projectId: null },
      });

      // Todos
      await tx.todo.deleteMany({
        where: { projectId: projectId },
      });

      // Archive any ProjectRequests associated with this project's organization
      // This helps clean up orphaned requests
      if (project.organizationId) {
        // First get the user IDs from the organization
        const members = await tx.organizationMember.findMany({
          where: { organizationId: project.organizationId },
          select: { userId: true },
        });
        
        const userIds = members.map((m) => m.userId);
        
        if (userIds.length > 0) {
          await tx.projectRequest.updateMany({
            where: {
              userId: {
                in: userIds,
              },
              status: {
                in: ['DRAFT', 'SUBMITTED', 'REVIEWING', 'NEEDS_INFO'],
              },
            },
            data: {
              status: 'ARCHIVED',
            },
          });
        }
      }

      // Delete the project (this will cascade delete records with onDelete: Cascade)
      await tx.project.delete({
        where: { id: projectId },
      });
    });

    // Log activity
    try {
      await prisma.systemLog.create({
        data: {
          action: "ADMIN_PROJECT_DELETED",
          entityType: "Project",
          entityId: projectId,
          userId: session.user.id,
          metadata: { 
            projectName: project.name, 
            status: project.status,
            deletedBy: session.user.email,
          },
        },
      });
    } catch (logError) {
      console.error("[DELETE /api/admin/projects/[id]] Failed to log deletion:", logError);
    }

    return NextResponse.json({ 
      success: true, 
      message: "Project deleted successfully" 
    });
  } catch (error: any) {
    console.error("[DELETE /api/admin/projects/[id]]", error);
    console.error("[DELETE /api/admin/projects/[id]] Error details:", {
      code: error.code,
      message: error.message,
      meta: error.meta,
    });
    
    let errorMessage = "Failed to delete project";
    let statusCode = 500;
    
    if (error.code === "P2003") {
      errorMessage = "Cannot delete project due to related records. Please contact support.";
    } else if (error.code === "P2025") {
      errorMessage = "Project not found or already deleted.";
      statusCode = 404;
    } else if (error.code === "P2014") {
      errorMessage = "Cannot delete project due to required relation constraints.";
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        code: error.code || "UNKNOWN_ERROR",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: statusCode }
    );
  }
}

