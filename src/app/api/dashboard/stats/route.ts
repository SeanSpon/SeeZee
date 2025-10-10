import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET() {
  // Check authentication
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    // Mock stats data since we're using JWT sessions without database
    const stats = {
      projects: {
        total: 0,
        active: 0,
        completionRate: 0
      },
      invoices: {
        total: 0,
        paid: 0,
        paidRate: 0
      },
      revenue: {
        total: 0,
        formatted: "$0"
      },
      leads: {
        total: 0
      },
      activity: {
        recentMessages: 0
      }
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
