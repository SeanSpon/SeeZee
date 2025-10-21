/**
 * Global SeeZee Calendar
 * Shows all tasks, deadlines, and events across the organization
 */

import { requireRole } from "@/lib/auth/requireRole";
import { ROLE } from "@/lib/role";
import { db } from "@/server/db";
import { CalendarClient } from "@/components/admin/CalendarClient";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const user = await requireRole([ROLE.CEO, ROLE.ADMIN, ROLE.STAFF, ROLE.DESIGNER, ROLE.DEV]);

  // Fetch all tasks across the organization (for CEO/ADMIN)
  // or just user's tasks (for staff/designers/devs)
  const isCEOorAdmin = user.role === ROLE.CEO || user.role === ROLE.ADMIN;

  const tasks = await db.todo.findMany({
    where: isCEOorAdmin ? {} : { assignedToId: user.id },
    include: {
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: [
      { dueDate: "asc" },
      { priority: "desc" },
    ],
  });

  // Fetch maintenance schedules
  const maintenanceSchedules = await db.maintenanceSchedule.findMany({
    where: {
      status: {
        in: ["ACTIVE", "UPCOMING"],
      },
    },
    include: {
      project: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },
    },
    orderBy: {
      scheduledFor: "asc",
    },
  });

  // Fetch project deadlines with milestones
  const projects = await db.project.findMany({
    where: {
      status: {
        in: ["IN_PROGRESS", "REVIEW"],
      },
    },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
        },
      },
      milestones: {
        where: {
          completed: false,
        },
        orderBy: {
          dueDate: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <CalendarClient
      tasks={tasks}
      maintenanceSchedules={maintenanceSchedules}
      projects={projects}
      currentUser={user}
      viewMode={isCEOorAdmin ? "organization" : "personal"}
    />
  );
}
