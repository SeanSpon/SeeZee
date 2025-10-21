/**
 * Projects Management
 */

import { getProjects } from "@/server/actions/pipeline";
import { ProjectsClient } from "@/components/admin/ProjectsClient";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const result = await getProjects();
  const projects = result.success ? result.projects : [];

  return <ProjectsClient projects={projects} />;
}

