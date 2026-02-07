/**
 * POST /api/dispatch/route
 * Quick dispatch: Create task + ExecutionRequest in one shot
 * This is the "Create Route" button action
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authz";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();

    const body = await req.json();
    const { task, repoUrl, nodeId, priority = "MEDIUM" } = body;

    // Validate
    if (!task || typeof task !== "string") {
      return NextResponse.json(
        { error: "task description is required" },
        { status: 400 }
      );
    }

    if (!repoUrl || typeof repoUrl !== "string") {
      return NextResponse.json(
        { error: "repoUrl is required" },
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
          { error: "Node not found" },
          { status: 404 }
        );
      }
    }

    // 1. Create Todo
    const todo = await prisma.todo.create({
      data: {
        title: task,
        description: `Quick dispatch task`,
        status: "TODO",
        priority: (priority === "URGENT" ? "HIGH" : priority) as "LOW" | "MEDIUM" | "HIGH",
        createdById: session.user.id, // Add createdBy from session
      },
    });

    // 2. Create ExecutionRequest
    const request = await prisma.executionRequest.create({
      data: {
        todoId: todo.id,
        repoUrl,
        branchName: "placeholder",
        priority: priority as "LOW" | "MEDIUM" | "HIGH" | "URGENT",
        status: "QUEUED",
        targetNodeId: nodeId || null,
      },
    });

    // 3. Update branch name with request ID
    const updated = await prisma.executionRequest.update({
      where: { id: request.id },
      data: {
        branchName: `seezee/req-${request.id}`,
      },
      include: {
        todo: true,
      },
    });

    return NextResponse.json({
      success: true,
      request: updated,
      message: "Route created! Worker will claim it shortly.",
    });
  } catch (error) {
    console.error("[POST /api/dispatch/route]", error);
    return NextResponse.json(
      { error: "Failed to create route" },
      { status: 500 }
    );
  }
}
