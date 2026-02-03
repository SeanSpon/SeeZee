/**
 * Git Dashboard Page
 * Comprehensive GitHub activity tracking for the team
 */

import { GitDashboard } from "@/components/admin/git/GitDashboard";
import { requireRole } from "@/lib/auth/requireRole";

export const dynamic = "force-dynamic";

export default async function GitDashboardPage() {
  // Require admin access (CEO, CFO, or any developer role)
  await requireRole(["CEO", "CFO", "FRONTEND", "BACKEND", "OUTREACH"]);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-heading font-bold text-white mb-2">
          Git Dashboard
        </h1>
        <p className="text-slate-400">
          Team GitHub activity, commits, pull requests, and repositories
        </p>
      </header>

      <GitDashboard 
        showStats={true}
        showActivity={true}
        showRepos={true}
        maxItems={20}
      />
    </div>
  );
}
