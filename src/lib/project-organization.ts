/**
 * PROJECT ORGANIZATION UTILITIES
 * 
 * Helpers for managing project folders, files, and organization.
 * Makes it easy to keep projects tidy and well-structured.
 */

import { db } from "@/server/db";

// Default folder structure for new projects
export const DEFAULT_PROJECT_FOLDERS = [
  {
    name: "Contracts & Legal",
    description: "Signed agreements, NDAs, and legal documents",
    icon: "file-signature",
    color: "#dc2626", // red
    order: 0,
    isSystem: true,
  },
  {
    name: "Design Files",
    description: "Mockups, wireframes, design assets",
    icon: "palette",
    color: "#8b5cf6", // purple
    order: 1,
    isSystem: true,
  },
  {
    name: "Client Assets",
    description: "Logos, images, content provided by client",
    icon: "image",
    color: "#3b82f6", // blue
    order: 2,
    isSystem: true,
  },
  {
    name: "Documentation",
    description: "Technical docs, requirements, specifications",
    icon: "book",
    color: "#10b981", // green
    order: 3,
    isSystem: true,
  },
  {
    name: "Deliverables",
    description: "Final files delivered to client",
    icon: "package",
    color: "#f59e0b", // amber
    order: 4,
    isSystem: true,
  },
  {
    name: "Invoices & Receipts",
    description: "Billing documents and payment receipts",
    icon: "receipt",
    color: "#06b6d4", // cyan
    order: 5,
    isSystem: true,
  },
];

/**
 * Initialize default folder structure for a new project
 */
export async function initializeProjectFolders(projectId: string) {
  try {
    const project = await db.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new Error("Project not found");
    }

    // Create default folders
    const folders = await Promise.all(
      DEFAULT_PROJECT_FOLDERS.map((folderTemplate) =>
        db.projectFolder.create({
          data: {
            projectId,
            name: folderTemplate.name,
            description: folderTemplate.description,
            icon: folderTemplate.icon,
            color: folderTemplate.color,
            order: folderTemplate.order,
            isSystem: folderTemplate.isSystem,
          },
        })
      )
    );

    return {
      success: true,
      folders,
    };
  } catch (error: any) {
    console.error("Failed to initialize project folders:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get project folder structure with file counts
 */
export async function getProjectFolders(projectId: string) {
  try {
    const folders = await db.projectFolder.findMany({
      where: { projectId },
      include: {
        files: {
          select: {
            id: true,
            name: true,
            size: true,
            mimeType: true,
            createdAt: true,
            url: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        children: {
          include: {
            files: true,
          },
        },
      },
      orderBy: {
        order: "asc",
      },
    });

    // Add file counts
    const foldersWithCounts = folders.map((folder) => ({
      ...folder,
      fileCount: folder.files.length,
      totalSize: folder.files.reduce((sum, file) => sum + file.size, 0),
    }));

    return {
      success: true,
      folders: foldersWithCounts,
    };
  } catch (error: any) {
    console.error("Failed to get project folders:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Create a custom folder
 */
export async function createProjectFolder(
  projectId: string,
  data: {
    name: string;
    description?: string;
    parentId?: string;
    icon?: string;
    color?: string;
  }
) {
  try {
    const folder = await db.projectFolder.create({
      data: {
        projectId,
        name: data.name,
        description: data.description,
        parentId: data.parentId,
        icon: data.icon || "folder",
        color: data.color || "#6b7280",
        isSystem: false,
      },
    });

    return {
      success: true,
      folder,
    };
  } catch (error: any) {
    console.error("Failed to create folder:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Move file to folder
 */
export async function moveFileToFolder(fileId: string, folderId: string | null) {
  try {
    const file = await db.file.update({
      where: { id: fileId },
      data: { folderId },
    });

    return {
      success: true,
      file,
    };
  } catch (error: any) {
    console.error("Failed to move file:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get files without a folder (needs organization)
 */
export async function getUnorganizedFiles(projectId: string) {
  try {
    const files = await db.file.findMany({
      where: {
        projectId,
        folderId: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      files,
      count: files.length,
    };
  } catch (error: any) {
    console.error("Failed to get unorganized files:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Auto-organize files by type
 */
export async function autoOrganizeFiles(projectId: string) {
  try {
    // Get project folders
    const folders = await db.projectFolder.findMany({
      where: { projectId },
    });

    // Get unorganized files
    const files = await db.file.findMany({
      where: {
        projectId,
        folderId: null,
      },
    });

    // Map file types to folders
    const folderMap: Record<string, string> = {};
    
    folders.forEach((folder) => {
      if (folder.name.includes("Contract") || folder.name.includes("Legal")) {
        folderMap["contract"] = folder.id;
        folderMap["pdf"] = folder.id;
      } else if (folder.name.includes("Design")) {
        folderMap["design"] = folder.id;
        folderMap["image"] = folder.id;
      } else if (folder.name.includes("Client Assets")) {
        folderMap["asset"] = folder.id;
      } else if (folder.name.includes("Documentation")) {
        folderMap["document"] = folder.id;
      } else if (folder.name.includes("Invoice")) {
        folderMap["invoice"] = folder.id;
      }
    });

    // Auto-organize based on file name and type
    let organized = 0;

    for (const file of files) {
      let targetFolderId: string | null = null;

      // Check file name patterns
      const lowerName = file.name.toLowerCase();
      
      if (
        lowerName.includes("contract") ||
        lowerName.includes("agreement") ||
        lowerName.includes("nda")
      ) {
        targetFolderId = folderMap["contract"];
      } else if (
        lowerName.includes("mockup") ||
        lowerName.includes("wireframe") ||
        lowerName.includes("design")
      ) {
        targetFolderId = folderMap["design"];
      } else if (
        lowerName.includes("logo") ||
        lowerName.includes("brand") ||
        lowerName.includes("asset")
      ) {
        targetFolderId = folderMap["asset"];
      } else if (
        lowerName.includes("invoice") ||
        lowerName.includes("receipt") ||
        lowerName.includes("payment")
      ) {
        targetFolderId = folderMap["invoice"];
      } else if (
        lowerName.includes("doc") ||
        lowerName.includes("spec") ||
        lowerName.includes("requirements")
      ) {
        targetFolderId = folderMap["document"];
      }

      // If we found a match, move the file
      if (targetFolderId) {
        await db.file.update({
          where: { id: file.id },
          data: { folderId: targetFolderId },
        });
        organized++;
      }
    }

    return {
      success: true,
      organized,
      total: files.length,
      remaining: files.length - organized,
    };
  } catch (error: any) {
    console.error("Failed to auto-organize files:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get project health metrics
 */
export async function getProjectHealth(projectId: string) {
  try {
    const [
      project,
      folders,
      files,
      invoices,
      requests,
      todos,
    ] = await Promise.all([
      db.project.findUnique({
        where: { id: projectId },
        include: {
          organization: true,
          maintenancePlanRel: true,
        },
      }),
      db.projectFolder.findMany({ where: { projectId } }),
      db.file.findMany({ where: { projectId } }),
      db.invoice.findMany({
        where: { projectId },
        include: { items: true },
      }),
      db.request.findMany({ where: { projectId } }),
      db.todo.findMany({ where: { projectId } }),
    ]);

    if (!project) {
      throw new Error("Project not found");
    }

    // Calculate metrics
    const unorganizedFiles = files.filter((f) => !f.folderId).length;
    const totalFileSize = files.reduce((sum, f) => sum + f.size, 0);
    
    const invoiceMetrics = {
      total: invoices.length,
      draft: invoices.filter((i) => i.status === "DRAFT").length,
      sent: invoices.filter((i) => i.status === "SENT").length,
      paid: invoices.filter((i) => i.status === "PAID").length,
      overdue: invoices.filter((i) => i.status === "OVERDUE").length,
      totalRevenue: invoices
        .filter((i) => i.status === "PAID")
        .reduce((sum, i) => sum + Number(i.total), 0),
    };

    const requestMetrics = {
      total: requests.length,
      new: requests.filter((r) => r.state === "new").length,
      inProgress: requests.filter((r) => r.state === "in_progress").length,
      completed: requests.filter((r) => r.state === "completed").length,
    };

    const todoMetrics = {
      total: todos.length,
      todo: todos.filter((t) => t.status === "TODO").length,
      inProgress: todos.filter((t) => t.status === "IN_PROGRESS").length,
      done: todos.filter((t) => t.status === "DONE").length,
    };

    // Calculate health score (0-100)
    let healthScore = 100;

    // Deduct for unorganized files
    if (unorganizedFiles > 5) healthScore -= 10;
    if (unorganizedFiles > 10) healthScore -= 10;

    // Deduct for overdue invoices
    if (invoiceMetrics.overdue > 0) healthScore -= 20;

    // Deduct for old pending requests
    if (requestMetrics.new > 5) healthScore -= 15;

    // Deduct for stalled todos
    if (todoMetrics.todo > 10) healthScore -= 10;

    return {
      success: true,
      healthScore: Math.max(0, healthScore),
      project: {
        name: project.name,
        status: project.status,
        progress: project.progress,
      },
      organization: {
        fileOrganization: {
          folders: folders.length,
          totalFiles: files.length,
          unorganizedFiles,
          totalSize: totalFileSize,
          organizationRate: files.length > 0 
            ? ((files.length - unorganizedFiles) / files.length * 100).toFixed(1)
            : "100",
        },
        invoices: invoiceMetrics,
        requests: requestMetrics,
        todos: todoMetrics,
      },
      recommendations: generateRecommendations({
        unorganizedFiles,
        overdueInvoices: invoiceMetrics.overdue,
        pendingRequests: requestMetrics.new,
        stalledTodos: todoMetrics.todo,
      }),
    };
  } catch (error: any) {
    console.error("Failed to get project health:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

function generateRecommendations(metrics: {
  unorganizedFiles: number;
  overdueInvoices: number;
  pendingRequests: number;
  stalledTodos: number;
}) {
  const recommendations: string[] = [];

  if (metrics.unorganizedFiles > 5) {
    recommendations.push(
      `You have ${metrics.unorganizedFiles} unorganized files. Run auto-organize or manually sort them into folders.`
    );
  }

  if (metrics.overdueInvoices > 0) {
    recommendations.push(
      `${metrics.overdueInvoices} invoice(s) are overdue. Follow up with clients for payment.`
    );
  }

  if (metrics.pendingRequests > 3) {
    recommendations.push(
      `${metrics.pendingRequests} requests are pending review. Review and assign them to team members.`
    );
  }

  if (metrics.stalledTodos > 10) {
    recommendations.push(
      `You have ${metrics.stalledTodos} todos not in progress. Review priorities and assign work.`
    );
  }

  if (recommendations.length === 0) {
    recommendations.push("Everything looks great! Project is well-organized.");
  }

  return recommendations;
}

/**
 * Search files across project
 */
export async function searchProjectFiles(
  projectId: string,
  query: string
) {
  try {
    const files = await db.file.findMany({
      where: {
        projectId,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { originalName: { contains: query, mode: "insensitive" } },
        ],
      },
      include: {
        folder: {
          select: {
            name: true,
            color: true,
            icon: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      files,
      count: files.length,
    };
  } catch (error: any) {
    console.error("Failed to search files:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}
