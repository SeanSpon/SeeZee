import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminOrCEO } from "@/server/http";
import { createToolSchema } from "@/lib/validation/resources-tools-tasks";

/**
 * GET /api/ceo/tools
 * List all tools with optional filters (Admin & CEO can read)
 */
export const GET = withAdminOrCEO(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    const category = searchParams.get("category");
    const visibility = searchParams.get("visibility");
    const cursor = searchParams.get("cursor");
    const take = 24;

    const where: any = {};
    
    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }
    
    if (category) {
      where.category = { equals: category, mode: "insensitive" };
    }
    
    if (visibility) {
      where.visibility = visibility;
    }

    const tools = await prisma.toolEntry.findMany({
      where,
      orderBy: { name: "asc" },
      take: take + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    let nextCursor: string | null = null;
    if (tools.length > take) {
      const next = tools.pop();
      nextCursor = next?.id ?? null;
    }

    return NextResponse.json({ items: tools, nextCursor });
  } catch (error) {
    console.error("[GET /api/ceo/tools]", error);
    return NextResponse.json(
      { error: "Failed to fetch tools" },
      { status: 500 }
    );
  }
});

/**
 * POST /api/ceo/tools
 * Create a new tool entry (CEO only)
 */
export const POST = withAdminOrCEO(async (req: NextRequest) => {
  try {
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

    const parsed = createToolSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const tool = await prisma.toolEntry.create({
      data: {
        ...parsed.data,
        description: parsed.data.description || "",
        icon: parsed.data.icon || "",
      },
    });

    return NextResponse.json({ tool }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/ceo/tools]", error);
    return NextResponse.json(
      { error: "Failed to create tool" },
      { status: 500 }
    );
  }
});
