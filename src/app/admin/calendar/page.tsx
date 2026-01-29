/**
 * Global SeeZee Calendar
 * Shows all tasks, deadlines, and events across the organization
 */

import { getCurrentUser } from "@/lib/auth/requireRole";
import { ROLE } from "@/lib/role";
import { db } from "@/server/db";
import { CalendarClient } from "@/components/admin/CalendarClient";
import { startOfMonth, endOfMonth, addMonths } from "date-fns";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    return null;
  }

  // Fetch all tasks across the organization (for CEO/CFO)
  // or just user's tasks (for staff)
  const isCEOorAdmin = user.role === ROLE.CEO || user.role === ROLE.CFO;

  // Fetch calendar events (new model)
  const now = new Date();
  const calendarRangeStart = startOfMonth(now);
  const calendarRangeEnd = endOfMonth(addMonths(now, 3));

  // Use try-catch to handle potential database errors gracefully
  let calendarEvents: any[] = [];
  let tasks: any[] = [];
  let maintenanceSchedules: any[] = [];
  let projects: any[] = [];

  try {
    calendarEvents = await db.calendarEvent.findMany({
      where: {
        startTime: {
          gte: calendarRangeStart,
          lte: calendarRangeEnd,
        },
      },
      include: {
        organization: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
      },
      orderBy: { startTime: "asc" },
    });
  } catch (e) {
    console.error("Error fetching calendar events:", e);
  }

  try {
    tasks = await db.todo.findMany({
      where: isCEOorAdmin ? {} : { assignedToId: user.id },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
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
  } catch (e) {
    console.error("Error fetching tasks:", e);
  }

  try {
    // Fetch maintenance schedules
    maintenanceSchedules = await db.maintenanceSchedule.findMany({
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
  } catch (e) {
    console.error("Error fetching maintenance schedules:", e);
  }

  try {
    // Fetch project deadlines with milestones - simplified query
    projects = await db.project.findMany({
      where: {
        status: {
          in: ["ACTIVE", "REVIEW"],
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
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
  } catch (e) {
    console.error("Error fetching projects:", e);
  }

  // Serialize projects - simplified
  const serializedProjects = projects.map((project: any) => ({
    id: project.id,
    name: project.name,
    description: project.description,
    status: project.status,
    organization: project.organization,
    milestones: project.milestones,
  }));

  // Serialize calendar events
  const serializedCalendarEvents = calendarEvents.map((event: any) => ({
    id: event.id,
    title: event.title,
    description: event.description,
    startTime: event.startTime,
    endTime: event.endTime,
    status: event.status,
    meetingUrl: event.meetingUrl,
    project: event.project,
    organization: event.organization,
  }));

  return (
    <CalendarClient
      tasks={tasks}
      maintenanceSchedules={maintenanceSchedules}
      projects={serializedProjects}
      calendarEvents={serializedCalendarEvents}
      currentUser={{
        id: user.id,
        name: user.name,
        email: user.email || "",
        role: user.role,
      }}
      viewMode={isCEOorAdmin ? "organization" : "personal"}
    />
  );
}
