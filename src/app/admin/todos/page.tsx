import { TodosClient } from "@/components/admin/TodosClient";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminTodosPage() {
  // Auth check is handled in layout.tsx to prevent flash
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  try {
    const { getTasks } = await import("@/server/actions/tasks");
    const { db } = await import("@/server/db");
    
    // Fetch user's tasks and available tasks (not filtered by status - show all)
    const tasksResult = await getTasks({});
    const tasks = tasksResult.success ? tasksResult.tasks : [];
    
    // Fetch all projects with GitHub repos for linking
    const projects = await db.project.findMany({
      select: {
        id: true,
        name: true,
        githubRepo: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    // Fetch staff users for assignment
    const staffUsers = await db.user.findMany({
      where: {
        role: {
          in: ["CEO", "ADMIN", "CFO", "STAFF", "DEV", "DESIGNER", "FRONTEND", "BACKEND"],
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
      <div className="space-y-8">
        <header className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-trinity-red">
            Personal Task Queue
          </span>
          <h1 className="text-3xl font-heading font-bold text-white">My Todos</h1>
          <p className="max-w-2xl text-sm text-gray-400">
            Your personal task queue. Track what's assigned to you, claim available tasks, and manage your workflow. 
            Tasks connected to projects with GitHub repos can link directly to issues.
          </p>
        </header>

        <TodosClient 
          tasks={tasks as any} 
          userId={session.user.id}
          userRole={session.user.role || ""}
          projects={projects}
          staffUsers={staffUsers}
        />
      </div>
    );
  } catch (error) {
    console.error('Todos Page Error:', error);
    
    return (
      <div className="space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-heading font-bold text-white">My Todos</h1>
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

