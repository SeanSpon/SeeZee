/**
 * GET /api/client/projects/[id]/requests
 * POST /api/client/projects/[id]/requests
 * CRUD for client project change requests
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getClientProjectOrThrow } from "@/lib/client-access";
import { ClientAccessError } from "@/lib/client-access-types";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: projectId } = await params;

    try {
      await getClientProjectOrThrow(
        { userId: session.user.id, email: session.user.email },
        projectId,
        { select: { id: true } }
      );
    } catch (error) {
      if (error instanceof ClientAccessError) {
        return NextResponse.json(
          { error: "Project not found or access denied" },
          { status: 404 }
        );
      }
      throw error;
    }

    // Fetch all requests for this project
    const requests = await prisma.request.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error("Error fetching requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch requests" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: projectId } = await params;

    try {
      await getClientProjectOrThrow(
        { userId: session.user.id, email: session.user.email },
        projectId,
        { select: { id: true } }
      );
    } catch (error) {
      if (error instanceof ClientAccessError) {
        return NextResponse.json(
          { error: "Project not found or access denied" },
          { status: 404 }
        );
      }
      throw error;
    }

    // Parse request body
    const body = await req.json();
    const { title, details, source } = body;

    if (!title || !details) {
      return NextResponse.json(
        { error: "Title and details are required" },
        { status: 400 }
      );
    }

    // Create new request
    const newRequest = await prisma.request.create({
      data: {
        projectId,
        title,
        details,
        source: source === "AI" ? "AI" : "MANUAL",
        state: "new",
      } as any,
    });

    // Create feed event
    await prisma.feedEvent.create({
      data: {
        type: "REQUEST_CREATED",
        projectId,
        payload: {
          requestId: newRequest.id,
          title,
          details,
          source,
        },
      },
    });

    return NextResponse.json({ request: newRequest }, { status: 201 });
  } catch (error) {
    console.error("Error creating request:", error);
    return NextResponse.json(
      { error: "Failed to create request" },
      { status: 500 }
    );
  }
}
