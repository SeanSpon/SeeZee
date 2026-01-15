import { getCurrentUser } from "@/lib/auth/requireRole";
import { getGoals, getTeamMembers } from "@/server/actions/goals";
import { GoalsPageClient } from "./GoalsPageClient";

export const dynamic = "force-dynamic";

export default async function AdminGoalsPage() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const [goalsResult, teamMembersResult] = await Promise.all([
    getGoals(),
    getTeamMembers(),
  ]);

  const goals = (goalsResult.success ? goalsResult.goals : []) ?? [];
  const teamMembers = (teamMembersResult.success ? teamMembersResult.teamMembers : []) ?? [];

  // Calculate stats (goals is guaranteed to be an array now)
  const totalGoals = goals?.length ?? 0;
  const completedGoals = goals?.filter((g: any) => g.status === "COMPLETED").length ?? 0;
  const inProgressGoals = goals?.filter((g: any) => 
    ["IN_PROGRESS", "ON_TRACK", "AT_RISK", "DELAYED"].includes(g.status)
  ).length ?? 0;
  const notStartedGoals = goals?.filter((g: any) => g.status === "NOT_STARTED").length ?? 0;

  return (
    <GoalsPageClient
      user={user}
      initialData={{
        goals,
        teamMembers,
        stats: {
          total: totalGoals,
          completed: completedGoals,
          inProgress: inProgressGoals,
          notStarted: notStartedGoals,
        },
      }}
    />
  );
}
