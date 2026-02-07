/**
 * Node Heartbeat API
 * Updates node lastHeartbeatAt timestamp to indicate it's alive
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

    const apiKey = authHeader.slice(7); // Remove "Bearer "
    
    // Parse apiKey format: {apiKeyId}.{secret}
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

    // Update heartbeat
    const updated = await prisma.workflowNode.update({
      where: { id: node.id },
      data: {
        lastHeartbeatAt: new Date(),
        status: "ONLINE",
      },
    });

    return NextResponse.json({
      success: true,
      nodeId: updated.id,
      timestamp: updated.lastHeartbeatAt,
    });
  } catch (error) {
    console.error("[API /nodes/heartbeat] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
