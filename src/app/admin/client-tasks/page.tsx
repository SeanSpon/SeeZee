import { ClientTasksClient } from "@/components/admin/ClientTasksClient";
import { prisma } from "@/lib/prisma";

interface TaskRow {
  id: string;
  title: string;
  description: string;
  project: string;
  projectId: string;
  client: string;
  organizationId: string;
  organizationName: string;
  status: string;
  priority: string;
  dueDate: string | null;
  type: string;
  requiresUpload: boolean;
  createdAt: string;
  completedAt: string | null;
  submissionNotes: string | null;
  data: any;
  createdBy: {
    id: string;
    name: string | null;
    email: string;
  } | null;
}

export const dynamic = "force-dynamic";

export default async function ClientTasksPage() {
  // Auth check is handled in layout.tsx to prevent flash

  // Fetch ALL client tasks across all projects
  const clientTasks = await prisma.clientTask.findMany({
    include: {
      project: {
        include: {
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: [
      { status: "asc" },
      { dueDate: "asc" },
      { createdAt: "desc" },
    ],
  });

  const rows: TaskRow[] = clientTasks.map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description,
    project: task.project?.name ?? "Unassigned",
    projectId: task.projectId,
    client: task.project?.organization?.name ?? "—",
    organizationId: task.project?.organizationId ?? "",
    organizationName: task.project?.organization?.name ?? "—",
    status: task.status,
    priority: "medium", // ClientTask doesn't have priority, using default
    dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : null,
    type: task.type,
    requiresUpload: task.requiresUpload,
    createdAt: task.createdAt.toISOString(),
    completedAt: task.completedAt ? task.completedAt.toISOString() : null,
    submissionNotes: task.submissionNotes,
    data: task.data,
    createdBy: task.createdBy ? {
      id: task.createdBy.id,
      name: task.createdBy.name,
      email: task.createdBy.email,
    } : null,
  }));

  const overdue = rows.filter(
    (task) => task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "completed",
  ).length;

  const openTasks = rows.filter((task) => task.status !== "completed").length;

  return (
    <div className="space-y-8">
      <header className="space-y-3 relative">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-trinity-red glow-on-hover inline-block">
          Client Delivery
        </span>
        <h1 className="text-4xl font-heading font-bold gradient-text">Client Tasks</h1>
        <p className="max-w-2xl text-base text-gray-300 leading-relaxed">
          Monitor all client tasks and assignments across every project. Create new assignments with file attachments, track progress, and ensure everyone completes their deliverables.
        </p>
      </header>

      <ClientTasksClient rows={rows} overdue={overdue} openTasks={openTasks} />
    </div>
  );
}


