/**
 * Task Detail Page
 * Full task information with comments, history, and actions
 */

import { requireRole } from "@/lib/auth/requireRole";
import { ROLE } from "@/lib/role";
import { db } from "@/server/db";
import { notFound } from "next/navigation";
import { TaskDetailClient } from "@/components/admin/TaskDetailClient";

export const dynamic = "force-dynamic";

interface TaskDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TaskDetailPage({ params }: TaskDetailPageProps) {
  const { id } = await params;
  const user = await requireRole([ROLE.CEO, ROLE.CFO, ROLE.FRONTEND, ROLE.BACKEND, ROLE.OUTREACH]);

  // Fetch task with full details including materials
  const task = await db.todo.findUnique({
    where: { id },
    include: {
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
        },
      },
      materials: {
        orderBy: [
          { order: "asc" },
          { createdAt: "desc" },
        ],
      },
    },
  });

  if (!task) {
    notFound();
  }

  // Check if user has access to this task
  const isCEOorAdmin = user.role === ROLE.CEO || user.role === ROLE.CFO;
  const isAssignedTo = task.assignedToId === user.id;
  const isCreatedBy = task.createdById === user.id;

  if (!isCEOorAdmin && !isAssignedTo && !isCreatedBy) {
    notFound();
  }

  // Fetch activity logs related to this task
  const activities = await db.activity.findMany({
    where: {
      OR: [
        { entityType: "TODO", entityId: task.id },
        { description: { contains: task.title } },
      ],
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 20,
  });

  // Get all team members for reassignment
  const teamMembers = await db.user.findMany({
    where: {
      role: {
        in: [ROLE.CEO, ROLE.CFO, ROLE.FRONTEND, ROLE.BACKEND, ROLE.OUTREACH],
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <TaskDetailClient
      task={task}
      activities={activities}
      teamMembers={teamMembers}
      currentUser={{
        id: user.id,
        name: user.name,
        email: user.email || "",
        role: user.role,
      }}
    />
  );
}
