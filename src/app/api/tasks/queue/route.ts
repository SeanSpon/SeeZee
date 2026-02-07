/**
 * Task Queue API
 * Bulk-queue todos as ExecutionRequests for AI nodes.
 * Creates collision-proof branch names: seezee/req-{requestId}
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authz";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const body = await req.json();
    const { todoIds, nodeId, repoUrl, priority = "MEDIUM" } = body;

    // Validate inputs
    if (!todoIds || !Array.isArray(todoIds) || todoIds.length === 0) {
      return NextResponse.json(
        { error: "todoIds array is required" },
        { status: 400 }
      );
    }

    if (!repoUrl || typeof repoUrl !== "string") {
      return NextResponse.json(
        { error: "repoUrl is required" },
        { status: 400 }
      );
    }

    if (!["LOW", "MEDIUM", "HIGH", "URGENT"].includes(priority)) {
      return NextResponse.json(
        { error: "priority must be LOW, MEDIUM, HIGH, or URGENT" },
        { status: 400 }
      );
    }

    // Verify node exists if specified
    if (nodeId) {
      const node = await prisma.workflowNode.findUnique({
        where: { id: nodeId },
      });
      if (!node) {
        return NextResponse.json(
          { error: "Specified node not found" },
          { status: 404 }
        );
      }
    }

    // Verify all todos exist
    const todos = await prisma.todo.findMany({
      where: { id: { in: todoIds } },
      select: { id: true, title: true },
    });

    if (todos.length !== todoIds.length) {
      const foundIds = todos.map((t) => t.id);
      const missing = todoIds.filter((id: string) => !foundIds.includes(id));
      return NextResponse.json(
        { error: `Todos not found: ${missing.join(", ")}` },
        { status: 404 }
      );
    }

    // Create ExecutionRequests in bulk
    const requests = await Promise.all(
      todoIds.map(async (todoId: string) => {
        const request = await prisma.executionRequest.create({
          data: {
            todoId,
            repoUrl,
            branchName: "placeholder", // Will be updated with real ID
            priority: priority as "LOW" | "MEDIUM" | "HIGH" | "URGENT",
            status: "QUEUED",
            targetNodeId: nodeId || null,
          },
        });

        // Update branch name with real request ID (collision-proof)
        const updated = await prisma.executionRequest.update({
          where: { id: request.id },
          data: {
            branchName: `seezee/req-${request.id}`,
          },
          include: {
            todo: {
              select: { id: true, title: true },
            },
          },
        });

        return updated;
      })
    );

    return NextResponse.json({
      success: true,
      queued: requests.length,
      requests: requests.map((r) => ({
        id: r.id,
        todoId: r.todoId,
        todoTitle: r.todo.title,
        branchName: r.branchName,
        priority: r.priority,
        status: r.status,
      })),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.includes("Forbidden") || message.includes("Unauthorized") ? 403 : 500;
    console.error("[API /tasks/queue] Error:", error);
    return NextResponse.json({ error: message }, { status });
  }
}
