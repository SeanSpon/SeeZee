/**
 * Stale Claim Recovery API
 * Finds ExecutionRequests stuck in CLAIMED state past their expiry
 * and requeues them. Designed to be called manually or via cron.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authz";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const now = new Date();

    // Find stale claims: CLAIMED status + expiresAt in the past
    const staleRequests = await prisma.executionRequest.findMany({
      where: {
        status: "CLAIMED",
        expiresAt: { lt: now },
      },
      include: {
        todo: { select: { id: true, title: true } },
      },
    });

    if (staleRequests.length === 0) {
      return NextResponse.json({
        success: true,
        requeued: 0,
        message: "No stale claims found",
      });
    }

    // Requeue each stale request
    const requeued = await Promise.all(
      staleRequests.map(async (request) => {
        // Mark any RUNNING runs for this request as FAILED
        await prisma.executionRun.updateMany({
          where: {
            requestId: request.id,
            status: "RUNNING",
          },
          data: {
            status: "FAILED",
            errorMessage: "Stale claim recovery: node did not complete in time",
            completedAt: now,
          },
        });

        // Reset the request to QUEUED
        const updated = await prisma.executionRequest.update({
          where: { id: request.id },
          data: {
            status: "QUEUED",
            claimedByNodeId: null,
            claimedAt: null,
            expiresAt: null,
          },
        });

        // If the node had this as currentJobId, clear it
        if (request.claimedByNodeId) {
          await prisma.workflowNode.updateMany({
            where: {
              id: request.claimedByNodeId,
              currentJobId: { not: null },
            },
            data: {
              currentJobId: null,
              status: "ONLINE",
            },
          });
        }

        return {
          id: updated.id,
          todoTitle: request.todo.title,
          previousNode: request.claimedByNodeId,
        };
      })
    );

    // Log the recovery
    console.log(`[STALE RECOVERY] Requeued ${requeued.length} stale claims`);

    return NextResponse.json({
      success: true,
      requeued: requeued.length,
      requests: requeued,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.includes("Forbidden") || message.includes("Unauthorized") ? 403 : 500;
    console.error("[API /ceo/maintenance/requeue-stale] Error:", error);
    return NextResponse.json({ error: message }, { status });
  }
}
