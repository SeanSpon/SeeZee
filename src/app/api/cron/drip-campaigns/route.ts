import { NextRequest, NextResponse } from "next/server";
import { processDripCampaigns } from "@/lib/cron/drip-campaign-sender";

/**
 * POST /api/cron/drip-campaigns
 * Cron job endpoint to process and send drip campaign emails
 * 
 * This endpoint should be called hourly by Vercel Cron or similar service
 * Add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/drip-campaigns",
 *     "schedule": "0 * * * *"
 *   }]
 * }
 */
export async function POST(req: NextRequest) {
  try {
    // Verify cron secret for security (optional but recommended)
    const authHeader = req.headers.get("authorization");
    if (process.env.CRON_SECRET) {
      if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 401 }
        );
      }
    }

    console.log("[Cron] Starting drip campaign processing...");
    const result = await processDripCampaigns();

    return NextResponse.json({
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[Cron] Error processing drip campaigns:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to process drip campaigns",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cron/drip-campaigns
 * Manual trigger for testing (only in development)
 */
export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { success: false, error: "GET method not allowed in production" },
      { status: 405 }
    );
  }

  return POST(req);
}
