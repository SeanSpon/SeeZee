import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { fetchIssues, parseRepoUrl } from "@/lib/git/github-service";
import { prisma } from "@/lib/prisma";

const ADMIN_ROLES = ["ADMIN", "CEO", "CFO", "STAFF", "FRONTEND", "BACKEND", "OUTREACH", "DESIGNER", "DEV"];

/**
 * GET /api/admin/git/issues
 * Fetch issues - either for a specific repo or aggregated across all project repos
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
    const state = (searchParams.get("state") as "open" | "closed" | "all") || "open";
    const perPage = parseInt(searchParams.get("per_page") || "20");
    const labels = searchParams.get("labels") || undefined;

    // If specific repo is provided, fetch issues for that repo
    if (owner && repo) {
      const issues = await fetchIssues(owner, repo, { state, perPage, labels });
      return NextResponse.json({
        issues: issues.map((issue) => ({
          ...issue,
          repo: `${owner}/${repo}`,
        })),
      });
    }

    // Otherwise, fetch issues from all project repositories
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

    const allIssues: any[] = [];

    for (const project of projects) {
      if (!project.githubRepo) continue;
      
      const parsed = parseRepoUrl(project.githubRepo);
      if (!parsed) continue;

      const issues = await fetchIssues(parsed.owner, parsed.repo, { state, perPage: 10 });
      allIssues.push(
        ...issues.map((issue) => ({
          ...issue,
          repo: `${parsed.owner}/${parsed.repo}`,
          projectId: project.id,
          projectName: project.name,
        }))
      );
    }

    // Sort by updated date
    allIssues.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return NextResponse.json({
      issues: allIssues.slice(0, perPage),
      total: allIssues.length,
    });
  } catch (error) {
    console.error("[GET /api/admin/git/issues]", error);
    return NextResponse.json(
      { error: "Failed to fetch issues" },
      { status: 500 }
    );
  }
}
