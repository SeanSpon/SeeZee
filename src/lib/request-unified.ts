/**
 * UNIFIED REQUEST SYSTEM
 * 
 * ONE system to handle all types of client/project requests.
 * Replaces the confusing mess of Request, ChangeRequest, ProjectRequest, ClientTask.
 * 
 * Usage examples:
 * - Client submits a new project idea → NEW_PROJECT
 * - Client wants to change button color → CHANGE_REQUEST  
 * - Monthly maintenance task → MAINTENANCE_TASK
 * - We ask client to review mockups → CLIENT_TASK
 * - Client reports a bug → BUG_REPORT
 */

import { db } from "@/server/db";
import type { UnifiedRequestType, UnifiedRequestStatus, UnifiedRequestPriority } from "@prisma/client";

export interface CreateUnifiedRequestOptions {
  // What project is this for?
  projectId?: string;
  organizationId?: string;
  
  // What kind of request?
  type: UnifiedRequestType;
  
  // Details
  title: string;
  description: string;
  priority?: UnifiedRequestPriority;
  
  // Hours estimation
  estimatedHours?: number;
  
  // Assignment
  assignedToId?: string;
  assignedToRole?: string;
  
  // Submitted by (client)
  submittedBy?: string;
  
  // Categorization
  category?: string;
  tags?: string[];
  
  // Attachments
  attachments?: string[];
  
  // Does this need approval before starting?
  requiresApproval?: boolean;
  
  // Is this billable work?
  isBillable?: boolean;
  
  // Any custom metadata
  metadata?: Record<string, any>;
  
  // Notes
  internalNotes?: string;
  clientNotes?: string;
}

/**
 * Create a unified request
 */
export async function createUnifiedRequest(options: CreateUnifiedRequestOptions) {
  try {
    // Validate project if provided
    if (options.projectId) {
      const project = await db.project.findUnique({
        where: { id: options.projectId },
      });

      if (!project) {
        return { success: false, error: "Project not found" };
      }
    }

    const request = await db.unifiedRequest.create({
      data: {
        projectId: options.projectId,
        organizationId: options.organizationId,
        type: options.type,
        title: options.title,
        description: options.description,
        status: options.requiresApproval ? "PENDING" : "APPROVED",
        priority: options.priority || "MEDIUM",
        estimatedHours: options.estimatedHours,
        assignedToId: options.assignedToId,
        assignedToRole: options.assignedToRole as any,
        submittedBy: options.submittedBy,
        category: options.category,
        tags: options.tags || [],
        attachments: options.attachments || [],
        requiresApproval: options.requiresApproval || false,
        isBillable: options.isBillable || false,
        metadata: options.metadata || {},
        internalNotes: options.internalNotes,
        clientNotes: options.clientNotes,
      },
    });

    return {
      success: true,
      request,
    };
  } catch (error: any) {
    console.error("Failed to create request:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * CONVENIENCE FUNCTIONS FOR COMMON REQUEST TYPES
 */

/**
 * Client submits a new project request
 */
export async function submitNewProjectRequest(data: {
  organizationId: string;
  submittedBy: string;
  title: string;
  description: string;
  projectType?: string;
  budget?: string;
  timeline?: string;
  services?: string[];
}) {
  return createUnifiedRequest({
    organizationId: data.organizationId,
    type: "NEW_PROJECT",
    title: data.title,
    description: data.description,
    submittedBy: data.submittedBy,
    priority: "HIGH",
    requiresApproval: true,
    metadata: {
      projectType: data.projectType,
      budget: data.budget,
      timeline: data.timeline,
      services: data.services,
    },
    category: "New Business",
    tags: ["new-project", "client-submitted"],
  });
}

/**
 * Client requests a change to existing project
 */
export async function submitChangeRequest(data: {
  projectId: string;
  submittedBy: string;
  title: string;
  description: string;
  category?: "CONTENT" | "BUG" | "FEATURE" | "DESIGN" | "SEO" | "OTHER";
  priority?: UnifiedRequestPriority;
  attachments?: string[];
}) {
  return createUnifiedRequest({
    projectId: data.projectId,
    type: "CHANGE_REQUEST",
    title: data.title,
    description: data.description,
    submittedBy: data.submittedBy,
    priority: data.priority || "MEDIUM",
    category: data.category || "OTHER",
    attachments: data.attachments,
    requiresApproval: true, // Admin needs to review and estimate hours
    tags: ["change-request"],
  });
}

/**
 * Create a maintenance task (admin-initiated)
 */
export async function createMaintenanceTask(data: {
  projectId: string;
  title: string;
  description: string;
  assignedToId?: string;
  estimatedHours?: number;
  priority?: UnifiedRequestPriority;
}) {
  return createUnifiedRequest({
    projectId: data.projectId,
    type: "MAINTENANCE_TASK",
    title: data.title,
    description: data.description,
    assignedToId: data.assignedToId,
    estimatedHours: data.estimatedHours,
    priority: data.priority || "MEDIUM",
    requiresApproval: false, // Internal tasks don't need approval
    category: "Maintenance",
    tags: ["maintenance"],
  });
}

/**
 * Assign a task to the client
 */
export async function createClientTask(data: {
  projectId: string;
  title: string;
  description: string;
  assignedToId: string; // Client user ID
  priority?: UnifiedRequestPriority;
}) {
  return createUnifiedRequest({
    projectId: data.projectId,
    type: "CLIENT_TASK",
    title: data.title,
    description: data.description,
    assignedToId: data.assignedToId,
    priority: data.priority || "MEDIUM",
    requiresApproval: false,
    category: "Client Action Required",
    tags: ["client-task", "awaiting-client"],
  });
}

/**
 * Client reports a bug
 */
export async function reportBug(data: {
  projectId: string;
  submittedBy: string;
  title: string;
  description: string;
  priority?: UnifiedRequestPriority;
  attachments?: string[];
}) {
  return createUnifiedRequest({
    projectId: data.projectId,
    type: "BUG_REPORT",
    title: data.title,
    description: data.description,
    submittedBy: data.submittedBy,
    priority: data.priority || "HIGH",
    category: "Bug",
    attachments: data.attachments,
    requiresApproval: false, // Bugs should be addressed immediately
    tags: ["bug", "urgent"],
  });
}

/**
 * UPDATE REQUEST STATUS
 */

export async function updateRequestStatus(
  requestId: string,
  status: UnifiedRequestStatus,
  options?: {
    completedBy?: string;
    actualHours?: number;
    internalNotes?: string;
  }
) {
  try {
    const data: any = { status };

    if (status === "COMPLETED") {
      data.completedAt = new Date();
      data.completedBy = options?.completedBy;
      data.actualHours = options?.actualHours;
    }

    if (status === "APPROVED") {
      data.approvedAt = new Date();
      data.approvedBy = options?.completedBy;
    }

    if (options?.internalNotes) {
      data.internalNotes = options.internalNotes;
    }

    const request = await db.unifiedRequest.update({
      where: { id: requestId },
      data,
    });

    return {
      success: true,
      request,
    };
  } catch (error: any) {
    console.error("Failed to update request status:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * GET REQUESTS BY STATUS
 */

export async function getRequestsByStatus(
  projectId: string,
  status: UnifiedRequestStatus
) {
  try {
    const requests = await db.unifiedRequest.findMany({
      where: {
        projectId,
        status,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      requests,
      count: requests.length,
    };
  } catch (error: any) {
    console.error("Failed to get requests:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * GET REQUESTS NEEDING ATTENTION
 */

export async function getRequestsNeedingAttention(projectId?: string) {
  try {
    const whereClause: any = {
      OR: [
        { status: "PENDING" },
        { status: "REVIEWING" },
        { status: "NEEDS_INFO" },
        { status: "BLOCKED" },
      ],
    };

    if (projectId) {
      whereClause.projectId = projectId;
    }

    const requests = await db.unifiedRequest.findMany({
      where: whereClause,
      include: {
        project: {
          select: {
            name: true,
            organization: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: [
        { priority: "desc" },
        { createdAt: "desc" },
      ],
    });

    return {
      success: true,
      requests,
      count: requests.length,
    };
  } catch (error: any) {
    console.error("Failed to get requests needing attention:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * TRACK HOURS ON REQUEST
 */

export async function trackRequestHours(
  requestId: string,
  actualHours: number,
  options?: {
    hoursSource?: "monthly" | "rollover" | "pack" | "billable";
    hourPackId?: string;
    billedAmount?: number;
    invoiceId?: string;
  }
) {
  try {
    const request = await db.unifiedRequest.update({
      where: { id: requestId },
      data: {
        actualHours,
        hoursDeducted: actualHours,
        hoursSource: options?.hoursSource,
        hourPackId: options?.hourPackId,
        billedAmount: options?.billedAmount,
        invoiceId: options?.invoiceId,
      },
    });

    return {
      success: true,
      request,
    };
  } catch (error: any) {
    console.error("Failed to track hours:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * GET REQUEST METRICS
 */

export async function getRequestMetrics(projectId?: string) {
  try {
    const whereClause = projectId ? { projectId } : {};

    const [
      total,
      pending,
      inProgress,
      completed,
      byType,
      byPriority,
    ] = await Promise.all([
      db.unifiedRequest.count({ where: whereClause }),
      db.unifiedRequest.count({
        where: { ...whereClause, status: "PENDING" },
      }),
      db.unifiedRequest.count({
        where: { ...whereClause, status: "IN_PROGRESS" },
      }),
      db.unifiedRequest.count({
        where: { ...whereClause, status: "COMPLETED" },
      }),
      db.unifiedRequest.groupBy({
        by: ["type"],
        where: whereClause,
        _count: true,
      }),
      db.unifiedRequest.groupBy({
        by: ["priority"],
        where: whereClause,
        _count: true,
      }),
    ]);

    const averageCompletionTime = await db.unifiedRequest.findMany({
      where: {
        ...whereClause,
        status: "COMPLETED",
        completedAt: { not: null },
      },
      select: {
        createdAt: true,
        completedAt: true,
      },
    });

    const avgTime = averageCompletionTime.length > 0
      ? averageCompletionTime.reduce((sum, req) => {
          const diff = req.completedAt!.getTime() - req.createdAt.getTime();
          return sum + diff;
        }, 0) / averageCompletionTime.length / (1000 * 60 * 60 * 24) // Convert to days
      : 0;

    return {
      success: true,
      metrics: {
        total,
        pending,
        inProgress,
        completed,
        completionRate: total > 0 ? (completed / total * 100).toFixed(1) : "0",
        averageCompletionDays: avgTime.toFixed(1),
        byType: byType.reduce((acc, item) => {
          acc[item.type] = item._count;
          return acc;
        }, {} as Record<string, number>),
        byPriority: byPriority.reduce((acc, item) => {
          acc[item.priority] = item._count;
          return acc;
        }, {} as Record<string, number>),
      },
    };
  } catch (error: any) {
    console.error("Failed to get request metrics:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}
