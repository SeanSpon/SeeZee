/**
 * Admin API: Create Workflow Nodes
 * POST /api/admin/nodes/create
 * 
 * Creates a new WorkflowNode with secure API key generation
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

export async function POST(req: NextRequest) {
  try {
    // Require admin authentication
    await requireAdmin();

    const body = await req.json();
    const { name, type, capabilities } = body;

    // Validate input
    if (!name || !type) {
      return NextResponse.json(
        { error: "Name and type are required" },
        { status: 400 }
      );
    }

    // Generate secure API key
    const secret = randomBytes(32).toString("hex");
    const apiKeyId = `node_${randomBytes(16).toString("hex")}`;
    const apiKeyHash = await bcrypt.hash(secret, 10);
    const fullKey = `${apiKeyId}.${secret}`;

    // Create node in database
    const node = await prisma.workflowNode.create({
      data: {
        name,
        type,
        status: "OFFLINE",
        apiKeyId,
        apiKeyHash,
        capabilities: capabilities || {
          git: type === "GIT_AGENT",
          build: false,
          test: false,
          ai: type === "AI_AGENT",
        },
        metadata: {},
      },
    });

    return NextResponse.json({
      success: true,
      node: {
        id: node.id,
        name: node.name,
        type: node.type,
        status: node.status,
        apiKey: fullKey, // IMPORTANT: Only returned once!
        createdAt: node.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Error creating workflow node:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create node" },
      { status: 500 }
    );
  }
}
