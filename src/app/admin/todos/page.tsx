import { TodosClient } from "@/components/admin/TodosClient";

interface TodoRow {
  id: string;
  title: string;
  project: string;
  dueDate: string | null;
  status: string;
}

export const dynamic = "force-dynamic";

export default async function AdminTodosPage() {
  // Auth check is handled in layout.tsx to prevent flash

  try {
    const { getTasks } = await import("@/server/actions/tasks");
    const tasksResult = await getTasks({ status: "TODO" as any });
    const tasks = tasksResult.success ? tasksResult.tasks : [];

    const rows: TodoRow[] = tasks.map((task: any) => ({
      id: task.id,
      title: task.title,
      project: task.project?.name ?? "—",
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : null,
      status: String(task.status ?? "todo").toLowerCase(),
    }));

    return (
      <div className="space-y-8">
        <header className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-trinity-red">
            Execution Queue
          </span>
          <h1 className="text-3xl font-heading font-bold text-white">Todos</h1>
          <p className="max-w-2xl text-sm text-gray-400">
            Focus mode for tasks that need action. Knock out deliverables, clear blockers, and keep velocity high.
          </p>
        </header>

        <TodosClient rows={rows} />
      </div>
    );
  } catch (error) {
    console.error('Todos Page Error:', error);
    
    return (
      <div className="space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-heading font-bold text-white">Todos</h1>
        </header>
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
          <h2 className="text-xl font-bold text-red-400 mb-2">Error Loading Todos</h2>
          <p className="text-gray-300 mb-4">
            Unable to load todos. Please check database connection and environment variables.
          </p>
          <details className="bg-black/30 p-4 rounded-lg">
            <summary className="text-sm text-gray-400 cursor-pointer">Technical Details</summary>
            <pre className="text-xs text-red-300 mt-2 overflow-auto">
              {error instanceof Error ? error.message : String(error)}
            </pre>
          </details>
        </div>
      </div>
    );
  }
}

