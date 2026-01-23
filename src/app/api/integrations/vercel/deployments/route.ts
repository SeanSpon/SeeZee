import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

const ADMIN_ROLES = ["CEO", "CFO", "ADMIN", "DEV", "FRONTEND", "BACKEND"];
const VERCEL_API_URL = "https://api.vercel.com";

/**
 * GET /api/integrations/vercel/deployments
 * Fetch recent Vercel deployments across all projects
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

    const vercelToken = process.env.VERCEL_TOKEN;
    const teamId = process.env.VERCEL_TEAM_ID;

    if (!vercelToken) {
      return NextResponse.json({
        deployments: [],
        projects: [],
        error: "Vercel integration not configured",
      });
    }

    const headers: HeadersInit = {
      Authorization: `Bearer ${vercelToken}`,
    };

    // Build URL with optional team ID
    let deploymentsUrl = `${VERCEL_API_URL}/v6/deployments?limit=20`;
    let projectsUrl = `${VERCEL_API_URL}/v9/projects?limit=20`;

    if (teamId) {
      deploymentsUrl += `&teamId=${teamId}`;
      projectsUrl += `&teamId=${teamId}`;
    }

    // Fetch deployments and projects in parallel
    const [deploymentsRes, projectsRes] = await Promise.all([
      fetch(deploymentsUrl, { headers }),
      fetch(projectsUrl, { headers }),
    ]);

    let deployments: any[] = [];
    let projects: any[] = [];

    if (deploymentsRes.ok) {
      const data = await deploymentsRes.json();
      deployments = (data.deployments || []).map((d: any) => ({
        id: d.uid,
        name: d.name,
        url: d.url,
        inspectorUrl: d.inspectorUrl,
        state: d.state,
        target: d.target,
        createdAt: d.createdAt,
        buildingAt: d.buildingAt,
        ready: d.ready,
        source: d.source,
        meta: {
          branch: d.meta?.githubCommitRef,
          commit: d.meta?.githubCommitSha?.substring(0, 7),
          message: d.meta?.githubCommitMessage,
          author: d.meta?.githubCommitAuthorName,
          repo: d.meta?.githubRepo,
        },
      }));
    }

    if (projectsRes.ok) {
      const data = await projectsRes.json();
      projects = (data.projects || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        framework: p.framework,
        latestDeployment: p.latestDeployments?.[0] || null,
        link: p.link,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      }));
    }

    return NextResponse.json({
      deployments,
      projects,
    });
  } catch (error) {
    console.error("[GET /api/integrations/vercel/deployments]", error);
    return NextResponse.json(
      { error: "Failed to fetch Vercel data" },
      { status: 500 }
    );
  }
}
