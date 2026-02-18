/**
 * Learning Hub — Role-aware unified page
 * CEO sees all tabs including Analytics & Assignments.
 * Team members see My Learning, Training Library, and Tools.
 */

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getMyAssignments, getToolsWithOnboarding } from "@/server/actions/learning";
import { isCEO } from "@/lib/role";
import LearningHubClient from "./LearningHubClient";

export const dynamic = "force-dynamic";

export default async function LearningPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const userRole = session.user.role as string;
  const userId = session.user.id;
  const userIsCEO = isCEO(userRole);

  // Fetch data in parallel
  const [assignmentsResult, toolsResult] = await Promise.all([
    getMyAssignments(userId),
    getToolsWithOnboarding(),
  ]);

  const assignments = assignmentsResult.success ? assignmentsResult.assignments : [];
  const tools = toolsResult.success ? (toolsResult.tools || []) : [];

  // Serialize dates for client component
  const serializedTools = tools.map((t: any) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    url: t.url,
    category: t.category,
    logoUrl: t.logoUrl,
    pricing: t.pricing,
    tags: t.tags,
    createdAt: t.createdAt instanceof Date ? t.createdAt.toISOString() : t.createdAt,
    onboardingPath: t.onboardingPath
      ? {
          id: t.onboardingPath.id,
          title: t.onboardingPath.title,
          description: t.onboardingPath.description,
          steps: t.onboardingPath.steps.map((s: any) => ({
            id: s.id,
            order: s.order,
            isRequired: s.isRequired,
            training: s.training,
          })),
        }
      : null,
  }));

  return (
    <LearningHubClient
      userRole={userRole}
      userId={userId}
      isCEO={userIsCEO}
      initialAssignments={assignments}
      initialTools={serializedTools}
    />
  );
}
