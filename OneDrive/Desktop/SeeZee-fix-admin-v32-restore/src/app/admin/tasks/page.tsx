/**
 * Tasks Management
 */

import { getTasks, getTaskStats } from "@/server/actions";
import { TasksClient } from "@/components/admin/TasksClient";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const [tasksResult, statsResult] = await Promise.all([
    getTasks(),
    getTaskStats(),
  ]);

  const tasks = tasksResult.success ? tasksResult.tasks : [];
  const stats = statsResult.success ? statsResult.stats : { total: 0, todo: 0, inProgress: 0, done: 0, overdue: 0 };

  return (
    <div className="space-y-6">
      <TasksClient initialTasks={tasks} stats={stats} />
    </div>
  );
}

