/**
 * API: Get logs for a specific run
 * GET /api/runs/[runId]/logs
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authz";

export async function GET(
  req: NextRequest,
  { params }: { params: { runId: string } }
) {
  try {
    await requireAdmin();

    const logs = await prisma.runLog.findMany({
      where: { runId: params.runId },
      orderBy: { timestamp: "asc" },
    });

    return NextResponse.json({ logs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * API: Add log to a run (for workers)
 * POST /api/runs/[runId]/logs
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { runId: string } }
) {
  try {
    const { level, message } = await req.json();

    // Could add node auth here, but for now allow it
    const log = await prisma.runLog.create({
      data: {
        runId: params.runId,
        level: level || "info",
        message,
        truncated: message.length > 10000,
      },
    });

    return NextResponse.json({ success: true, log });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
