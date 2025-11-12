import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  buildClientProjectWhere,
  getClientAccessContext,
  getClientProjectOrThrow,
} from "@/lib/client-access";
import { ClientAccessError } from "@/lib/client-access-types";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const identity = { userId: session.user.id, email: session.user.email };

    // Get projectId from query params if specified
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    if (projectId) {
      try {
        await getClientProjectOrThrow(identity, projectId, {
          select: { id: true },
        });
      } catch (error) {
        if (error instanceof ClientAccessError) {
          return NextResponse.json({ files: [] });
        }
        throw error;
      }

      const files = await prisma.file.findMany({
        where: { projectId },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({
        files: files.map((file) => ({
          id: file.id,
          name: file.name,
          size: file.size,
          uploadedAt: file.createdAt.toISOString(),
          type: file.type,
          mimeType: file.mimeType,
          url: file.url,
        })),
      });
    }

    const { organizationIds, leadProjectIds } = await getClientAccessContext(identity);

    if (organizationIds.length === 0 && leadProjectIds.length === 0) {
      return NextResponse.json({ files: [] });
    }

    const accessibleProjects = await prisma.project.findMany({
      where: await buildClientProjectWhere(identity),
      select: { id: true },
    });

    const projectIds = Array.from(
      new Set([
        ...accessibleProjects.map((project) => project.id),
        ...leadProjectIds,
      ])
    );

    if (projectIds.length === 0) {
      return NextResponse.json({ files: [] });
    }

    const files = await prisma.file.findMany({
      where: {
        projectId: {
          in: projectIds,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      files: files
        .map((file) => ({
          id: file.id,
          name: file.name,
          size: file.size,
          uploadedAt: file.createdAt.toISOString(),
          type: file.type,
          mimeType: file.mimeType,
          url: file.url,
        }))
        .filter((file) => file.type !== "OTHER" || file.mimeType.includes("pdf")),
    });
  } catch (error) {
    console.error("Failed to fetch client files:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const identity = { userId: session.user.id, email: session.user.email };

    // Get projectId from query params or form data
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const formProjectId = formData.get("projectId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    let targetProjectId = projectId || formProjectId || undefined;
    let projectReference;

    if (targetProjectId) {
      try {
        projectReference = await getClientProjectOrThrow(identity, targetProjectId, {
          select: { id: true },
        });
      } catch (error) {
        if (error instanceof ClientAccessError) {
          return NextResponse.json(
            { error: "Project not found or access denied" },
            { status: 404 }
          );
        }
        throw error;
      }
    } else {
      projectReference = await prisma.project.findFirst({
        where: await buildClientProjectWhere(identity),
        select: { id: true },
      });

      if (!projectReference) {
        return NextResponse.json(
          { error: "No accessible projects found" },
          { status: 404 }
        );
      }

      targetProjectId = projectReference.id;
    }

    // For now, create a placeholder file record
    // In production, this should upload to storage (S3, uploadthing, etc.) and get a URL
    const fileType = file.type.startsWith("image/")
      ? "IMAGE"
      : file.type.startsWith("video/")
      ? "VIDEO"
      : file.type.includes("pdf") ||
        file.type.includes("document") ||
        file.type.includes("text")
      ? "DOCUMENT"
      : "OTHER";

    const fileRecord = await prisma.file.create({
      data: {
        name: file.name,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        type: fileType,
        url: `placeholder://${file.name}`, // Placeholder - should be actual storage URL
        projectId: targetProjectId,
        uploadedById: session.user.id ?? undefined,
        virusScanStatus: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      file: {
        id: fileRecord.id,
        name: fileRecord.name,
        url: fileRecord.url,
        size: fileRecord.size,
        mimeType: fileRecord.mimeType,
        type: fileRecord.type,
      },
    });
  } catch (error) {
    console.error("Failed to upload file:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
