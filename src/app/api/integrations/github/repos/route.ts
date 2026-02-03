import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

const ADMIN_ROLES = ["CEO", "CFO", "ADMIN", "DEV", "FRONTEND", "BACKEND"];

/**
 * GET /api/integrations/github/repos
 * Fetch all GitHub repositories for dropdown selection
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

    const githubToken = process.env.GITHUB_TOKEN;
    const githubUsername = process.env.GITHUB_USERNAME || "SeanSpon";

    if (!githubToken) {
      return NextResponse.json({
        repos: [],
        error: "GitHub integration not configured",
      });
    }

    const headers = {
      Authorization: `Bearer ${githubToken}`,
      Accept: "application/vnd.github.v3+json",
    };

    // Fetch user's repos
    const reposRes = await fetch(
      `https://api.github.com/users/${githubUsername}/repos?per_page=100&sort=updated`,
      { headers }
    );

    if (!reposRes.ok) {
      return NextResponse.json({
        repos: [],
        error: "Failed to fetch GitHub repositories",
      });
    }

    const repos = await reposRes.json();
    
    // Format repos for dropdown
    const formattedRepos = repos.map((r: any) => ({
      id: r.id,
      name: r.name,
      fullName: r.full_name,
      url: r.html_url,
      description: r.description,
      language: r.language,
      isPrivate: r.private,
      defaultBranch: r.default_branch,
    }));

    return NextResponse.json({
      repos: formattedRepos,
      configured: true,
    });
  } catch (error) {
    console.error("[GET /api/integrations/github/repos]", error);
    return NextResponse.json(
      { error: "Failed to fetch GitHub repositories" },
      { status: 500 }
    );
  }
}
