/**
 * CEO Learning Hub Management
 * Full control over training, resources, and tools
 */

import { getLearningResources, getTools } from "@/server/actions/learning";
import { LearningHubManagementClient } from "@/components/ceo/LearningHubManagementClient";
import { requireRole } from "@/lib/auth/requireRole";
import { ROLE } from "@/lib/role";

export const dynamic = "force-dynamic";

export default async function LearningHubManagementPage() {
  await requireRole([ROLE.CEO]);

  const [resourcesResult, toolsResult] = await Promise.all([
    getLearningResources(),
    getTools(),
  ]);

  const resources = resourcesResult.success ? (resourcesResult.resources || []) : [];
  const tools = toolsResult.success ? (toolsResult.tools || []) : [];

  return (
    <LearningHubManagementClient
      resources={resources}
      tools={tools}
    />
  );
}

