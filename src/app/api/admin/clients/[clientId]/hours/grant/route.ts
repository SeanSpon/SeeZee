/**
 * Admin API to manually grant hours to a client
 * POST /api/admin/clients/[clientId]/hours/grant
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const ADMIN_ROLES = ["ADMIN", "CEO", "CFO", "STAFF"];

export async function POST(
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
      projectId,
      hours, 
      packType = 'COMPLIMENTARY',
      expirationDays = null,
      cost = 0,
      notes = ''
    } = body;

    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }

    if (!hours || hours <= 0) {
      return NextResponse.json({ error: "Hours must be greater than 0" }, { status: 400 });
    }

    // Verify the project exists and belongs to the client
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { organizationId: clientId },
          { id: clientId }, // In case clientId is actually a project ID
        ],
      },
      include: {
        organization: true,
        maintenancePlanRel: true,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Ensure the project has a maintenance plan
    let maintenancePlan = project.maintenancePlanRel;
    
    if (!maintenancePlan) {
      // Create a maintenance plan for this project if it doesn't exist
      maintenancePlan = await prisma.maintenancePlan.create({
        data: {
          projectId: project.id,
          tier: 'CUSTOM',
          status: 'ACTIVE',
          monthlyPrice: 0, // Custom plans with admin-granted hours
          supportHoursIncluded: 0, // Custom plans start with 0 monthly hours
          supportHoursUsed: 0,
          changeRequestsIncluded: 0,
          changeRequestsUsed: 0,
          onDemandEnabled: false,
          gracePeriodUsed: false,
        },
      });
    }

    // Calculate expiration date
    const expiresAt = expirationDays 
      ? new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000)
      : null;

    // Create the hour pack
    const hourPack = await prisma.hourPack.create({
      data: {
        planId: maintenancePlan.id,
        packType: packType,
        hours: hours,
        hoursRemaining: hours,
        cost: cost,
        purchasedAt: new Date(),
        expiresAt: expiresAt,
        neverExpires: expirationDays === null,
        stripePaymentId: `admin_grant_${session.user.id}_${Date.now()}`,
        isActive: true,
      },
    });

    // Create an activity log
    await prisma.activity.create({
      data: {
        type: 'PAYMENT',
        title: `Hours Granted by Admin`,
        description: `${session.user.name || 'Admin'} manually granted ${hours} hours to ${project.organization?.name || project.name}${notes ? `. Note: ${notes}` : ''}`,
        metadata: {
          hourPackId: hourPack.id,
          projectId: project.id,
          grantedBy: session.user.id,
          hours: hours,
          packType: packType,
          expirationDays: expirationDays,
          notes: notes,
        },
        read: false,
      },
    });

    // Create a maintenance log entry
    await prisma.maintenanceLog.create({
      data: {
        planId: maintenancePlan.id,
        hoursSpent: 0, // This is a grant, not usage
        description: `Admin granted ${hours} hours (${packType})${notes ? ` - ${notes}` : ''}`,
        performedBy: session.user.id,
        billable: false,
        overage: false,
      },
    });

    return NextResponse.json({
      success: true,
      hourPack: {
        id: hourPack.id,
        hours: hourPack.hours,
        hoursRemaining: hourPack.hoursRemaining,
        expiresAt: hourPack.expiresAt,
        neverExpires: hourPack.neverExpires,
      },
    });

  } catch (error) {
    console.error('Error granting hours:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to grant hours" },
      { status: 500 }
    );
  }
}
