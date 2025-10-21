import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AudienceType, UserRole } from "@prisma/client";

/**
 * GET /api/ceo/assignments
 * Get assignments, optionally filtered by training ID
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "CEO") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const trainingId = searchParams.get("trainingId");

    const assignments = await prisma.assignment.findMany({
      where: trainingId ? { trainingId } : undefined,
      include: {
        training: {
          select: {
            id: true,
            title: true,
            type: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        completions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(assignments);
  } catch (error) {
    console.error("[GET /api/ceo/assignments]", error);
    return NextResponse.json(
      { error: "Failed to fetch assignments" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ceo/assignments
 * Bulk assign training to users, teams, or roles
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "CEO") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { trainingId, audienceType, userIds, teamId, role, dueAt } = body;

    if (!trainingId || !audienceType) {
      return NextResponse.json(
        { error: "Training ID and audience type are required" },
        { status: 400 }
      );
    }

    // Validate based on audience type
    if (audienceType === "USER" && (!userIds || userIds.length === 0)) {
      return NextResponse.json(
        { error: "User IDs are required for USER audience type" },
        { status: 400 }
      );
    }
    if (audienceType === "TEAM" && !teamId) {
      return NextResponse.json(
        { error: "Team ID is required for TEAM audience type" },
        { status: 400 }
      );
    }
    if (audienceType === "ROLE" && !role) {
      return NextResponse.json(
        { error: "Role is required for ROLE audience type" },
        { status: 400 }
      );
    }

    // Expand audience to individual users
    let targetUserIds: string[] = [];

    if (audienceType === "USER") {
      targetUserIds = userIds;
    } else if (audienceType === "ROLE") {
      // Find all users with the specified role
      const users = await prisma.user.findMany({
        where: { role: role as UserRole },
        select: { id: true },
      });
      targetUserIds = users.map((u) => u.id);
    } else if (audienceType === "TEAM") {
      // Find all users in the team (organization members)
      const members = await prisma.organizationMember.findMany({
        where: { organizationId: teamId },
        select: { userId: true },
      });
      targetUserIds = members.map((m) => m.userId);
    }

    if (targetUserIds.length === 0) {
      return NextResponse.json(
        { error: "No users found for the specified audience" },
        { status: 400 }
      );
    }

    // Create assignment records and completion records
    const createdAssignments = [];
    for (const userId of targetUserIds) {
      // Check if assignment already exists
      const existing = await prisma.assignment.findFirst({
        where: {
          trainingId,
          userId,
        },
      });

      if (existing) {
        // Skip if already assigned
        continue;
      }

      // Create assignment
      const assignment = await prisma.assignment.create({
        data: {
          trainingId,
          audienceType,
          userId,
          ...(teamId && { teamId }),
          ...(role && { role: role as UserRole }),
          ...(dueAt && { dueAt: new Date(dueAt) }),
          createdById: session.user.id,
        },
      });

      // Create completion record with NOT_STARTED status
      await prisma.completion.create({
        data: {
          assignmentId: assignment.id,
          userId,
          status: "NOT_STARTED",
        },
      });

      createdAssignments.push(assignment);
    }

    return NextResponse.json({
      success: true,
      assignedCount: createdAssignments.length,
      skippedCount: targetUserIds.length - createdAssignments.length,
      assignments: createdAssignments,
    });
  } catch (error) {
    console.error("[POST /api/ceo/assignments]", error);
    return NextResponse.json(
      { error: "Failed to create assignments" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/ceo/assignments/[id]
 * Remove an assignment (cascades to completions)
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "CEO") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Assignment ID is required" },
        { status: 400 }
      );
    }

    await prisma.assignment.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/ceo/assignments]", error);
    return NextResponse.json(
      { error: "Failed to delete assignment" },
      { status: 500 }
    );
  }
}
