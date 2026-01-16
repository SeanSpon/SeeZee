/**
 * Admin API to adjust existing hour pack hours
 * PATCH /api/admin/clients/[clientId]/hours/adjust
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const ADMIN_ROLES = ["ADMIN", "CEO", "CFO", "STAFF"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!ADMIN_ROLES.includes(session.user.role || "")) {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }

    const { clientId } = await params;
    const body = await req.json();
    const { 
      hourPackId,
      adjustment, // Can be positive or negative
      reason = ''
    } = body;

    if (!hourPackId) {
      return NextResponse.json({ error: "Hour pack ID is required" }, { status: 400 });
    }

    if (adjustment === undefined || adjustment === 0) {
      return NextResponse.json({ error: "Adjustment amount is required and cannot be 0" }, { status: 400 });
    }

    // Verify the hour pack exists
    const hourPack = await prisma.hourPack.findUnique({
      where: { id: hourPackId },
      include: {
        plan: {
          include: {
            project: {
              include: {
                organization: true,
              },
            },
          },
        },
      },
    });

    if (!hourPack) {
      return NextResponse.json({ error: "Hour pack not found" }, { status: 404 });
    }

    // Calculate new values
    const newHoursRemaining = Math.max(0, hourPack.hoursRemaining + adjustment);
    const newTotalHours = hourPack.hours + adjustment;

    // Update the hour pack
    const updated = await prisma.hourPack.update({
      where: { id: hourPackId },
      data: {
        hours: newTotalHours,
        hoursRemaining: newHoursRemaining,
        isActive: newHoursRemaining > 0,
      },
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        type: 'PAYMENT',
        title: `Hours Adjusted by Admin`,
        description: `${session.user.name || 'Admin'} ${adjustment > 0 ? 'added' : 'removed'} ${Math.abs(adjustment)} hours ${adjustment > 0 ? 'to' : 'from'} ${hourPack.plan.project.organization?.name || hourPack.plan.project.name}${reason ? `. Reason: ${reason}` : ''}`,
        metadata: {
          hourPackId: hourPack.id,
          projectId: hourPack.plan.project.id,
          adjustedBy: session.user.id,
          adjustment: adjustment,
          previousHours: hourPack.hoursRemaining,
          newHours: newHoursRemaining,
          reason: reason,
        },
        read: false,
      },
    });

    // Create maintenance log
    await prisma.maintenanceLog.create({
      data: {
        planId: hourPack.planId,
        hoursSpent: adjustment > 0 ? 0 : Math.abs(adjustment), // Only log if reducing hours
        description: `Admin ${adjustment > 0 ? 'added' : 'removed'} ${Math.abs(adjustment)} hours${reason ? ` - ${reason}` : ''}`,
        performedBy: session.user.id,
        billable: false,
        overage: false,
      },
    });

    return NextResponse.json({
      success: true,
      hourPack: {
        id: updated.id,
        hours: updated.hours,
        hoursRemaining: updated.hoursRemaining,
        previousRemaining: hourPack.hoursRemaining,
        adjustment: adjustment,
      },
    });

  } catch (error) {
    console.error('Error adjusting hours:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to adjust hours" },
      { status: 500 }
    );
  }
}
