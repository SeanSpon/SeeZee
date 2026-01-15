import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { feedHelpers } from "@/lib/feed/emit";

/**
 * GET /api/github/summary?projectId=xxx&since=YYYY-MM-DD
 * Fetch recent GitHub commits and emit to project feed
 */
export async function GET(req: NextRequest) {
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  const since = searchParams.get("since"); // Optional: YYYY-MM-DD format

  if (!projectId) {
    return NextResponse.json({ error: "projectId required" }, { status: 400 });
  }

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const GITHUB_REPO = process.env.GITHUB_REPO_SLUG; // e.g., "owner/repo"

  if (!GITHUB_TOKEN || !GITHUB_REPO) {
    return NextResponse.json({ 
      error: "GitHub integration not configured" 
    }, { status: 503 });
  }

  try {
    // Build GitHub API URL
    let apiUrl = `https://api.github.com/repos/${GITHUB_REPO}/commits?per_page=10`;
    if (since) {
      apiUrl += `&since=${since}T00:00:00Z`;
    }

    // Fetch commits from GitHub
    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    const commits = await response.json();

    if (commits.length === 0) {
      return NextResponse.json({ 
        message: "No new commits found",
        count: 0,
      });
    }

    // Format commits for feed payload
    const formattedCommits = commits.slice(0, 5).map((commit: any) => ({
      sha: commit.sha.substring(0, 7),
      message: commit.commit.message.split("\n")[0], // First line only
      author: commit.commit.author.name,
      date: commit.commit.author.date,
      url: commit.html_url,
    }));

    // Emit feed event
    await feedHelpers.commitSummary(projectId, formattedCommits);

    return NextResponse.json({
      success: true,
      count: commits.length,
      displayed: formattedCommits.length,
      commits: formattedCommits,
    });
  } catch (error) {
    console.error("[GitHub Summary Error]", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch GitHub commits",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
