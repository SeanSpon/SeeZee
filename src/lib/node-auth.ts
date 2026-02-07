/**
 * Node Authentication Helper
 * Shared authentication logic for worker-facing API routes.
 * Authenticates nodes via Bearer API key (format: keyId.secret).
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import type { WorkflowNode } from "@prisma/client";

interface NodeAuthResult {
  node: WorkflowNode;
}

interface NodeAuthError {
  error: string;
  status: number;
}

/**
 * Authenticate a node from the Authorization header.
 * Returns the node record or an error object.
 */
export async function authenticateNode(
  req: NextRequest
): Promise<NodeAuthResult | NodeAuthError> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: "Missing or invalid authorization header", status: 401 };
  }

  const apiKey = authHeader.slice(7);
  const parts = apiKey.split(".");
  if (parts.length !== 2) {
    return { error: "Invalid API key format", status: 401 };
  }

  const [apiKeyId, secret] = parts;

  const node = await prisma.workflowNode.findUnique({
    where: { apiKeyId },
  });

  if (!node) {
    return { error: "Invalid API key", status: 401 };
  }

  const isValid = await bcrypt.compare(secret, node.apiKeyHash);
  if (!isValid) {
    return { error: "Invalid API key", status: 401 };
  }

  return { node };
}

/**
 * Type guard: check if auth result is an error
 */
export function isAuthError(
  result: NodeAuthResult | NodeAuthError
): result is NodeAuthError {
  return "error" in result;
}

/**
 * Return a NextResponse error from an auth error object.
 */
export function authErrorResponse(err: NodeAuthError): NextResponse {
  return NextResponse.json({ error: err.error }, { status: err.status });
}
