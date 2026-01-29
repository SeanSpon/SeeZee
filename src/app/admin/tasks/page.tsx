/**
 * Tasks Management
 */

import { getTasks, getTaskStats } from "@/server/actions";
import { TasksClient } from "@/components/admin/TasksClient";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  // Auth check is handled in layout.tsx to prevent flash

  const [tasksResult, statsResult] = await Promise.all([
    getTasks({ showAll: true }), // Show all tasks for admin page
    getTaskStats(),
  ]);

  console.log("[TasksPage] tasksResult.success:", tasksResult.success);
  console.log("[TasksPage] tasksResult.tasks count:", tasksResult.tasks?.length ?? 0);
  if (!tasksResult.success) {
    console.log("[TasksPage] tasksResult.error:", (tasksResult as any).error);
  }

  const tasks = tasksResult.success ? tasksResult.tasks : [];
  const stats = statsResult.success ? statsResult.stats : { total: 0, todo: 0, inProgress: 0, done: 0, overdue: 0 };

  console.log("[TasksPage] Passing", tasks.length, "tasks to TasksClient");

  return (
    <div className="space-y-6">
      <TasksClient initialTasks={tasks as any} stats={stats} />
    </div>
  );
}

