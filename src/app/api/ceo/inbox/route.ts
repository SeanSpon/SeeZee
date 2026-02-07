/**
 * CEO PR Inbox API
 * Returns execution runs that need review:
 * - DONE runs (PRs ready for review)
 * - FAILED runs (need retry decision)
 * - NEEDS_ANSWER runs (questions pending)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authz";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const filter = searchParams.get("filter"); // "all", "done", "failed", "needs_answer"

    // Build status filter
    let statusFilter: string[];
    switch (filter) {
      case "done":
        statusFilter = ["DONE"];
        break;
      case "failed":
        statusFilter = ["FAILED"];
        break;
      case "needs_answer":
        statusFilter = ["NEEDS_ANSWER"];
        break;
      default:
        statusFilter = ["DONE", "FAILED", "NEEDS_ANSWER"];
    }

    const runs = await prisma.executionRun.findMany({
      where: {
        status: { in: statusFilter as ("DONE" | "FAILED" | "NEEDS_ANSWER")[] },
      },
      include: {
        request: {
          include: {
            todo: {
              select: {
                id: true,
                title: true,
                description: true,
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
      orderBy: { completedAt: "desc" },
      take: limit,
    });

    // Separate into categories for UI
    const inbox = runs.map((run) => ({
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
      todo: run.request.todo,
      request: {
        id: run.request.id,
        repoUrl: run.request.repoUrl,
        priority: run.request.priority,
        todoId: run.request.todoId,
      },
    }));

    const counts = {
      total: inbox.length,
      done: inbox.filter((r) => r.status === "DONE").length,
      failed: inbox.filter((r) => r.status === "FAILED").length,
      needsAnswer: inbox.filter((r) => r.status === "NEEDS_ANSWER").length,
    };

    return NextResponse.json({ inbox, counts });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.includes("Forbidden") || message.includes("Unauthorized") ? 403 : 500;
    console.error("[API /ceo/inbox] Error:", error);
    return NextResponse.json({ error: message }, { status });
  }
}
