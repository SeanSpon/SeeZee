import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { fetchPullRequests, parseRepoUrl } from "@/lib/git/github-service";
import { prisma } from "@/lib/prisma";

const ADMIN_ROLES = ["ADMIN", "CEO", "CFO", "STAFF", "FRONTEND", "BACKEND", "OUTREACH", "DESIGNER", "DEV"];

/**
 * GET /api/admin/git/pull-requests
 * Fetch pull requests - either for a specific repo or aggregated across all project repos
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

    const searchParams = req.nextUrl.searchParams;
    const owner = searchParams.get("owner");
    const repo = searchParams.get("repo");
    const state = (searchParams.get("state") as "open" | "closed" | "all") || "all";
    const perPage = parseInt(searchParams.get("per_page") || "20");

    // If specific repo is provided, fetch PRs for that repo
    if (owner && repo) {
      const pullRequests = await fetchPullRequests(owner, repo, { state, perPage });
      return NextResponse.json({
        pullRequests: pullRequests.map((pr) => ({
          ...pr,
          repo: `${owner}/${repo}`,
        })),
      });
    }

    // Otherwise, fetch PRs from all project repositories
    const projects = await prisma.project.findMany({
      where: {
        githubRepo: { not: null },
        status: { not: "COMPLETED" },
      },
      select: {
        id: true,
        name: true,
        githubRepo: true,
      },
    });

    const allPRs: any[] = [];

    for (const project of projects) {
      if (!project.githubRepo) continue;
      
      const parsed = parseRepoUrl(project.githubRepo);
      if (!parsed) continue;

      const prs = await fetchPullRequests(parsed.owner, parsed.repo, { state, perPage: 10 });
      allPRs.push(
        ...prs.map((pr) => ({
          ...pr,
          repo: `${parsed.owner}/${parsed.repo}`,
          projectId: project.id,
          projectName: project.name,
        }))
      );
    }

    // Sort by updated date
    allPRs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return NextResponse.json({
      pullRequests: allPRs.slice(0, perPage),
      total: allPRs.length,
    });
  } catch (error) {
    console.error("[GET /api/admin/git/pull-requests]", error);
    return NextResponse.json(
      { error: "Failed to fetch pull requests" },
      { status: 500 }
    );
  }
}
