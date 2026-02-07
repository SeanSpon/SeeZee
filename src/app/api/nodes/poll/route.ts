/**
 * Node Polling API
 * Claims next available ExecutionRequest and creates ExecutionRun
 * Uses atomic update to prevent double-claims
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
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

    // Find next available request (QUEUED status, prioritized)
    const nextRequest = await prisma.executionRequest.findFirst({
      where: {
        status: "QUEUED",
        OR: [
          { targetNodeId: null }, // Available to any node
          { targetNodeId: node.id }, // Specifically assigned to this node
        ],
      },
      orderBy: [
        { priority: "desc" }, // URGENT > HIGH > MEDIUM > LOW
        { createdAt: "asc" }, // Oldest first
      ],
      include: {
        todo: {
          select: {
            id: true,
            title: true,
            description: true,
            projectId: true,
          },
        },
      },
    });

    if (!nextRequest) {
      return NextResponse.json({
        available: false,
        message: "No requests available",
      });
    }

    // Atomic claim: update only if status is still QUEUED
    const claimResult = await prisma.executionRequest.updateMany({
      where: {
        id: nextRequest.id,
        status: "QUEUED", // Guard: only update if still queued
      },
      data: {
        status: "CLAIMED",
        claimedByNodeId: node.id,
        claimedAt: new Date(),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
      },
    });

    // Check if we successfully claimed it
    if (claimResult.count === 0) {
      // Someone else claimed it, try again
      return NextResponse.json({
        available: false,
        message: "Request was claimed by another node, poll again",
      });
    }

    // Create ExecutionRun
    const run = await prisma.executionRun.create({
      data: {
        requestId: nextRequest.id,
        nodeId: node.id,
        status: "RUNNING",
        branchName: nextRequest.branchName,
      },
    });

    // Update node currentJobId
    await prisma.workflowNode.update({
      where: { id: node.id },
      data: {
        currentJobId: run.id,
        status: "BUSY",
        lastHeartbeatAt: new Date(),
      },
    });

    return NextResponse.json({
      available: true,
      request: {
        id: nextRequest.id,
        todoId: nextRequest.todoId,
        todo: nextRequest.todo,
        repoUrl: nextRequest.repoUrl,
        branchName: nextRequest.branchName,
        priority: nextRequest.priority,
      },
      run: {
        id: run.id,
        startedAt: run.startedAt,
      },
    });
  } catch (error) {
    console.error("[API /nodes/poll] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
