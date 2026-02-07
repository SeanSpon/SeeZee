/**
 * API: Get AI runs for control center
 * GET /api/admin/ai-runs
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const runs = await prisma.executionRun.findMany({
      take: 50,
      orderBy: { startedAt: "desc" },
      include: {
        node: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        request: {
          include: {
            todo: {
              select: {
                id: true,
                title: true,
                description: true,
              },
            },
          },
        },
        logs: {
          take: 5,
          orderBy: { timestamp: "desc" },
        },
      },
    });

    const stats = {
      total: runs.length,
      running: runs.filter((r) => r.status === "RUNNING").length,
      success: runs.filter((r) => r.status === "DONE").length,
      failed: runs.filter((r) => r.status === "FAILED").length,
    };

    return NextResponse.json({ runs, stats });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
