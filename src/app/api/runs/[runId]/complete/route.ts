/**
 * API: Complete a run
 * POST /api/runs/[runId]/complete
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  try {
    const { runId } = await params;
    const { status, prUrl, errorMessage, summary } = await req.json();

    const run = await prisma.executionRun.update({
      where: { id: runId },
      data: {
        status: status === "SUCCESS" || status === "DONE" ? "DONE" : "FAILED",
        prUrl,
        errorMessage,
        summary,
        completedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, run });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
