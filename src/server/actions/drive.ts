"use server";

/**
 * Server actions for Google Drive document management
 */

import { db } from "@/server/db";
import { requireRole } from "@/lib/auth/requireRole";
import { ROLE } from "@/lib/role";
import { revalidatePath } from "next/cache";
import { DriveDocCategory } from "@prisma/client";

interface LinkDriveDocumentParams {
  driveFileId: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  iconLink?: string;
  thumbnailLink?: string;
  category?: DriveDocCategory;
  projectId?: string;
  notes?: string;
  tags?: string[];
}

/**
 * Link a Google Drive document by creating a DriveDocument record
 */
export async function linkDriveDocument(data: LinkDriveDocumentParams) {
  const user = await requireRole([ROLE.CEO, ROLE.CFO, ROLE.FRONTEND, ROLE.BACKEND, ROLE.OUTREACH]);

  try {
    const document = await db.driveDocument.create({
      data: {
        driveFileId: data.driveFileId,
        name: data.name,
        mimeType: data.mimeType,
        webViewLink: data.webViewLink,
        iconLink: data.iconLink,
        thumbnailLink: data.thumbnailLink,
        category: data.category || DriveDocCategory.OTHER,
        projectId: data.projectId || null,
        notes: data.notes,
        tags: data.tags || [],
        addedById: user.id,
      },
    });

    revalidatePath("/admin/resources");
    if (data.projectId) {
      revalidatePath(`/admin/projects/${data.projectId}`);
    }
    return { success: true, document };
  } catch (error) {
    console.error("Failed to link drive document:", error);
    return { success: false, error: "Failed to link drive document" };
  }
}

/**
 * Unlink (delete) a DriveDocument record
 */
export async function unlinkDriveDocument(id: string) {
  await requireRole([ROLE.CEO, ROLE.CFO, ROLE.FRONTEND, ROLE.BACKEND, ROLE.OUTREACH]);

  try {
    const doc = await db.driveDocument.delete({
      where: { id },
    });

    revalidatePath("/admin/resources");
    if (doc.projectId) {
      revalidatePath(`/admin/projects/${doc.projectId}`);
    }
    return { success: true };
  } catch (error) {
    console.error("Failed to unlink drive document:", error);
    return { success: false, error: "Failed to unlink drive document" };
  }
}

/**
 * Get all DriveDocuments for a specific project
 */
export async function getProjectDocuments(projectId: string) {
  await requireRole([ROLE.CEO, ROLE.CFO, ROLE.FRONTEND, ROLE.BACKEND, ROLE.OUTREACH]);

  try {
    const documents = await db.driveDocument.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, documents };
  } catch (error) {
    console.error("Failed to fetch project documents:", error);
    return { success: false, error: "Failed to fetch project documents", documents: [] };
  }
}

/**
 * Get all DriveDocuments with optional filtering
 */
export async function getAllDocuments(filters?: {
  category?: DriveDocCategory;
  search?: string;
}) {
  await requireRole([ROLE.CEO, ROLE.CFO, ROLE.FRONTEND, ROLE.BACKEND, ROLE.OUTREACH]);

  try {
    const where: any = {};

    if (filters?.category) {
      where.category = filters.category;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { notes: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const documents = await db.driveDocument.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, documents };
  } catch (error) {
    console.error("Failed to fetch documents:", error);
    return { success: false, error: "Failed to fetch documents", documents: [] };
  }
}
