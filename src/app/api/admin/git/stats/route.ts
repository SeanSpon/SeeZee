import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { 
  checkGitHubConnection, 
  fetchUserActivity, 
  fetchUserRepositories,
  fetchRateLimit 
} from "@/lib/git/github-service";

const ADMIN_ROLES = ["ADMIN", "CEO", "CFO", "STAFF", "FRONTEND", "BACKEND", "OUTREACH", "DESIGNER", "DEV"];

/**
 * GET /api/admin/git/stats
 * Get comprehensive Git statistics and connection status
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!ADMIN_ROLES.includes(session.user.role || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check connection status
    const config = await checkGitHubConnection();
    
    // Get rate limit
    const rateLimit = await fetchRateLimit();

    // Get recent activity
    const activity = await fetchUserActivity(config.username, { perPage: 50 });

    // Get repos
    const repos = await fetchUserRepositories(config.username, { perPage: 20 });

    // Calculate stats
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const pushEvents = activity.filter((e) => e.type === "push");
    const prEvents = activity.filter((e) => e.type === "pr");
    const issueEvents = activity.filter((e) => e.type === "issue");

    const stats = {
      commitsToday: pushEvents.filter((e) => new Date(e.createdAt) >= today).length,
      commitsThisWeek: pushEvents.filter((e) => new Date(e.createdAt) >= oneWeekAgo).length,
      commitsThisMonth: pushEvents.filter((e) => new Date(e.createdAt) >= oneMonthAgo).length,
      prsThisWeek: prEvents.filter((e) => new Date(e.createdAt) >= oneWeekAgo).length,
      issuesThisWeek: issueEvents.filter((e) => new Date(e.createdAt) >= oneWeekAgo).length,
      activeRepos: repos.length,
      totalStars: repos.reduce((sum, r) => sum + r.stars, 0),
      totalForks: repos.reduce((sum, r) => sum + r.forks, 0),
      lastActivity: activity[0]?.createdAt || null,
    };

    // Repo activity breakdown
    const repoActivity = repos.slice(0, 10).map((repo) => ({
      name: repo.name,
      fullName: repo.fullName,
      language: repo.language,
      stars: repo.stars,
      forks: repo.forks,
      openIssues: repo.openIssues,
      pushedAt: repo.pushedAt,
      url: repo.url,
    }));

    return NextResponse.json({
      configured: config.configured,
      username: config.username,
      organization: config.organization,
      stats,
      repoActivity,
      rateLimit: rateLimit ? {
        limit: rateLimit.limit,
        remaining: rateLimit.remaining,
        reset: rateLimit.reset.toISOString(),
        percentUsed: Math.round(((rateLimit.limit - rateLimit.remaining) / rateLimit.limit) * 100),
      } : null,
      recentActivity: activity.slice(0, 20).map((a) => ({
        id: a.id,
        type: a.type,
        action: a.action,
        description: a.description,
        repo: a.repo,
        createdAt: a.createdAt,
        url: a.url,
      })),
    });
  } catch (error) {
    console.error("[GET /api/admin/git/stats]", error);
    return NextResponse.json(
      { error: "Failed to fetch Git stats" },
      { status: 500 }
    );
  }
}
