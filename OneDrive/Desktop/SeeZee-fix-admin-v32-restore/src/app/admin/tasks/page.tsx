/**
 * Tasks Management
 */

import { getTasks, getTaskStats } from "@/server/actions";
import { TasksClient } from "@/components/admin/TasksClient";
import { AdminAppShell } from "@/components/admin/AdminAppShell";
import { getCurrentUser } from "@/lib/auth/requireRole";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    return null;
  }

  const [tasksResult, statsResult] = await Promise.all([
    getTasks(),
    getTaskStats(),
  ]);

  const tasks = tasksResult.success ? tasksResult.tasks : [];
  const stats = statsResult.success ? statsResult.stats : { total: 0, todo: 0, inProgress: 0, done: 0, overdue: 0 };

  return (
    <AdminAppShell user={user}>
      <div className="space-y-6">
        <TasksClient initialTasks={tasks as any} stats={stats} />
      </div>
    </AdminAppShell>
  );
}

