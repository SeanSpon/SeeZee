import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

const ADMIN_ROLES = ["CEO", "CFO", "ADMIN", "DEV", "FRONTEND", "BACKEND"];

/**
 * GET /api/integrations/vercel/projects
 * Fetch all Vercel projects for dropdown selection
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
        projects: [],
        error: "Vercel integration not configured",
      });
    }

    const headers = {
      Authorization: `Bearer ${vercelToken}`,
    };

    let projectsUrl = "https://api.vercel.com/v9/projects?limit=100";
    if (teamId) {
      projectsUrl += `&teamId=${teamId}`;
    }

    const projectsRes = await fetch(projectsUrl, { headers });

    if (!projectsRes.ok) {
      return NextResponse.json({
        projects: [],
        error: "Failed to fetch Vercel projects",
      });
    }

    const data = await projectsRes.json();
    
    // Format projects for dropdown
    const projects = (data.projects || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      framework: p.framework,
      link: p.link?.url || `https://${p.name}.vercel.app`,
      productionUrl: p.targets?.production?.url || null,
      gitRepo: p.link?.repo || null,
    }));

    return NextResponse.json({
      projects,
      configured: true,
    });
  } catch (error) {
    console.error("[GET /api/integrations/vercel/projects]", error);
    return NextResponse.json(
      { error: "Failed to fetch Vercel projects" },
      { status: 500 }
    );
  }
}
