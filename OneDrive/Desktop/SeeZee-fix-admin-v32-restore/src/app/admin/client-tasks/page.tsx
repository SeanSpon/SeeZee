import { AdminAppShell } from "@/components/admin/AdminAppShell";
import { getCurrentUser } from "@/lib/auth/requireRole";
import { ClientTasksClient } from "@/components/admin/ClientTasksClient";

interface TaskRow {
  id: string;
  title: string;
  project: string;
  client: string;
  status: string;
  priority: string;
  dueDate: string | null;
}

export const dynamic = "force-dynamic";

export default async function ClientTasksPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    return null;
  }

  const { getTasks } = await import("@/server/actions/tasks");
  const tasksResult = await getTasks({ status: undefined });
  const tasks = tasksResult.success ? tasksResult.tasks : [];

  const rows: TaskRow[] = tasks.map((task: any) => ({
    id: task.id,
    title: task.title,
    project: task.project?.name ?? "Unassigned",
    client: task.project?.organization?.name ?? task.project?.clientName ?? "—",
    status: String(task.status ?? "").toLowerCase(),
    priority: String(task.priority ?? "").toLowerCase(),
    dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : null,
  }));

  const overdue = rows.filter(
    (task) => task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done",
  ).length;

  const openTasks = rows.filter((task) => task.status !== "done").length;

  return (
    <AdminAppShell user={user}>
      <div className="space-y-8">
        <header className="space-y-3 relative">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-trinity-red glow-on-hover inline-block">
            Client Delivery
          </span>
          <h1 className="text-4xl font-heading font-bold gradient-text">Client Tasks</h1>
          <p className="max-w-2xl text-base text-gray-300 leading-relaxed">
            Monitor deliverables and automation touchpoints across every client engagement. Prioritize, reassign, and track progress in one view.
          </p>
        </header>

        <ClientTasksClient rows={rows} overdue={overdue} openTasks={openTasks} />
      </div>
    </AdminAppShell>
  );
}


