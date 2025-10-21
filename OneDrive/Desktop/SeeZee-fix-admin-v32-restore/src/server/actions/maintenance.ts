"use server";

/**
 * Server actions for Maintenance tracking
 */

import { db } from "@/server/db";
import { requireRole } from "@/lib/permissions";
import { revalidatePath } from "next/cache";
import { logActivity } from "./activity";
import { MaintenanceStatus } from "@prisma/client";

interface CreateMaintenanceParams {
  projectId: string;
  title: string;
  description?: string;
  scheduledFor: Date;
  assignedToId?: string;
}

// Helper function to create activity
async function createActivity(data: any) {
  return await logActivity({
    type: data.type,
    title: data.title,
    description: data.description,
    userId: data.userId,
    metadata: data.metadata,
  });
}

/**
 * Get all maintenance schedules
 */
export async function getMaintenanceSchedules(filter?: {
  status?: MaintenanceStatus;
  projectId?: string;
}) {
  await requireRole("STAFF");

  try {
    const where: any = {};

    if (filter?.status) {
      where.status = filter.status;
    }

    if (filter?.projectId) {
      where.projectId = filter.projectId;
    }

    const schedules = await db.maintenanceSchedule.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            organization: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        scheduledFor: "asc",
      },
    });

    return { success: true, schedules };
  } catch (error) {
    console.error("Failed to fetch maintenance schedules:", error);
    return { success: false, error: "Failed to fetch maintenance schedules", schedules: [] };
  }
}

/**
 * Create a maintenance schedule
 */
export async function createMaintenanceSchedule(params: CreateMaintenanceParams) {
  const user = await requireRole("STAFF");

  try {
    const schedule = await db.maintenanceSchedule.create({
      data: {
        projectId: params.projectId,
        title: params.title,
        description: params.description,
        scheduledFor: params.scheduledFor,
        assignedToId: params.assignedToId,
        status: new Date() > params.scheduledFor ? MaintenanceStatus.OVERDUE : MaintenanceStatus.UPCOMING,
      },
      include: {
        project: {
          select: {
            name: true,
          },
        },
      },
    });

    await createActivity({
      type: "MAINTENANCE_SCHEDULED",
      title: "Maintenance scheduled",
      description: `${params.title} for ${schedule.project.name}`,
      userId: user.id,
      entityType: "MaintenanceSchedule",
      entityId: schedule.id,
    });

    revalidatePath("/admin/maintenance");
    return { success: true, schedule };
  } catch (error) {
    console.error("Failed to create maintenance schedule:", error);
    return { success: false, error: "Failed to create maintenance schedule" };
  }
}

/**
 * Update maintenance status
 */
export async function updateMaintenanceStatus(scheduleId: string, status: MaintenanceStatus) {
  const user = await requireRole("STAFF");

  try {
    const schedule = await db.maintenanceSchedule.update({
      where: { id: scheduleId },
      data: {
        status,
        ...(status === MaintenanceStatus.COMPLETED && { completedAt: new Date() }),
      },
    });

    revalidatePath("/admin/maintenance");
    return { success: true, schedule };
  } catch (error) {
    console.error("Failed to update maintenance status:", error);
    return { success: false, error: "Failed to update maintenance status" };
  }
}

/**
 * Get maintenance statistics
 */
export async function getMaintenanceStats() {
  await requireRole("STAFF");

  try {
    const [total, upcoming, overdue, completed, active] = await Promise.all([
      db.maintenanceSchedule.count(),
      db.maintenanceSchedule.count({ where: { status: MaintenanceStatus.UPCOMING } }),
      db.maintenanceSchedule.count({ where: { status: MaintenanceStatus.OVERDUE } }),
      db.maintenanceSchedule.count({ where: { status: MaintenanceStatus.COMPLETED } }),
      db.maintenanceSchedule.count({ where: { status: MaintenanceStatus.ACTIVE } }),
    ]);

    // Calculate average response time (hours between scheduledFor and completedAt)
    const completedSchedules = await db.maintenanceSchedule.findMany({
      where: {
        status: MaintenanceStatus.COMPLETED,
        completedAt: { not: null },
      },
      select: {
        scheduledFor: true,
        completedAt: true,
      },
      take: 50, // Last 50 completed tasks
    });

    let avgResponseTime = "N/A";
    if (completedSchedules.length > 0) {
      const totalHours = completedSchedules.reduce((sum, schedule) => {
        if (schedule.completedAt) {
          const hours = (schedule.completedAt.getTime() - schedule.scheduledFor.getTime()) / (1000 * 60 * 60);
          return sum + Math.max(0, hours); // Only count positive values
        }
        return sum;
      }, 0);

      const avgHours = totalHours / completedSchedules.length;
      
      if (avgHours < 1) {
        avgResponseTime = `${Math.round(avgHours * 60)}m`;
      } else if (avgHours < 24) {
        avgResponseTime = `${avgHours.toFixed(1)}h`;
      } else {
        avgResponseTime = `${(avgHours / 24).toFixed(1)}d`;
      }
    }

    return {
      success: true,
      stats: { total, upcoming, overdue, completed, active, avgResponseTime },
    };
  } catch (error) {
    console.error("Failed to fetch maintenance stats:", error);
    return {
      success: false,
      error: "Failed to fetch maintenance stats",
      stats: { total: 0, upcoming: 0, overdue: 0, completed: 0, active: 0, avgResponseTime: "N/A" },
    };
  }
}

/**
 * Get clients with active maintenance subscriptions
 */
export async function getMaintenanceClients() {
  await requireRole("STAFF");

  try {
    const clients = await db.project.findMany({
      where: {
        subscriptions: {
          some: {
            status: "active",
          },
        },
      },
      include: {
        organization: {
          select: {
            name: true,
            email: true,
          },
        },
        subscriptions: {
          where: {
            status: "active",
          },
          select: {
            id: true,
            priceId: true,
            currentPeriodEnd: true,
          },
        },
        maintenanceSchedules: {
          where: {
            status: {
              in: ["ACTIVE", "UPCOMING", "OVERDUE"],
            },
          },
          select: {
            id: true,
            title: true,
            scheduledFor: true,
            status: true,
          },
          orderBy: {
            scheduledFor: "asc",
          },
          take: 5,
        },
      },
    });

    return { success: true, clients };
  } catch (error) {
    console.error("Failed to fetch maintenance clients:", error);
    return { success: false, error: "Failed to fetch maintenance clients", clients: [] };
  }
}
