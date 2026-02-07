/**
 * CEO Runs API
 * Returns execution runs with related todo/request/node data.
 * Supports filtering by nodeId and status.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authz";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const nodeId = searchParams.get("nodeId");
    const status = searchParams.get("status");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const cursor = searchParams.get("cursor");

    // Build where clause
    const where: Record<string, unknown> = {};
    if (nodeId) where.nodeId = nodeId;
    if (status) where.status = status;

    const runs = await prisma.executionRun.findMany({
      where,
      include: {
        request: {
          include: {
            todo: {
              select: {
                id: true,
                title: true,
                description: true,
                status: true,
                priority: true,
                projectId: true,
              },
            },
          },
        },
        node: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        _count: {
          select: { logs: true },
        },
      },
      orderBy: { startedAt: "desc" },
      take: limit,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    return NextResponse.json({
      runs: runs.map((run) => ({
        id: run.id,
        status: run.status,
        branchName: run.branchName,
        prUrl: run.prUrl,
        previewUrl: run.previewUrl,
        errorMessage: run.errorMessage,
        summary: run.summary,
        questions: run.questions,
        answers: run.answers,
        startedAt: run.startedAt,
        completedAt: run.completedAt,
        logCount: run._count.logs,
        node: run.node,
        request: {
          id: run.request.id,
          repoUrl: run.request.repoUrl,
          branchName: run.request.branchName,
          priority: run.request.priority,
          status: run.request.status,
          todo: run.request.todo,
        },
      })),
      count: runs.length,
      hasMore: runs.length === limit,
      nextCursor: runs.length === limit ? runs[runs.length - 1].id : null,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.includes("Forbidden") || message.includes("Unauthorized") ? 403 : 500;
    console.error("[API /ceo/runs] Error:", error);
    return NextResponse.json({ error: message }, { status });
  }
}
