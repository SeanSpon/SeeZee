import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/server/db";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has admin permissions
    const adminRoles = ["ADMIN", "CEO", "STAFF", "FRONTEND", "BACKEND", "OUTREACH", "DESIGNER", "DEV"];
    if (!adminRoles.includes(session.user.role || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    console.log("[POST /api/admin/projects] Request body:", body);
    
    const {
      name,
      organizationId,
      assigneeId,
      type,
      status,
      priority,
      budget,
      startDate,
      estimatedCompletion,
      description,
    } = body;

    // Validation
    if (!name || !organizationId) {
      return NextResponse.json(
        { error: "Project name and client are required" },
        { status: 400 }
      );
    }

    // Try to find organization first (in case organizationId is an Organization ID)
    console.log("[POST /api/admin/projects] Looking for organization:", organizationId);
    let org = await db.organization.findUnique({
      where: { id: organizationId },
    });
    console.log("[POST /api/admin/projects] Organization found:", org?.name);

    // If not found, assume organizationId is a User ID and find or create organization for that user
    if (!org) {
      console.log("[POST /api/admin/projects] Org not found, looking for user:", organizationId);
      const user = await db.user.findUnique({
        where: { id: organizationId },
      });
      console.log("[POST /api/admin/projects] User found:", user?.name);

      if (!user) {
        return NextResponse.json({ error: "Client not found" }, { status: 404 });
      }

      // Find or create organization for this user
      org = await db.organization.findFirst({
        where: {
          email: user.email,
        },
      });

      if (!org) {
        // Create a new organization for this user
        console.log("[POST /api/admin/projects] Creating new organization for user:", user.name);
        org = await db.organization.create({
          data: {
            name: user.company || user.name || user.email || "Client Organization",
            email: user.email,
            slug: `${(user.name || user.email || "org").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
          },
        });
        console.log("[POST /api/admin/projects] New organization created:", org.id);
      }
    }

    // Create project
    console.log("[POST /api/admin/projects] Creating project:", { name, organizationId: org.id, assigneeId });
    const project = await db.project.create({
      data: {
        name,
        organizationId: org.id,
        assigneeId: assigneeId || null,
        status: status ?? "LEAD",
        description,
        budget: budget ? parseFloat(budget) : null,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: estimatedCompletion ? new Date(estimatedCompletion) : null,
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
    console.log("[POST /api/admin/projects] Project created:", project.id);

    // Log activity
    try {
      await db.activity.create({
        data: {
          type: "PROJECT_CREATED",
          title: `Project created: ${name}`,
          description: `Created project "${name}" for ${org.name}`,
          userId: session.user.id,
          metadata: {
            projectId: project.id,
            projectName: name,
            organizationId: org.id,
            organizationName: org.name,
          },
        },
      });
    } catch (err) {
      // Log activity is not critical, so don't fail if it errors
      console.error("Failed to log activity:", err);
    }

    revalidatePath("/admin/projects");

    return NextResponse.json(
      {
        success: true,
        project,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/admin/projects]", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to create project";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has admin role
    const adminRoles = ["ADMIN", "CEO", "STAFF", "FRONTEND", "BACKEND", "OUTREACH", "DESIGNER", "DEV"];
    if (!adminRoles.includes(session.user.role || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get query params
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const limit = searchParams.get("limit");

    // Build where clause
    const where: any = {};
    if (status) {
      where.status = status;
    }

    // Fetch projects
    const projects = await db.project.findMany({
      where,
      ...(limit && { take: parseInt(limit, 10) }),
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        lead: {
          select: {
            id: true,
            name: true,
            email: true,
            status: true,
          },
        },
        _count: {
          select: {
            files: true,
            invoices: true,
            requests: true,
            milestones: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      projects: projects.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        status: p.status,
        budget: p.budget ? Number(p.budget) : null,
        startDate: p.startDate,
        endDate: p.endDate,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        organization: p.organization,
        assignee: p.assignee,
        lead: p.lead,
        counts: {
          files: p._count.files,
          invoices: p._count.invoices,
          requests: p._count.requests,
          milestones: p._count.milestones,
        },
      })),
    });
  } catch (error) {
    console.error("[GET /api/admin/projects]", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

