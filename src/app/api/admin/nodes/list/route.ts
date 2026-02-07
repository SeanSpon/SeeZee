/**
 * Admin API: List Workflow Nodes
 * GET /api/admin/nodes/list
 * 
 * Returns all workflow nodes with status and capabilities
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const nodes = await prisma.workflowNode.findMany({
      select: {
        id: true,
        name: true,
        type: true,
        status: true,
        capabilities: true,
        lastHeartbeatAt: true,
        currentJobId: true,
        metadata: true,
        createdAt: true,
        updatedAt: true,
        // Never return apiKeyHash or apiKeyId for security
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate uptime/health status
    const nodesWithHealth = nodes.map((node) => {
      const lastHeartbeat = node.lastHeartbeatAt
        ? new Date(node.lastHeartbeatAt).getTime()
        : null;
      const now = Date.now();
      const isHealthy =
        lastHeartbeat && now - lastHeartbeat < 5 * 60 * 1000; // 5 min threshold

      return {
        ...node,
        health: isHealthy ? "healthy" : "stale",
        minutesSinceHeartbeat: lastHeartbeat
          ? Math.floor((now - lastHeartbeat) / 1000 / 60)
          : null,
      };
    });

    return NextResponse.json({
      nodes: nodesWithHealth,
      total: nodesWithHealth.length,
      online: nodesWithHealth.filter((n) => n.status === "ONLINE").length,
      busy: nodesWithHealth.filter((n) => n.status === "BUSY").length,
      offline: nodesWithHealth.filter((n) => n.status === "OFFLINE").length,
    });
  } catch (error: any) {
    console.error("Error listing nodes:", error);
    return NextResponse.json(
      { error: error.message || "Failed to list nodes" },
      { status: 500 }
    );
  }
}
