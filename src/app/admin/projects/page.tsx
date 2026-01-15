import { getCurrentUser } from "@/lib/auth/requireRole";
import { getProjects, getClients, getAdmins } from "@/server/actions";
import { ProjectsPageClient } from "./ProjectsPageClient";

interface ProjectRow {
  id: string;
  name: string;
  client: string;
  status: string;
  budget: number | null;
  dueDate: string | null;
  assignee: string;
  progress: number;
}

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const [projectsResult, clientsResult, adminsResult] = await Promise.all([
    getProjects(),
    getClients(),
    getAdmins(),
  ]);

  const projects = projectsResult.success ? projectsResult.projects : [];
  const clients = clientsResult.success ? clientsResult.clients : [];
  const admins = adminsResult.success ? adminsResult.admins : [];

  const rows: ProjectRow[] = projects.map((project: any) => ({
    id: project.id,
    name: project.name,
    client: project.organization?.name ?? project.lead?.company ?? "Unassigned",
    status: String(project.status ?? ""),
    budget: project.budget != null ? Number(project.budget) : null,
    dueDate: project.endDate ? new Date(project.endDate).toISOString() : null,
    assignee:
      project.assignee?.name ?? project.assignee?.email ?? project.assignedToRole ?? "Unassigned",
    progress: project.progress ?? 0,
  }));

  const totalBudget = rows.reduce((sum, project) => sum + (project.budget ?? 0), 0);
  const activeProjects = rows.filter(
    (project) => !["ARCHIVED", "COMPLETED"].includes(project.status.toUpperCase())
  ).length;

  return (
    <ProjectsPageClient
      user={user}
      initialData={{
        projects: rows,
        totalBudget,
        activeProjects,
        clients,
        admins,
      }}
    />
  );
}


