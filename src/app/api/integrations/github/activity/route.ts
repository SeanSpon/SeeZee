import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

const ADMIN_ROLES = ["CEO", "CFO", "ADMIN", "DEV", "FRONTEND", "BACKEND"];

interface GitHubEvent {
  id: string;
  type: string;
  repo: {
    name: string;
    url: string;
  };
  actor: {
    login: string;
    avatar_url: string;
  };
  payload: any;
  created_at: string;
}

/**
 * GET /api/integrations/github/activity
 * Fetch recent GitHub activity for the organization/user
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!ADMIN_ROLES.includes(session.user.role || "")) {
      return NextResponse.json({ error: "Admin role required" }, { status: 403 });
    }

    const searchParams = req.nextUrl.searchParams;
    const username = searchParams.get("username") || "SeanSpon";
    const per_page = parseInt(searchParams.get("per_page") || "30");

    const githubToken = process.env.GITHUB_TOKEN;
    const headers: HeadersInit = {
      Accept: "application/vnd.github.v3+json",
    };

    if (githubToken) {
      headers.Authorization = `Bearer ${githubToken}`;
    }

    // Fetch user events
    const eventsRes = await fetch(
      `https://api.github.com/users/${username}/events?per_page=${per_page}`,
      { headers }
    );

    if (!eventsRes.ok) {
      return NextResponse.json({
        events: [],
        error: "Failed to fetch GitHub events",
      });
    }

    const events: GitHubEvent[] = await eventsRes.json();

    // Transform events into a cleaner format
    const transformedEvents = events.map((event) => {
      let action = "";
      let details = "";

      switch (event.type) {
        case "PushEvent":
          const commits = event.payload.commits || [];
          action = "pushed";
          details = commits.length > 0 ? commits[0].message : `${commits.length} commits`;
          break;
        case "PullRequestEvent":
          action = event.payload.action;
          details = event.payload.pull_request?.title || "";
          break;
        case "IssuesEvent":
          action = `${event.payload.action} issue`;
          details = event.payload.issue?.title || "";
          break;
        case "CreateEvent":
          action = `created ${event.payload.ref_type}`;
          details = event.payload.ref || "";
          break;
        case "DeleteEvent":
          action = `deleted ${event.payload.ref_type}`;
          details = event.payload.ref || "";
          break;
        case "WatchEvent":
          action = "starred";
          break;
        case "ForkEvent":
          action = "forked";
          break;
        default:
          action = event.type.replace("Event", "").toLowerCase();
      }

      return {
        id: event.id,
        type: event.type,
        action,
        details,
        repo: event.repo.name,
        repoUrl: `https://github.com/${event.repo.name}`,
        actor: {
          username: event.actor.login,
          avatar: event.actor.avatar_url,
        },
        createdAt: event.created_at,
      };
    });

    // Fetch repos
    const reposRes = await fetch(
      `https://api.github.com/users/${username}/repos?sort=pushed&per_page=10`,
      { headers }
    );

    let repos: any[] = [];
    if (reposRes.ok) {
      const repoData = await reposRes.json();
      repos = repoData.map((repo: any) => ({
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description,
        url: repo.html_url,
        language: repo.language,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        pushedAt: repo.pushed_at,
        isPrivate: repo.private,
      }));
    }

    return NextResponse.json({
      events: transformedEvents,
      repos,
      username,
    });
  } catch (error) {
    console.error("[GET /api/integrations/github/activity]", error);
    return NextResponse.json(
      { error: "Failed to fetch GitHub activity" },
      { status: 500 }
    );
  }
}
