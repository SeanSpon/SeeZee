import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { fetchWorkflowRuns, parseRepoUrl } from "@/lib/git/github-service";
import { prisma } from "@/lib/prisma";

const ADMIN_ROLES = ["ADMIN", "CEO", "CFO", "STAFF", "FRONTEND", "BACKEND", "OUTREACH", "DESIGNER", "DEV"];

/**
 * GET /api/admin/git/workflows
 * Fetch GitHub Actions workflow runs - either for a specific repo or aggregated
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
    const perPage = parseInt(searchParams.get("per_page") || "10");
    const branch = searchParams.get("branch") || undefined;

    // If specific repo is provided, fetch workflows for that repo
    if (owner && repo) {
      const workflows = await fetchWorkflowRuns(owner, repo, { perPage, branch });
      return NextResponse.json({
        workflows: workflows.map((w) => ({
          ...w,
          repo: `${owner}/${repo}`,
        })),
      });
    }

    // Otherwise, fetch workflows from all project repositories
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

    const allWorkflows: any[] = [];

    for (const project of projects) {
      if (!project.githubRepo) continue;
      
      const parsed = parseRepoUrl(project.githubRepo);
      if (!parsed) continue;

      const workflows = await fetchWorkflowRuns(parsed.owner, parsed.repo, { perPage: 5 });
      allWorkflows.push(
        ...workflows.map((w) => ({
          ...w,
          repo: `${parsed.owner}/${parsed.repo}`,
          projectId: project.id,
          projectName: project.name,
        }))
      );
    }

    // Sort by created date
    allWorkflows.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      workflows: allWorkflows.slice(0, perPage),
      total: allWorkflows.length,
    });
  } catch (error) {
    console.error("[GET /api/admin/git/workflows]", error);
    return NextResponse.json(
      { error: "Failed to fetch workflow runs" },
      { status: 500 }
    );
  }
}
