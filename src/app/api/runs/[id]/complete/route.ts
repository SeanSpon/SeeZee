/**
 * Run Completion API
 * Marks ExecutionRun as DONE or FAILED and stores results
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid authorization header" },
        { status: 401 }
      );
    }

    const apiKey = authHeader.slice(7);
    const parts = apiKey.split(".");
    if (parts.length !== 2) {
      return NextResponse.json(
        { error: "Invalid API key format" },
        { status: 401 }
      );
    }

    const [apiKeyId, secret] = parts;

    // Find node by apiKeyId
    const node = await prisma.workflowNode.findUnique({
      where: { apiKeyId },
    });

    if (!node) {
      return NextResponse.json(
        { error: "Invalid API key" },
        { status: 401 }
      );
    }

    // Verify secret
    const isValid = await bcrypt.compare(secret, node.apiKeyHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid API key" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { status, prUrl, previewUrl, errorMessage } = body;

    if (!status || !["DONE", "FAILED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be DONE or FAILED" },
        { status: 400 }
      );
    }

    const { id: runId } = await params;

    // Find the run
    const run = await prisma.executionRun.findUnique({
      where: { id: runId },
      include: { request: true },
    });

    if (!run) {
      return NextResponse.json(
        { error: "Run not found" },
        { status: 404 }
      );
    }

    // Verify the run belongs to this node
    if (run.nodeId !== node.id) {
      return NextResponse.json(
        { error: "This run belongs to a different node" },
        { status: 403 }
      );
    }

    // Update run status
    const updatedRun = await prisma.executionRun.update({
      where: { id: runId },
      data: {
        status: status as "DONE" | "FAILED",
        prUrl: prUrl || null,
        previewUrl: previewUrl || null,
        errorMessage: errorMessage || null,
        completedAt: new Date(),
      },
    });

    // Update request status
    await prisma.executionRequest.update({
      where: { id: run.requestId },
      data: {
        status: status === "DONE" ? "COMPLETED" : "CLAIMED", // Keep as CLAIMED if failed (can be retried)
        completedAt: status === "DONE" ? new Date() : null,
      },
    });

    // Clear node currentJobId and set back to ONLINE
    await prisma.workflowNode.update({
      where: { id: node.id },
      data: {
        currentJobId: null,
        status: "ONLINE",
        lastHeartbeatAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      run: {
        id: updatedRun.id,
        status: updatedRun.status,
        prUrl: updatedRun.prUrl,
        previewUrl: updatedRun.previewUrl,
        completedAt: updatedRun.completedAt,
      },
    });
  } catch (error) {
    console.error("[API /runs/:id/complete] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
