/**
 * Admin API to fetch client hours data
 * GET /api/admin/clients/[clientId]/hours
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const ADMIN_ROLES = ["ADMIN", "CEO", "CFO", "STAFF"];

export async function GET(
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
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');

    // If projectId is provided, fetch that specific project's plan
    if (projectId) {
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          OR: [
            { organizationId: clientId },
            { id: clientId },
          ],
        },
        include: {
          maintenancePlanRel: {
            include: {
              hourPacks: {
                orderBy: { purchasedAt: 'desc' },
              },
            },
          },
        },
      });

      if (!project) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
      }

      // Serialize the plan data
      const plan = project.maintenancePlanRel ? {
        id: project.maintenancePlanRel.id,
        tier: project.maintenancePlanRel.tier,
        status: project.maintenancePlanRel.status,
        supportHoursIncluded: project.maintenancePlanRel.supportHoursIncluded,
        supportHoursUsed: project.maintenancePlanRel.supportHoursUsed,
        changeRequestsIncluded: project.maintenancePlanRel.changeRequestsIncluded,
        changeRequestsUsed: project.maintenancePlanRel.changeRequestsUsed,
        onDemandEnabled: project.maintenancePlanRel.onDemandEnabled,
        rolloverHours: project.maintenancePlanRel.rolloverHours,
        rolloverEnabled: project.maintenancePlanRel.rolloverEnabled,
        rolloverCap: project.maintenancePlanRel.rolloverCap,
        hourPacks: project.maintenancePlanRel.hourPacks.map(pack => ({
          id: pack.id,
          packType: pack.packType,
          hours: pack.hours,
          hoursRemaining: pack.hoursRemaining,
          cost: pack.cost,
          purchasedAt: pack.purchasedAt.toISOString(),
          expiresAt: pack.expiresAt?.toISOString() || null,
          neverExpires: pack.neverExpires,
          isActive: pack.isActive,
          stripePaymentId: pack.stripePaymentId,
        })),
      } : null;

      return NextResponse.json({ plan });
    }

    // Otherwise, fetch all projects for this client with their plans
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { organizationId: clientId },
          { id: clientId },
        ],
      },
      include: {
        maintenancePlanRel: {
          include: {
            hourPacks: {
              orderBy: { purchasedAt: 'desc' },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Serialize all plans
    const plans = projects
      .filter(p => p.maintenancePlanRel)
      .map(project => ({
        projectId: project.id,
        projectName: project.name,
        projectStatus: project.status,
        plan: {
          id: project.maintenancePlanRel!.id,
          tier: project.maintenancePlanRel!.tier,
          status: project.maintenancePlanRel!.status,
          supportHoursIncluded: project.maintenancePlanRel!.supportHoursIncluded,
          supportHoursUsed: project.maintenancePlanRel!.supportHoursUsed,
          changeRequestsIncluded: project.maintenancePlanRel!.changeRequestsIncluded,
          changeRequestsUsed: project.maintenancePlanRel!.changeRequestsUsed,
          onDemandEnabled: project.maintenancePlanRel!.onDemandEnabled,
          rolloverHours: project.maintenancePlanRel!.rolloverHours,
          rolloverEnabled: project.maintenancePlanRel!.rolloverEnabled,
          rolloverCap: project.maintenancePlanRel!.rolloverCap,
          hourPacks: project.maintenancePlanRel!.hourPacks.map(pack => ({
            id: pack.id,
            packType: pack.packType,
            hours: pack.hours,
            hoursRemaining: pack.hoursRemaining,
            cost: pack.cost,
            purchasedAt: pack.purchasedAt.toISOString(),
            expiresAt: pack.expiresAt?.toISOString() || null,
            neverExpires: pack.neverExpires,
            isActive: pack.isActive,
            stripePaymentId: pack.stripePaymentId,
          })),
        },
      }));

    return NextResponse.json({ plans });

  } catch (error) {
    console.error('Error fetching client hours:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch client hours" },
      { status: 500 }
    );
  }
}
