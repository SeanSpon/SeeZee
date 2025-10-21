import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TrainingType, Visibility } from "@prisma/client";

/**
 * GET /api/ceo/training  
 * List trainings with stats - returns array format for backward compatibility
 */
export async function GET(req: NextRequest) {
  try {
    // Auth check
    const session = await auth();
    if (!session?.user || !["CEO", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    const type = searchParams.get("type") as TrainingType | null;
    const visibility = searchParams.get("visibility") as Visibility | null;
    const tag = searchParams.get("tag");

    // Build where clause
    const where: any = {};
    if (type) where.type = type;
    if (visibility) where.visibility = visibility;
    if (tag) where.tags = { hasSome: [tag.toLowerCase()] };
    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }

    // Fetch trainings with assignments and completions
    const trainings = await prisma.training.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        assignments: {
          include: {
            completions: {
              select: {
                status: true,
              },
            },
          },
        },
      },
    });

    // Calculate stats for each training
    const trainingsWithStats = trainings.map((training) => {
      const totalAssigned = training.assignments.reduce(
        (acc, assignment) => acc + assignment.completions.length,
        0
      );
      const completed = training.assignments.reduce(
        (acc, assignment) =>
          acc +
          assignment.completions.filter((c) => c.status === "COMPLETE").length,
        0
      );
      const inProgress = training.assignments.reduce(
        (acc, assignment) =>
          acc +
          assignment.completions.filter((c) => c.status === "IN_PROGRESS")
            .length,
        0
      );

      // Remove assignments from response to keep it clean
      const { assignments, ...trainingData } = training;

      return {
        ...trainingData,
        stats: {
          totalAssigned,
          completed,
          inProgress,
          notStarted: totalAssigned - completed - inProgress,
        },
      };
    });

    return NextResponse.json(trainingsWithStats);
  } catch (error) {
    console.error("[GET /api/ceo/training]", error);
    return NextResponse.json(
      { error: "Failed to fetch trainings" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ceo/training
 * Create a new training
 */
export async function POST(req: NextRequest) {
  try {
    // Auth check - CEO only
    const session = await auth();
    if (!session?.user || session.user.role !== "CEO") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { title, type, description, visibility, url, fileKey, tags } = body;

    // Basic validation
    if (!title || !type) {
      return NextResponse.json(
        { error: "Title and type are required" },
        { status: 400 }
      );
    }

    // Normalize tags
    const normalizedTags = Array.isArray(tags)
      ? [...new Set(tags.map((t: string) => t.toLowerCase().trim()).filter((t: string) => t.length > 0))]
      : [];

    const training = await prisma.training.create({
      data: {
        title,
        type,
        description: description || "",
        visibility: visibility || "INTERNAL",
        url: url || null,
        fileKey: fileKey || null,
        tags: normalizedTags,
        createdById: session.user.id,
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

    return NextResponse.json(training, { status: 201 });
  } catch (error) {
    console.error("[POST /api/ceo/training]", error);
    return NextResponse.json(
      { error: "Failed to create training" },
      { status: 500 }
    );
  }
}
