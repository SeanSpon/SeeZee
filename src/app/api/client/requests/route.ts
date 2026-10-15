import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { clientRequestCreate } from "@/lib/validation/client";
import { getClientProjectOrThrow } from "@/lib/client-access";
import { ClientAccessError } from "@/lib/client-access-types";
import { handleCors, addCorsHeaders } from "@/lib/cors";
export async function OPTIONS(req: NextRequest) {
  return handleCors(req) || new NextResponse(null, { status: 200 });
}
export async function GET(req: NextRequest) {
  const respond = (data: unknown, status = 200) =>
    addCorsHeaders(
      NextResponse.json(data, { status }),
      req.headers.get("origin"),
    );
  try {
    const session = await auth();
    if (!session?.user?.id) return respond({ error: "Unauthorized" }, 401);
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, emailVerified: true },
    });
    const requests = await prisma.projectRequest.findMany({
      where: {
        OR: [
          { userId: session.user.id },
          // Only verified owners can see anonymous/legacy submissions. Never cross another user's ownership.
          ...(user?.emailVerified
            ? [
                {
                  userId: null,
                  OR: [
                    {
                      contactEmail: {
                        equals: user.email,
                        mode: "insensitive" as const,
                      },
                    },
                    {
                      email: {
                        equals: user.email,
                        mode: "insensitive" as const,
                      },
                    },
                  ],
                },
              ]
            : []),
        ],
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        contactEmail: true,
        email: true,
        company: true,
        budget: true,
        timeline: true,
        services: true,
        createdAt: true,
        updatedAt: true,
        project: {
          select: { id: true, name: true, status: true, createdAt: true },
        },
        lead: {
          select: {
            project: {
              select: { id: true, name: true, status: true, createdAt: true },
            },
          },
        },
      },
    });
    return respond({
      requests: requests.map(({ lead, ...request }) => ({
        ...request,
        project: request.project || lead?.project || null,
      })),
    });
  } catch {
    return respond({ error: "Failed to fetch requests" }, 500);
  }
}
export async function POST(req: NextRequest) {
  const respond = (data: unknown, status = 200) =>
    addCorsHeaders(
      NextResponse.json(data, { status }),
      req.headers.get("origin"),
    );
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.email)
      return respond({ error: "Unauthorized" }, 401);
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return respond({ error: "Invalid JSON" }, 400);
    }
    const parsed = clientRequestCreate.safeParse(body);
    if (!parsed.success)
      return respond(
        { error: "Invalid input", details: parsed.error.flatten() },
        400,
      );
    const { title, description, type, projectId } = parsed.data;
    if (projectId)
      await getClientProjectOrThrow(
        { userId: session.user.id, email: session.user.email },
        projectId,
        { select: { id: true } },
      );
    // Read and write the same model. Internal Todo assignments have their own workflow.
    const item = await prisma.$transaction(async (tx) => {
      const request = await tx.projectRequest.create({
        data: {
          userId: session.user.id,
          name: session.user.name || null,
          contactEmail: session.user.email!,
          title,
          description,
          projectType: type,
          projectId: projectId || null,
          status: "SUBMITTED",
          services: [],
        },
      });
      await tx.systemLog.create({
        data: {
          action: "CLIENT_REQUEST_CREATED",
          entityType: "ProjectRequest",
          entityId: request.id,
          userId: session.user.id,
          metadata: { type, projectId: projectId || null },
        },
      });
      return request;
    });
    return respond({ item: { ...item, type } }, 201);
  } catch (error) {
    if (error instanceof ClientAccessError)
      return respond({ error: "Project not found or access denied" }, 404);
    return respond({ error: "Failed to create request" }, 500);
  }
}
