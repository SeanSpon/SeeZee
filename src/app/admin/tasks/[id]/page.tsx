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

  // Fetch task with full details using explicit select to avoid missing columns
  // Note: Some columns like milestoneId may not exist in production database
  const task = await db.todo.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      priority: true,
      dueDate: true,
      completedAt: true,
      createdAt: true,
      updatedAt: true,
      projectId: true,
      assignedToId: true,
      createdById: true,
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
    },
  });

  if (!task) {
    notFound();
  }

  // Try to fetch materials separately - table may not exist in production
  let materials: any[] = [];
  try {
    materials = await db.taskMaterial.findMany({
      where: { todoId: id },
      orderBy: [
        { order: "asc" },
        { createdAt: "desc" },
      ],
    });
  } catch (error) {
    // TaskMaterial table may not exist in production database
    console.warn("Failed to fetch task materials (table may not exist):", error);
  }

  // Combine task with materials
  const taskWithMaterials = { ...task, materials };

  // Check if user has access to this task
  const isCEOorAdmin = user.role === ROLE.CEO || user.role === ROLE.CFO;
  const isAssignedTo = taskWithMaterials.assignedToId === user.id;
  const isCreatedBy = taskWithMaterials.createdById === user.id;

  if (!isCEOorAdmin && !isAssignedTo && !isCreatedBy) {
    notFound();
  }

  // Fetch activity logs related to this task
  let activities: any[] = [];
  try {
    activities = await db.activity.findMany({
      where: {
        OR: [
          { entityType: "TODO", entityId: taskWithMaterials.id },
          { description: { contains: taskWithMaterials.title } },
        ],
      },
      select: {
        id: true,
        type: true,
        title: true,
        description: true,
        createdAt: true,
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
  } catch (error) {
    console.warn("Failed to fetch activities:", error);
  }

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

  // Serialize data to ensure all fields are JSON-safe (Dates, Decimals, BigInts)
  // Use JSON.parse/stringify for safer serialization
  const serializedTask = JSON.parse(JSON.stringify(taskWithMaterials, (key, value) => {
    if (value instanceof Date) {
      return value.toISOString();
    }
    if (value && typeof value === 'object' && value.constructor?.name === 'Decimal') {
      return value.toString();
    }
    if (typeof value === 'bigint') {
      return value.toString();
    }
    return value;
  }));
  const serializedActivities = JSON.parse(JSON.stringify(activities, (key, value) => {
    if (value instanceof Date) {
      return value.toISOString();
    }
    if (value && typeof value === 'object' && value.constructor?.name === 'Decimal') {
      return value.toString();
    }
    if (typeof value === 'bigint') {
      return value.toString();
    }
    return value;
  }));

  return (
    <TaskDetailClient
      task={serializedTask}
      activities={serializedActivities}
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
