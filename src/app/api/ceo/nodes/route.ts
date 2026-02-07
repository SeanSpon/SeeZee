/**
 * CEO Nodes API
 * Returns all WorkflowNodes with computed online/busy status
 * and recent run counts for the admin dashboard.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authz";

// Node is "online" if heartbeat within last 60 seconds
const HEARTBEAT_THRESHOLD_MS = 60_000;

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const nodes = await prisma.workflowNode.findMany({
      include: {
        _count: {
          select: {
            executionRuns: true,
          },
        },
        executionRuns: {
          take: 5,
          orderBy: { startedAt: "desc" },
          select: {
            id: true,
            status: true,
            prUrl: true,
            previewUrl: true,
            branchName: true,
            startedAt: true,
            completedAt: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const now = Date.now();

    const enrichedNodes = nodes.map((node) => {
      // Compute real-time status from heartbeat
      const heartbeatAge = node.lastHeartbeatAt
        ? now - new Date(node.lastHeartbeatAt).getTime()
        : Infinity;

      let computedStatus: string;
      if (heartbeatAge > HEARTBEAT_THRESHOLD_MS) {
        computedStatus = "OFFLINE";
      } else if (node.currentJobId) {
        computedStatus = "BUSY";
      } else {
        computedStatus = "ONLINE";
      }

      return {
        id: node.id,
        name: node.name,
        type: node.type,
        status: computedStatus,
        dbStatus: node.status,
        capabilities: node.capabilities,
        metadata: node.metadata,
        lastHeartbeatAt: node.lastHeartbeatAt,
        currentJobId: node.currentJobId,
        totalRuns: node._count.executionRuns,
        recentRuns: node.executionRuns,
        createdAt: node.createdAt,
        updatedAt: node.updatedAt,
      };
    });

    return NextResponse.json({
      nodes: enrichedNodes,
      count: enrichedNodes.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.includes("Forbidden") || message.includes("Unauthorized") ? 403 : 500;
    console.error("[API /ceo/nodes] Error:", error);
    return NextResponse.json({ error: message }, { status });
  }
}
