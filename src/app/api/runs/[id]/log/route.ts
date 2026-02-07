/**
 * Run Log Ingestion API
 * Worker streams log entries for an active execution run.
 * Enforces a max of 500 logs per run (truncation safety).
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateNode, isAuthError, authErrorResponse } from "@/lib/node-auth";

const MAX_LOGS_PER_RUN = 500;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authenticateNode(req);
    if (isAuthError(auth)) return authErrorResponse(auth);
    const { node } = auth;
    const { id: runId } = await params;

    // Validate request body
    const body = await req.json();
    const { level = "info", message } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required and must be a string" },
        { status: 400 }
      );
    }

    if (!["info", "warn", "error"].includes(level)) {
      return NextResponse.json(
        { error: "Level must be info, warn, or error" },
        { status: 400 }
      );
    }

    // Find the run and verify ownership
    const run = await prisma.executionRun.findUnique({
      where: { id: runId },
      select: { id: true, nodeId: true, status: true },
    });

    if (!run) {
      return NextResponse.json(
        { error: "Run not found" },
        { status: 404 }
      );
    }

    if (run.nodeId !== node.id) {
      return NextResponse.json(
        { error: "This run belongs to a different node" },
        { status: 403 }
      );
    }

    // Check log count for truncation
    const logCount = await prisma.runLog.count({
      where: { runId },
    });

    if (logCount >= MAX_LOGS_PER_RUN) {
      // Create a truncation marker if not already done
      const lastLog = await prisma.runLog.findFirst({
        where: { runId },
        orderBy: { timestamp: "desc" },
      });

      if (!lastLog?.truncated) {
        await prisma.runLog.create({
          data: {
            runId,
            level: "warn",
            message: `Log truncated at ${MAX_LOGS_PER_RUN} entries`,
            truncated: true,
          },
        });
      }

      return NextResponse.json({
        success: true,
        truncated: true,
        message: `Log limit reached (${MAX_LOGS_PER_RUN})`,
      });
    }

    // Create log entry
    const log = await prisma.runLog.create({
      data: {
        runId,
        level,
        message: message.slice(0, 10000), // Cap at 10KB per message
      },
    });

    return NextResponse.json({
      success: true,
      logId: log.id,
      count: logCount + 1,
    });
  } catch (error) {
    console.error("[API /runs/:id/log] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET: Retrieve logs for a run (CEO-facing, session auth)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: runId } = await params;
    const { searchParams } = new URL(req.url);
    const after = searchParams.get("after"); // cursor-based pagination
    const limit = Math.min(parseInt(searchParams.get("limit") || "100"), 200);

    const where: Record<string, unknown> = { runId };
    if (after) {
      where.timestamp = { gt: new Date(after) };
    }

    const logs = await prisma.runLog.findMany({
      where,
      orderBy: { timestamp: "asc" },
      take: limit,
    });

    return NextResponse.json({
      logs,
      count: logs.length,
      hasMore: logs.length === limit,
    });
  } catch (error) {
    console.error("[API /runs/:id/log GET] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
