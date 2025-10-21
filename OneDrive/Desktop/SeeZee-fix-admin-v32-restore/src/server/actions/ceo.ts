"use server";

/**
 * CEO Executive Actions
 * Advanced team management, assignments, and analytics
 */

import { db } from "@/server/db";
import { requireRole } from "@/lib/auth/requireRole";
import { revalidatePath } from "next/cache";
import { createActivity } from "./activity";
import { UserRole, TodoStatus } from "@prisma/client";

// ============================================
// TEAM ASSIGNMENT OPERATIONS
// ============================================

/**
 * Assign learning resources to users or role groups
 */
export async function assignLearningResources(data: {
  resourceIds: string[];
  userIds?: string[];
  roles?: UserRole[];
}) {
  const user = await requireRole(["CEO", "ADMIN"]);

  try {
    // If specific users are provided
    if (data.userIds && data.userIds.length > 0) {
      await createActivity({
        type: "LEAD_UPDATED",
        title: "Learning Resources Assigned",
        description: `${data.resourceIds.length} resources assigned to ${data.userIds.length} users`,
        userId: user.id,
        metadata: {
          resourceIds: data.resourceIds,
          userIds: data.userIds,
        },
      });
    }

    // If roles are provided, assign to all users with those roles
    if (data.roles && data.roles.length > 0) {
      const users = await db.user.findMany({
        where: {
          role: { in: data.roles },
        },
        select: { id: true },
      });

      await createActivity({
        type: "LEAD_UPDATED",
        title: "Learning Resources Assigned by Role",
        description: `${data.resourceIds.length} resources assigned to ${data.roles.join(", ")} roles (${users.length} users)`,
        userId: user.id,
        metadata: {
          resourceIds: data.resourceIds,
          roles: data.roles,
          userCount: users.length,
        },
      });
    }

    revalidatePath("/admin/ceo");
    return { success: true, message: "Resources assigned successfully" };
  } catch (error) {
    console.error("Failed to assign learning resources:", error);
    return { success: false, error: "Failed to assign resources" };
  }
}

/**
 * Assign tools to users or role groups
 */
export async function assignTools(data: {
  toolIds: string[];
  userIds?: string[];
  roles?: UserRole[];
}) {
  const user = await requireRole(["CEO", "ADMIN"]);

  try {
    if (data.userIds && data.userIds.length > 0) {
      await createActivity({
        type: "LEAD_UPDATED",
        title: "Tools Assigned",
        description: `${data.toolIds.length} tools assigned to ${data.userIds.length} users`,
        userId: user.id,
        metadata: {
          toolIds: data.toolIds,
          userIds: data.userIds,
        },
      });
    }

    if (data.roles && data.roles.length > 0) {
      const users = await db.user.findMany({
        where: { role: { in: data.roles } },
        select: { id: true },
      });

      await createActivity({
        type: "LEAD_UPDATED",
        title: "Tools Assigned by Role",
        description: `${data.toolIds.length} tools assigned to ${data.roles.join(", ")} roles (${users.length} users)`,
        userId: user.id,
        metadata: {
          toolIds: data.toolIds,
          roles: data.roles,
          userCount: users.length,
        },
      });
    }

    revalidatePath("/admin/ceo");
    return { success: true, message: "Tools assigned successfully" };
  } catch (error) {
    console.error("Failed to assign tools:", error);
    return { success: false, error: "Failed to assign tools" };
  }
}

/**
 * Assign tasks to users or role groups
 */
export async function assignTasksToTeam(data: {
  taskIds: string[];
  userIds?: string[];
  roles?: UserRole[];
}) {
  const user = await requireRole(["CEO", "ADMIN"]);

  try {
    // Assign to specific users
    if (data.userIds && data.userIds.length > 0) {
      for (const userId of data.userIds) {
        await db.todo.updateMany({
          where: { id: { in: data.taskIds } },
          data: { assignedToId: userId },
        });
      }

      await createActivity({
        type: "PROJECT_UPDATED",
        title: "Bulk Tasks Assigned",
        description: `${data.taskIds.length} tasks assigned to ${data.userIds.length} users`,
        userId: user.id,
        metadata: {
          taskIds: data.taskIds,
          userIds: data.userIds,
        },
      });
    }

    // Assign to all users with specific roles
    if (data.roles && data.roles.length > 0) {
      const users = await db.user.findMany({
        where: { role: { in: data.roles } },
        select: { id: true },
      });

      // Distribute tasks evenly across users
      for (let i = 0; i < data.taskIds.length; i++) {
        const targetUser = users[i % users.length];
        await db.todo.update({
          where: { id: data.taskIds[i] },
          data: { assignedToId: targetUser.id },
        });
      }

      await createActivity({
        type: "PROJECT_UPDATED",
        title: "Bulk Tasks Assigned by Role",
        description: `${data.taskIds.length} tasks distributed to ${data.roles.join(", ")} roles (${users.length} users)`,
        userId: user.id,
        metadata: {
          taskIds: data.taskIds,
          roles: data.roles,
          userCount: users.length,
        },
      });
    }

    revalidatePath("/admin/ceo");
    revalidatePath("/admin/tasks");
    return { success: true, message: "Tasks assigned successfully" };
  } catch (error) {
    console.error("Failed to assign tasks:", error);
    return { success: false, error: "Failed to assign tasks" };
  }
}

// ============================================
// ANALYTICS & INSIGHTS
// ============================================

/**
 * Get comprehensive executive dashboard metrics
 */
export async function getExecutiveMetrics() {
  await requireRole(["CEO", "ADMIN"]);

  try {
    // Revenue metrics
    const invoices = await db.invoice.findMany({
      select: {
        total: true,
        amount: true,
        status: true,
        paidAt: true,
      },
    });

    const totalRevenue = invoices
      .filter((inv) => inv.status === "PAID")
      .reduce((sum, inv) => sum + Number(inv.total), 0);

    const pendingRevenue = invoices
      .filter((inv) => ["SENT", "OVERDUE"].includes(inv.status))
      .reduce((sum, inv) => sum + Number(inv.total), 0);

    // Project metrics
    const projects = await db.project.findMany({
      select: {
        status: true,
        budget: true,
        createdAt: true,
      },
    });

    const activeProjects = projects.filter((p) =>
      ["IN_PROGRESS", "PLANNING"].includes(p.status)
    ).length;

    const completedProjects = projects.filter(
      (p) => p.status === "COMPLETED"
    ).length;

    const avgProjectValue =
      projects.length > 0
        ? projects.reduce((sum, p) => sum + Number(p.budget || 0), 0) / projects.length
        : 0;

    // Lead conversion rate
    const leads = await db.lead.findMany({
      select: { status: true },
    });

    const convertedLeads = leads.filter((l) => l.status === "CONVERTED").length;
    const conversionRate =
      leads.length > 0 ? (convertedLeads / leads.length) * 100 : 0;

    // Team productivity
    const tasks = await db.todo.findMany({
      select: {
        status: true,
        createdAt: true,
        completedAt: true,
      },
    });

    const completedTasks = tasks.filter((t) => t.status === TodoStatus.DONE).length;
    const taskCompletionRate =
      tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

    // Recent revenue trend (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentRevenue = invoices
      .filter(
        (inv) =>
          inv.status === "PAID" && inv.paidAt && inv.paidAt >= thirtyDaysAgo
      )
      .reduce((sum, inv) => sum + Number(inv.total), 0);

    const previousRevenue = totalRevenue - recentRevenue;
    const revenueTrend =
      previousRevenue > 0
        ? ((recentRevenue - previousRevenue) / previousRevenue) * 100
        : 0;

    return {
      success: true,
      metrics: {
        revenue: {
          total: totalRevenue,
          pending: pendingRevenue,
          trend: revenueTrend,
          recent: recentRevenue,
        },
        projects: {
          active: activeProjects,
          completed: completedProjects,
          total: projects.length,
          avgValue: avgProjectValue,
        },
        leads: {
          total: leads.length,
          converted: convertedLeads,
          conversionRate,
        },
        tasks: {
          total: tasks.length,
          completed: completedTasks,
          completionRate: taskCompletionRate,
        },
      },
    };
  } catch (error) {
    console.error("Failed to fetch executive metrics:", error);
    return { success: false, error: "Failed to fetch metrics" };
  }
}

/**
 * Get team workload distribution
 */
export async function getTeamWorkload() {
  await requireRole(["CEO", "ADMIN"]);

  try {
    const users = await db.user.findMany({
      where: {
        role: { in: ["CEO", "ADMIN", "STAFF"] },
      },
      include: {
        assignedTodos: {
          where: {
            status: { not: TodoStatus.DONE },
          },
          select: {
            id: true,
            priority: true,
          },
        },
        assignedProjects: {
          where: {
            status: { in: ["IN_PROGRESS"] },
          },
          select: {
            id: true,
          },
        },
      },
    });

    const workload = users.map((user) => ({
      userId: user.id,
      name: user.name || user.email,
      role: user.role,
      activeTasks: user.assignedTodos.length,
      highPriorityTasks: user.assignedTodos.filter(
        (t) => t.priority === "HIGH"
      ).length,
      activeProjects: user.assignedProjects.length,
    }));

    return { success: true, workload };
  } catch (error) {
    console.error("Failed to fetch team workload:", error);
    return { success: false, error: "Failed to fetch workload" };
  }
}

/**
 * Get resource utilization stats
 */
export async function getResourceUtilization() {
  await requireRole(["CEO"]);

  try {
    const totalUsers = await db.user.count({
      where: {
        role: { in: ["CEO", "ADMIN", "STAFF"] },
      },
    });

    const activeUsers = await db.user.count({
      where: {
        role: { in: ["CEO", "ADMIN", "STAFF"] },
        assignedTodos: {
          some: {
            status: { not: TodoStatus.DONE },
          },
        },
      },
    });

    const learningResources = await db.learningResource.count();
    const tools = await db.tool.count();
    const automations = await db.automation.count({
      where: { enabled: true },
    });

    return {
      success: true,
      utilization: {
        users: {
          total: totalUsers,
          active: activeUsers,
          utilization: totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0,
        },
        resources: {
          learning: learningResources,
          tools: tools,
          automations: automations,
        },
      },
    };
  } catch (error) {
    console.error("Failed to fetch resource utilization:", error);
    return { success: false, error: "Failed to fetch utilization" };
  }
}
