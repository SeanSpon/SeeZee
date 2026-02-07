/**
 * Run Answer API ("Ask Sean")
 * Accepts answers for a run in NEEDS_ANSWER state,
 * stores them and resumes the run.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authz";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Session auth - only CEO/Admin can answer
    await requireAdmin();
    const { id: runId } = await params;

    const body = await req.json();
    const { answers } = body;

    if (!answers || typeof answers !== "object") {
      return NextResponse.json(
        { error: "Answers object is required" },
        { status: 400 }
      );
    }

    // Find the run
    const run = await prisma.executionRun.findUnique({
      where: { id: runId },
      select: { id: true, status: true, questions: true, requestId: true },
    });

    if (!run) {
      return NextResponse.json(
        { error: "Run not found" },
        { status: 404 }
      );
    }

    if (run.status !== "NEEDS_ANSWER") {
      return NextResponse.json(
        { error: `Run is not awaiting answers (status: ${run.status})` },
        { status: 400 }
      );
    }

    // Store answers and resume
    const updatedRun = await prisma.executionRun.update({
      where: { id: runId },
      data: {
        answers,
        status: "RUNNING",
      },
    });

    // Also log the answer event
    await prisma.runLog.create({
      data: {
        runId,
        level: "info",
        message: `Answers provided by admin. Resuming execution.`,
      },
    });

    return NextResponse.json({
      success: true,
      run: {
        id: updatedRun.id,
        status: updatedRun.status,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.includes("Forbidden") || message.includes("Unauthorized") ? 403 : 500;
    console.error("[API /runs/:id/answer] Error:", error);
    return NextResponse.json({ error: message }, { status });
  }
}

/**
 * GET: Fetch current questions for a run
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id: runId } = await params;

    const run = await prisma.executionRun.findUnique({
      where: { id: runId },
      select: {
        id: true,
        status: true,
        questions: true,
        answers: true,
      },
    });

    if (!run) {
      return NextResponse.json(
        { error: "Run not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ run });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("[API /runs/:id/answer GET] Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
