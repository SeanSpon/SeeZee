/**
 * API: Complete a run
 * POST /api/runs/[runId]/complete
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { runId: string } }
) {
  try {
    const { status, prUrl, errorMessage, summary } = await req.json();

    const run = await prisma.executionRun.update({
      where: { id: params.runId },
      data: {
        status: status === "SUCCESS" ? "SUCCESS" : "FAILED",
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
