import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminOrCEO } from "@/server/http";
import { createResourceSchema } from "@/lib/validation/resources-tools-tasks";

/**
 * GET /api/ceo/resources
 * List all resources with optional filters (Admin & CEO can read)
 */
export const GET = withAdminOrCEO(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    const tag = searchParams.get("tag");
    const visibility = searchParams.get("visibility");
    const cursor = searchParams.get("cursor");
    const take = 24;

    const where: any = {};
    
    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }
    
    if (tag) {
      where.tags = { has: tag };
    }
    
    if (visibility) {
      where.visibility = visibility;
    }

    const resources = await prisma.resource.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: take + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    let nextCursor: string | null = null;
    if (resources.length > take) {
      const next = resources.pop();
      nextCursor = next?.id ?? null;
    }

    return NextResponse.json({ items: resources, nextCursor });
  } catch (error) {
    console.error("[GET /api/ceo/resources]", error);
    return NextResponse.json(
      { error: "Failed to fetch resources" },
      { status: 500 }
    );
  }
});

/**
 * POST /api/ceo/resources
 * Create a new resource (CEO only)
 */
export const POST = withAdminOrCEO(async (req: NextRequest) => {
  try {
    const session = await req.headers.get("x-session");
    const body = await req.json();
    
    // Normalize tags
    if (Array.isArray(body.tags)) {
      body.tags = Array.from(
        new Set(
          body.tags
            .map((t: string) => t.trim().toLowerCase())
            .filter(Boolean)
        )
      );
    }

    const parsed = createResourceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    // Get session for createdById
    const { auth } = await import("@/auth");
    const authSession = await auth();
    
    const resource = await prisma.resource.create({
      data: {
        ...parsed.data,
        description: parsed.data.description || "",
        createdById: authSession!.user.id,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({ resource }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/ceo/resources]", error);
    return NextResponse.json(
      { error: "Failed to create resource" },
      { status: 500 }
    );
  }
});
