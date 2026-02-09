/**
 * CEO Team Management Center
 * Full control over team assignments: Learning Resources, Tools, Tasks
 */

import { getTeamWorkload } from "@/server/actions/ceo";
import { getTasks } from "@/server/actions/tasks";
import { getLearningResources, getTools } from "@/server/actions/learning";
import { TeamManagementClient } from "@/components/ceo/TeamManagementClient";
import { db } from "@/server/db";
import { requireRole } from "@/lib/auth/requireRole";
import { ROLE } from "@/lib/role";

export const dynamic = "force-dynamic";

export default async function TeamManagementPage() {
  await requireRole([ROLE.CEO]);

  const [workloadResult, tasksResult, resourcesResult, toolsResult, usersResult] = await Promise.all([
    getTeamWorkload(),
    getTasks({ status: "TODO" }),
    getLearningResources(),
    getTools(),
    // Get all team users directly (CEO has access)
    db.user.findMany({
      where: {
        role: { in: ["CEO", "CFO", "FRONTEND", "BACKEND", "OUTREACH"] },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
      },
      orderBy: { name: "asc" },
    }),
  ]);

  const workload = workloadResult.success ? (workloadResult.workload || []) : [];
  const tasks = tasksResult.success ? (tasksResult.tasks || []) : [];
  const resources = resourcesResult.success ? (resourcesResult.resources || []) : [];
  const tools = toolsResult.success ? (toolsResult.tools || []) : [];
  const users = usersResult || [];

  return (
    <TeamManagementClient
      workload={workload}
      users={users}
      availableTasks={tasks}
      availableResources={resources}
      availableTools={tools}
    />
  );
}

