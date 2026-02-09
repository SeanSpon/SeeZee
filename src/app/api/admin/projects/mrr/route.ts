import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/server/db";
import { isStaffRole } from "@/lib/role";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check user role
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || !isStaffRole(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get total MRR from active maintenance plans (source of truth)
    const maintenancePlans = await db.maintenancePlan.findMany({
      where: {
        status: 'ACTIVE',
      },
      select: {
        monthlyPrice: true,
        tier: true,
      },
    });

    const totalMrr = maintenancePlans.reduce((sum, plan) => {
      return sum + (plan.monthlyPrice ? parseFloat(plan.monthlyPrice.toString()) : 0);
    }, 0);

    return NextResponse.json({
      success: true,
      data: {
        totalMrr,
        projectCount: maintenancePlans.length,
      },
    });
  } catch (error) {
    console.error("Error fetching project MRR:", error);
    return NextResponse.json(
      { error: "Failed to fetch project MRR" },
      { status: 500 }
    );
  }
}
