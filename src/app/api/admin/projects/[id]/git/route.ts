import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const ADMIN_ROLES = ["ADMIN", "CEO", "CFO", "STAFF", "FRONTEND", "BACKEND", "OUTREACH", "DESIGNER", "DEV"];

interface Commit {
  sha: string;
  message: string;
  author: string;
  date: string;
  url: string;
  additions?: number;
  deletions?: number;
}

interface Branch {
  name: string;
  protected: boolean;
  commit?: {
    sha: string;
    url: string;
  };
}

/**
 * GET /api/admin/projects/[id]/git
 * Get comprehensive Git activity for a project
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!ADMIN_ROLES.includes(session.user.role || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const searchParams = req.nextUrl.searchParams;
    const since = searchParams.get("since"); // ISO date
    const per_page = parseInt(searchParams.get("per_page") || "20");
    const branch = searchParams.get("branch");

    // Get project
    const project = await prisma.project.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        githubRepo: true,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (!project.githubRepo) {
      return NextResponse.json({
        commits: [],
        branches: [],
        message: "No GitHub repository connected",
      });
    }

    // Parse repo
    let owner: string | null = null;
    let repo: string | null = null;

    try {
      const repoUrl = project.githubRepo.trim();
      if (repoUrl.startsWith("http")) {
        const url = new URL(repoUrl);
        const pathParts = url.pathname.split("/").filter(Boolean);
        if (pathParts.length >= 2) {
          owner = pathParts[0];
          repo = pathParts[1];
        }
      } else {
        const parts = repoUrl.split("/");
        if (parts.length >= 2) {
          owner = parts[0];
          repo = parts[1];
        }
      }
    } catch (e) {
      return NextResponse.json({
        error: "Invalid repository URL format",
      }, { status: 400 });
    }

    if (!owner || !repo) {
      return NextResponse.json({
        error: "Could not parse repository info",
      }, { status: 400 });
    }

    // GitHub API headers
    const githubHeaders: HeadersInit = {
      Accept: "application/vnd.github.v3+json",
    };

    // Add token if available
    if (process.env.GITHUB_TOKEN) {
      githubHeaders.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    // Fetch commits, branches, and repo info in parallel
    const commitsUrl = new URL(`https://api.github.com/repos/${owner}/${repo}/commits`);
    commitsUrl.searchParams.set("per_page", String(Math.min(per_page, 100)));
    if (since) commitsUrl.searchParams.set("since", since);
    if (branch) commitsUrl.searchParams.set("sha", branch);

    const [commitsRes, branchesRes, repoRes] = await Promise.all([
      fetch(commitsUrl.toString(), { headers: githubHeaders }),
      fetch(`https://api.github.com/repos/${owner}/${repo}/branches`, { headers: githubHeaders }),
      fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers: githubHeaders }),
    ]);

    // Process commits
    let commits: Commit[] = [];
    if (commitsRes.ok) {
      const commitsData = await commitsRes.json();
      commits = commitsData.map((c: any) => ({
        sha: c.sha.substring(0, 7),
        fullSha: c.sha,
        message: c.commit.message.split("\n")[0],
        fullMessage: c.commit.message,
        author: c.commit.author.name,
        authorEmail: c.commit.author.email,
        date: c.commit.author.date,
        url: c.html_url,
        avatar: c.author?.avatar_url,
      }));
    }

    // Process branches
    let branches: Branch[] = [];
    if (branchesRes.ok) {
      const branchesData = await branchesRes.json();
      branches = branchesData.map((b: any) => ({
        name: b.name,
        protected: b.protected,
        commit: {
          sha: b.commit.sha.substring(0, 7),
          url: b.commit.url,
        },
      }));
    }

    // Process repo info
    let repoInfo: any = null;
    if (repoRes.ok) {
      const repoData = await repoRes.json();
      repoInfo = {
        fullName: repoData.full_name,
        description: repoData.description,
        language: repoData.language,
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        openIssues: repoData.open_issues_count,
        defaultBranch: repoData.default_branch,
        pushedAt: repoData.pushed_at,
        visibility: repoData.visibility,
      };
    }

    // Calculate activity stats
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const stats = {
      totalCommits: commits.length,
      commitsThisWeek: commits.filter(c => new Date(c.date) >= oneWeekAgo).length,
      commitsThisMonth: commits.filter(c => new Date(c.date) >= oneMonthAgo).length,
      lastCommit: commits[0] || null,
      uniqueAuthors: [...new Set(commits.map(c => c.author))].length,
    };

    return NextResponse.json({
      repository: {
        owner,
        repo,
        url: `https://github.com/${owner}/${repo}`,
        ...repoInfo,
      },
      commits,
      branches,
      stats,
    });
  } catch (error) {
    console.error("[GET /api/admin/projects/[id]/git]", error);
    return NextResponse.json(
      { error: "Failed to fetch Git activity" },
      { status: 500 }
    );
  }
}
