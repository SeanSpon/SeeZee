import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { handleCors, addCorsHeaders } from "@/lib/cors";

/**
 * DELETE /api/client/requests/[id]
 * Delete a project request (only for DRAFT or SUBMITTED status)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      const response = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      return addCorsHeaders(response, req.headers.get("origin"));
    }

    const { id } = await params;
    const requestId = id;

    // Find the project request
    const projectRequest = await prisma.projectRequest.findUnique({
      where: { id: requestId },
      select: {
        id: true,
        userId: true,
        status: true,
      },
    });

    if (!projectRequest) {
      const response = NextResponse.json({ error: "Project request not found" }, { status: 404 });
      return addCorsHeaders(response, req.headers.get("origin"));
    }

    // Verify ownership
    if (projectRequest.userId !== session.user.id) {
      const response = NextResponse.json({ error: "Forbidden" }, { status: 403 });
      return addCorsHeaders(response, req.headers.get("origin"));
    }

    // Only allow deletion of DRAFT or SUBMITTED requests
    const status = String(projectRequest.status || '').toUpperCase();
    if (!['DRAFT', 'SUBMITTED'].includes(status)) {
      const response = NextResponse.json(
        { error: "Cannot delete project request. Only draft or submitted requests can be deleted." },
        { status: 400 }
      );
      return addCorsHeaders(response, req.headers.get("origin"));
    }

    // Delete the project request
    await prisma.projectRequest.delete({
      where: { id: requestId },
    });

    // Log activity
    await prisma.systemLog.create({
      data: {
        action: "CLIENT_REQUEST_DELETED",
        entityType: "ProjectRequest",
        entityId: requestId,
        userId: session.user.id,
        metadata: { status: projectRequest.status },
      },
    });

    const response = NextResponse.json({ success: true });
    return addCorsHeaders(response, req.headers.get("origin"));
  } catch (error: any) {
    console.error("[DELETE /api/client/requests/[id]]", error);
    const response = NextResponse.json({ error: "Failed to delete request" }, { status: 500 });
    return addCorsHeaders(response, req.headers.get("origin"));
  }
}

