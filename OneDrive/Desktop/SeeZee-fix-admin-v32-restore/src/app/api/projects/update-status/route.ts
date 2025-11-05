import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { feedHelpers } from "@/lib/feed/emit";

export async function POST(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user || !["CEO", "ADMIN"].includes(session.user.role || "")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId, status } = await req.json();

    if (!projectId || !status) {
      return NextResponse.json(
        { error: "projectId and status are required" },
        { status: 400 }
      );
    }

    // Get current status for feed event
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { status: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const oldStatus = project.status;

    // Update project status
    const updated = await prisma.project.update({
      where: { id: projectId },
      data: { status },
    });

    // Emit feed event for status change
    await feedHelpers.statusChanged(projectId, oldStatus, status);

    return NextResponse.json({ success: true, project: updated });
  } catch (error) {
    console.error("Failed to update project status:", error);
    return NextResponse.json(
      { error: "Failed to update project status" },
      { status: 500 }
    );
  }
}