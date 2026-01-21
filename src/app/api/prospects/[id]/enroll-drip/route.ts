import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/requireRole";
import { ROLE } from "@/lib/role";
import { enrollProspect } from "@/lib/cron/drip-campaign-sender";

/**
 * POST /api/prospects/[id]/enroll-drip
 * Enroll a prospect in a drip campaign
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const allowedRoles = [ROLE.CEO, ROLE.CFO, ROLE.OUTREACH];
    if (!allowedRoles.includes(user.role as any)) {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const { id: prospectId } = await params;
    const body = await req.json();
    const { campaignId } = body;

    if (!campaignId) {
      return NextResponse.json(
        { success: false, error: "Campaign ID is required" },
        { status: 400 }
      );
    }

    const result = await enrollProspect(prospectId, campaignId);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error enrolling prospect in drip campaign:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to enroll prospect" },
      { status: 500 }
    );
  }
}
