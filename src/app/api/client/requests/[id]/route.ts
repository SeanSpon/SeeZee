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

    await prisma.$transaction(async tx => {
      const current = await tx.projectRequest.findUnique({ where: { id: requestId } });
      if (!current || !['DRAFT', 'SUBMITTED'].includes(current.status)) throw new Error('Request is already under review');
      await tx.projectRequest.update({ where: { id: requestId }, data: { status: "ARCHIVED" } });
      if (current.leadId) await tx.lead.updateMany({ where: { id: current.leadId, status: "NEW" }, data: { status: "LOST" } });
      await tx.systemLog.create({ data: { action: "CLIENT_REQUEST_CANCELLED", entityType: "ProjectRequest", entityId: requestId, userId: session.user.id, metadata: { previousStatus: current.status } } });
    }, { isolationLevel: "Serializable" });

    const response = NextResponse.json({ success: true });
    return addCorsHeaders(response, req.headers.get("origin"));
  } catch (error: any) {
    console.error("[DELETE /api/client/requests/[id]]", error);
    const response = NextResponse.json({ error: "Failed to delete request" }, { status: 500 });
    return addCorsHeaders(response, req.headers.get("origin"));
  }
}

