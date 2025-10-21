import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { clientRequestCreate } from "@/lib/validation/client";

/**
 * GET /api/client/requests
 * Returns client-submitted requests
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = session.user.email!;

    // Find organization
    const lead = await prisma.lead.findFirst({
      where: { email: userEmail },
      select: { organizationId: true },
    });

    if (!lead?.organizationId) {
      return NextResponse.json({ items: [] });
    }

    // Fetch todos created by this client org
    const requests = await prisma.todo.findMany({
      where: {
        createdBy: {
          email: userEmail,
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      items: requests.map((r) => ({
        id: r.id,
        type: r.priority, // Use priority as type proxy
        title: r.title,
        description: r.description,
        status: r.status,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      })),
    });
  } catch (error: any) {
    console.error("[GET /api/client/requests]", error);
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
  }
}

/**
 * POST /api/client/requests
 * Create a new request (maps to Todo)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = clientRequestCreate.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error }, { status: 400 });
    }

    const { type, title, description, projectId } = parsed.data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Map type to priority
    const priorityMap: Record<string, "LOW" | "MEDIUM" | "HIGH"> = {
      SUPPORT: "MEDIUM",
      FEATURE: "HIGH",
      CHANGE: "MEDIUM",
    };

    const todo = await prisma.todo.create({
      data: {
        title,
        description,
        status: "TODO",
        priority: priorityMap[type] || "MEDIUM",
        createdById: user.id,
      },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        createdAt: true,
      },
    });

    // Log activity
    await prisma.systemLog.create({
      data: {
        action: "CLIENT_REQUEST_CREATED",
        entityType: "Todo",
        entityId: todo.id,
        userId: user.id,
        metadata: { type, title },
      },
    });

    return NextResponse.json({
      item: {
        id: todo.id,
        type: todo.priority,
        title: todo.title,
        description: todo.description,
        status: todo.status,
        createdAt: todo.createdAt,
      },
    });
  } catch (error: any) {
    console.error("[POST /api/client/requests]", error);
    return NextResponse.json({ error: "Failed to create request" }, { status: 500 });
  }
}
