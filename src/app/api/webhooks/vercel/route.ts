import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

/**
 * POST /api/webhooks/vercel
 * 
 * Receives webhook events from Vercel for:
 * - deployment.created
 * - deployment.succeeded
 * - deployment.error
 * - deployment.canceled
 * - deployment.checkrun.start
 * - deployment.checkrun.cancel
 * 
 * Stores deployment data in the database for real-time Command Center updates
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Verify webhook signature (if configured)
    const signature = req.headers.get("x-vercel-signature");
    const webhookSecret = process.env.VERCEL_WEBHOOK_SECRET;
    
    if (webhookSecret && signature) {
      const bodyString = JSON.stringify(body);
      const expectedSignature = crypto
        .createHmac("sha1", webhookSecret)
        .update(bodyString)
        .digest("hex");
      
      if (signature !== expectedSignature) {
        console.error("[Vercel Webhook] Invalid signature");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const eventType = body.type;
    const deployment = body.payload?.deployment;

    if (!deployment) {
      console.error("[Vercel Webhook] No deployment data in payload");
      return NextResponse.json({ error: "No deployment data" }, { status: 400 });
    }

    console.log(`[Vercel Webhook] Received event: ${eventType} for ${deployment.name}`);

    // Extract deployment data
    const deploymentData = {
      deploymentId: deployment.id || deployment.uid,
      name: deployment.name,
      url: deployment.url,
      inspectorUrl: deployment.inspectorUrl,
      state: deployment.state || getStateFromEvent(eventType),
      target: deployment.target,
      createdAt: new Date(deployment.createdAt || deployment.created),
      buildingAt: deployment.buildingAt ? new Date(deployment.buildingAt) : null,
      readyAt: deployment.ready ? new Date(deployment.ready) : null,
      branch: deployment.meta?.githubCommitRef,
      commitSha: deployment.meta?.githubCommitSha,
      commitMessage: deployment.meta?.githubCommitMessage,
      commitAuthor: deployment.meta?.githubCommitAuthorName,
      repo: deployment.meta?.githubRepo,
      webhookEvent: eventType,
      rawData: body,
    };

    // Upsert deployment (update if exists, create if not)
    const savedDeployment = await prisma.vercelDeployment.upsert({
      where: { deploymentId: deploymentData.deploymentId },
      update: {
        state: deploymentData.state,
        buildingAt: deploymentData.buildingAt,
        readyAt: deploymentData.readyAt,
        webhookEvent: deploymentData.webhookEvent,
        rawData: deploymentData.rawData,
      },
      create: deploymentData,
    });

    console.log(`[Vercel Webhook] Saved deployment: ${savedDeployment.name} (${savedDeployment.state})`);

    // Clean up old deployments (keep last 50)
    const oldDeployments = await prisma.vercelDeployment.findMany({
      orderBy: { createdAt: "desc" },
      skip: 50,
      select: { id: true },
    });

    if (oldDeployments.length > 0) {
      await prisma.vercelDeployment.deleteMany({
        where: {
          id: { in: oldDeployments.map((d) => d.id) },
        },
      });
      console.log(`[Vercel Webhook] Cleaned up ${oldDeployments.length} old deployments`);
    }

    return NextResponse.json({
      success: true,
      deployment: {
        id: savedDeployment.id,
        name: savedDeployment.name,
        state: savedDeployment.state,
      },
    });
  } catch (error) {
    console.error("[Vercel Webhook] Error processing webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/webhooks/vercel
 * Test endpoint to verify webhook is accessible
 */
export async function GET() {
  return NextResponse.json({
    message: "Vercel webhook endpoint is active",
    endpoints: {
      webhook: "/api/webhooks/vercel",
      deployments: "/api/integrations/vercel/deployments",
    },
  });
}

/**
 * Helper function to determine state from event type
 */
function getStateFromEvent(eventType: string): string {
  switch (eventType) {
    case "deployment.created":
      return "QUEUED";
    case "deployment.succeeded":
      return "READY";
    case "deployment.error":
      return "ERROR";
    case "deployment.canceled":
      return "CANCELED";
    case "deployment.checkrun.start":
      return "BUILDING";
    default:
      return "UNKNOWN";
  }
}
