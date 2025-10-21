/**
 * Pipeline Kanban View - Now with real data
 */

import { getPipeline, getProjects, getInvoices } from "@/server/actions/pipeline";
import { KanbanClient } from "@/components/admin/KanbanClient";

export const dynamic = "force-dynamic";

export default async function PipelineKanbanPage() {
  const [pipelineResult, projectsResult, invoicesResult] = await Promise.all([
    getPipeline(),
    getProjects(),
    getInvoices(),
  ]);

  const pipeline = pipelineResult.success ? pipelineResult.pipeline : null;
  const projects = projectsResult.success ? projectsResult.projects : [];
  const invoices = invoicesResult.success ? invoicesResult.invoices : [];

  return <KanbanClient pipeline={pipeline} projects={projects} invoices={invoices} />;
}
