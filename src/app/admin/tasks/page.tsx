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

  const tasks = tasksResult.success ? tasksResult.tasks : [];
  const stats = statsResult.success ? statsResult.stats : { total: 0, todo: 0, inProgress: 0, done: 0, overdue: 0 };

  // Debug info to pass to client
  const serverDebug = {
    tasksResultSuccess: tasksResult.success,
    tasksResultError: (tasksResult as any).error || null,
    tasksResultErrorDetails: (tasksResult as any).errorDetails || null,
    tasksCount: tasksResult.tasks?.length ?? 0,
    statsResultSuccess: statsResult.success,
  };

  return (
    <div className="space-y-6">
      {/* Server-side debug info */}
      <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-3 text-blue-200 text-sm font-mono">
        <strong>SERVER DEBUG:</strong><br/>
        getTasks success: {String(serverDebug.tasksResultSuccess)}<br/>
        getTasks error: {serverDebug.tasksResultError || 'none'}<br/>
        {serverDebug.tasksResultErrorDetails && (
          <>errorDetails: {serverDebug.tasksResultErrorDetails}<br/></>
        )}
        getTasks count: {serverDebug.tasksCount}<br/>
        getTaskStats success: {String(serverDebug.statsResultSuccess)}
      </div>
      <TasksClient initialTasks={tasks as any} stats={stats} />
    </div>
  );
}

