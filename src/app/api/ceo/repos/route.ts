import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/authz";

/**
 * GET /api/ceo/repos
 * Fetch all GitHub repositories for map visualization
 */
export async function GET() {
  try {
    await requireAdmin();

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
      { headers, next: { revalidate: 300 } } // Cache for 5 minutes
    );

    if (!reposRes.ok) {
      return NextResponse.json({
        repos: [],
        error: "Failed to fetch GitHub repositories",
      });
    }

    const repos = await reposRes.json();
    
    // Format repos for map
    const formattedRepos = repos.map((r: any) => ({
      id: r.id,
      name: r.name,
      fullName: r.full_name,
      url: r.html_url,
      cloneUrl: r.clone_url,
      description: r.description,
      language: r.language,
      isPrivate: r.private,
      defaultBranch: r.default_branch,
      pushedAt: r.pushed_at,
      updatedAt: r.updated_at,
    }));

    return NextResponse.json({
      repos: formattedRepos,
      configured: true,
    });
  } catch (error) {
    console.error("[GET /api/ceo/repos]", error);
    return NextResponse.json(
      { error: "Failed to fetch GitHub repositories" },
      { status: 500 }
    );
  }
}
