import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/learning/overview
 * Admin read-only overview of learning completion stats
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    // Allow CEO and ADMIN to view
    if (!session?.user || !["CEO", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all completions
    const completions = await prisma.completion.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        assignment: {
          include: {
            training: {
              select: {
                id: true,
                title: true,
                type: true,
              },
            },
          },
        },
      },
    });

    // Calculate totals
    const totalAssigned = completions.length;
    const notStarted = completions.filter((c) => c.status === "NOT_STARTED").length;
    const inProgress = completions.filter((c) => c.status === "IN_PROGRESS").length;
    const completed = completions.filter((c) => c.status === "COMPLETE").length;

    // Calculate overdue (assignments with dueAt < now and status !== COMPLETE)
    const now = new Date();
    const overdue = completions.filter(
      (c) =>
        c.assignment.dueAt &&
        c.assignment.dueAt < now &&
        c.status !== "COMPLETE"
    );

    // Per-role completion rates
    const roleStats = completions.reduce((acc, completion) => {
      const role = completion.user.role;
      if (!acc[role]) {
        acc[role] = { total: 0, completed: 0 };
      }
      acc[role].total++;
      if (completion.status === "COMPLETE") {
        acc[role].completed++;
      }
      return acc;
    }, {} as Record<string, { total: number; completed: number }>);

    const roleCompletionRates = Object.entries(roleStats).map(([role, stats]) => ({
      role,
      total: stats.total,
      completed: stats.completed,
      completionRate: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0,
    }));

    // Team leaderboard (top users by completion count)
    const userCompletionCounts = completions.reduce((acc, completion) => {
      const userId = completion.user.id;
      if (!acc[userId]) {
        acc[userId] = {
          user: completion.user,
          completed: 0,
          total: 0,
        };
      }
      acc[userId].total++;
      if (completion.status === "COMPLETE") {
        acc[userId].completed++;
      }
      return acc;
    }, {} as Record<string, { user: any; completed: number; total: number }>);

    const leaderboard = Object.values(userCompletionCounts)
      .map((entry) => ({
        user: entry.user,
        completed: entry.completed,
        total: entry.total,
        completionRate:
          entry.total > 0 ? Math.round((entry.completed / entry.total) * 100) : 0,
      }))
      .sort((a, b) => b.completed - a.completed)
      .slice(0, 10); // Top 10

    // Overdue list (most urgent first)
    const overdueList = overdue
      .map((c) => ({
        id: c.id,
        user: c.user,
        training: c.assignment.training,
        dueAt: c.assignment.dueAt,
        status: c.status,
        daysOverdue: Math.floor(
          (now.getTime() - (c.assignment.dueAt?.getTime() || 0)) / (1000 * 60 * 60 * 24)
        ),
      }))
      .sort((a, b) => b.daysOverdue - a.daysOverdue)
      .slice(0, 20); // Top 20 most overdue

    return NextResponse.json({
      totals: {
        totalAssigned,
        notStarted,
        inProgress,
        completed,
        completionRate: totalAssigned > 0 ? Math.round((completed / totalAssigned) * 100) : 0,
      },
      overdue: {
        count: overdue.length,
        list: overdueList,
      },
      roleCompletionRates,
      leaderboard,
    });
  } catch (error) {
    console.error("[GET /api/admin/learning/overview]", error);
    return NextResponse.json(
      { error: "Failed to fetch learning overview" },
      { status: 500 }
    );
  }
}
