import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/server/db";
import { isStaffRole } from "@/lib/role";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || !isStaffRole(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const project = await db.project.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        maintenancePlanRel: {
          select: {
            id: true,
            monthlyPrice: true,
            tier: true,
            status: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const plan = project.maintenancePlanRel;

    return NextResponse.json({
      success: true,
      data: {
        id: project.id,
        name: project.name,
        monthlyRecurringRevenue: plan
          ? parseFloat(plan.monthlyPrice.toString())
          : null,
        maintenancePlan: plan
          ? {
              id: plan.id,
              tier: plan.tier,
              status: plan.status,
              monthlyPrice: parseFloat(plan.monthlyPrice.toString()),
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Error fetching project MRR:", error);
    return NextResponse.json(
      { error: "Failed to fetch MRR" },
      { status: 500 }
    );
  }
}
