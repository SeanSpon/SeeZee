import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const ADMIN_ROLES = ["CEO", "CFO", "ADMIN", "DEV", "FRONTEND", "BACKEND"];
const VERCEL_API_URL = "https://api.vercel.com";

/**
 * GET /api/integrations/vercel/deployments
 * Fetch recent Vercel deployments from database (populated by webhooks)
 * Falls back to API if no webhook data available
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

    // First, try to get deployments from database (webhook data)
    const dbDeployments = await prisma.vercelDeployment.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    // If we have webhook data, use it
    if (dbDeployments.length > 0) {
      const deployments = dbDeployments.map((d) => ({
        id: d.deploymentId,
        name: d.name,
        url: d.url,
        inspectorUrl: d.inspectorUrl || "",
        state: d.state,
        target: d.target || "preview",
        createdAt: d.createdAt.getTime(),
        buildingAt: d.buildingAt?.getTime() || 0,
        ready: d.readyAt?.getTime() || 0,
        source: "webhook",
        meta: {
          branch: d.branch || "",
          commit: d.commitSha?.substring(0, 7) || "",
          message: d.commitMessage || "",
          author: d.commitAuthor || "",
          repo: d.repo || "",
        },
      }));

      return NextResponse.json({
        deployments,
        projects: [],
        source: "webhook",
        webhookConfigured: true,
      });
    }

    // Fallback to Vercel API if no webhook data
    const vercelToken = process.env.VERCEL_TOKEN;
    const teamId = process.env.VERCEL_TEAM_ID;

    if (!vercelToken) {
      return NextResponse.json({
        deployments: [],
        projects: [],
        error: "Vercel integration not configured",
        source: "none",
        webhookConfigured: false,
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
        source: "api",
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
      source: "api",
      webhookConfigured: false,
    });
  } catch (error) {
    console.error("[GET /api/integrations/vercel/deployments]", error);
    return NextResponse.json(
      { error: "Failed to fetch Vercel data" },
      { status: 500 }
    );
  }
}
