import { NextResponse } from "next/server";
import { requireStaffOrAdminAPI } from "@/lib/server-guards";
import { prisma } from "@/server/db/prisma";

export async function GET() {
  // Check authentication and authorization
  const authResult = await requireStaffOrAdminAPI();
  
  if (authResult.error) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    // With simplified schema, we'll show simplified stats
    const [
      leadsTotal,
      messagesTotal,
      recentMessagesCount
    ] = await Promise.all([
      prisma.lead.count(),
      prisma.message.count(),
      prisma.message.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      })
    ]);

    const stats = {
      projects: {
        total: 0, // Removed from simplified schema
        active: 0,
        completionRate: 0
      },
      invoices: {
        total: 0, // Removed from simplified schema
        paid: 0,
        paidRate: 0
      },
      revenue: {
        total: 0,
        formatted: "$0"
      },
      leads: {
        total: leadsTotal
      },
      activity: {
        recentMessages: recentMessagesCount
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
