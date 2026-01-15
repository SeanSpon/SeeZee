/**
 * CEO Task Management Dashboard
 */

import { db } from "@/server/db";
import { requireRole } from "@/lib/auth/requireRole";
import { TasksManagementClient } from "@/components/ceo/TasksManagementClient";
import { ROLE } from "@/lib/role";

export const dynamic = "force-dynamic";

export default async function CEOTasksPage() {
  await requireRole([ROLE.CEO]);

  // Fetch all tasks with assignee info
  const [tasks, users] = await Promise.all([
    db.todo.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        dueDate: true,
        createdAt: true,
        completedAt: true,
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    }),
    db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      where: {
        role: { in: ['ADMIN', 'STAFF'] }
      }
    }),
  ]);

  // Calculate task statistics
  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'TODO').length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    done: tasks.filter(t => t.status === 'DONE').length,
    overdue: tasks.filter(t => {
      if (!t.dueDate || t.status === 'DONE') return false;
      return new Date(t.dueDate) < new Date();
    }).length,
    byPriority: {
      high: tasks.filter(t => t.priority === 'HIGH' && t.status !== 'DONE').length,
      medium: tasks.filter(t => t.priority === 'MEDIUM' && t.status !== 'DONE').length,
      low: tasks.filter(t => t.priority === 'LOW' && t.status !== 'DONE').length,
    },
    byUser: {} as Record<string, number>,
  };

  // Count tasks by user
  tasks.forEach(task => {
    if (task.assignedTo && task.status !== 'DONE') {
      const userId = task.assignedTo.id;
      stats.byUser[userId] = (stats.byUser[userId] || 0) + 1;
    }
  });

  return <TasksManagementClient tasks={tasks} users={users} stats={stats} />;
}

