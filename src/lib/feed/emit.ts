/**
 * Feed Event Emitter
 * Centralized utility for emitting activity feed events
 */

import { prisma } from "@/lib/prisma";

export type FeedEventType =
  | "lead.created"
  | "lead.converted"
  | "project.created"
  | "project.status_changed"
  | "invoice.created"
  | "invoice.sent"
  | "payment.succeeded"
  | "payment.failed"
  | "commit.summary"
  | "message.sent"
  | "subscription.created"
  | "subscription.updated"
  | "subscription.cancelled"
  | "milestone.completed"
  | "file.uploaded";

interface EmitFeedEventParams {
  projectId: string;
  type: FeedEventType;
  payload?: Record<string, any>;
}

/**
 * Emit a feed event for a project
 * This creates a timestamped activity record that appears in both admin and client feeds
 */
export async function emitFeedEvent({
  projectId,
  type,
  payload = {},
}: EmitFeedEventParams): Promise<void> {
  try {
    await prisma.feedEvent.create({
      data: {
        projectId,
        type,
        payload,
      },
    });
  } catch (error) {
    // Log but don't throw - feed events should never break the main flow
    console.error("[Feed Event Error]", { projectId, type, error });
  }
}

/**
 * Get feed events for a project
 */
export async function getFeedEvents(projectId: string, limit = 50) {
  return prisma.feedEvent.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

/**
 * Helper to emit common events
 */
export const feedHelpers = {
  projectCreated: (projectId: string, projectName: string) =>
    emitFeedEvent({
      projectId,
      type: "project.created",
      payload: { projectName },
    }),

  statusChanged: (projectId: string, from: string, to: string) =>
    emitFeedEvent({
      projectId,
      type: "project.status_changed",
      payload: { from, to },
    }),

  invoiceCreated: (projectId: string, invoiceId: string, amount: number) =>
    emitFeedEvent({
      projectId,
      type: "invoice.created",
      payload: { invoiceId, amount },
    }),

  paymentSucceeded: (projectId: string, amount: number, invoiceId?: string) =>
    emitFeedEvent({
      projectId,
      type: "payment.succeeded",
      payload: { amount, invoiceId },
    }),

  messageSent: (projectId: string, from: string, preview: string) =>
    emitFeedEvent({
      projectId,
      type: "message.sent",
      payload: { from, preview: preview.substring(0, 100) },
    }),

  commitSummary: (projectId: string, commits: any[]) =>
    emitFeedEvent({
      projectId,
      type: "commit.summary",
      payload: { commits, count: commits.length },
    }),
};
