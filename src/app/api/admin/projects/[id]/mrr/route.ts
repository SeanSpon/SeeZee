import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/server/db";
import { Prisma } from "@prisma/client";
import { isStaffRole } from "@/lib/role";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await req.json();
    const { monthlyRecurringRevenue } = body;

    // Validate input
    if (monthlyRecurringRevenue !== null && monthlyRecurringRevenue !== undefined) {
      const mrrValue = parseFloat(monthlyRecurringRevenue);
      if (isNaN(mrrValue) || mrrValue < 0) {
        return NextResponse.json(
          { error: "Invalid MRR value. Must be a positive number." },
          { status: 400 }
        );
      }
    }

    // Update project MRR
    const project = await db.project.update({
      where: { id },
      data: {
        monthlyRecurringRevenue:
          monthlyRecurringRevenue !== null && monthlyRecurringRevenue !== undefined
            ? new Prisma.Decimal(monthlyRecurringRevenue)
            : null,
      },
      select: {
        id: true,
        name: true,
        monthlyRecurringRevenue: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...project,
        monthlyRecurringRevenue: project.monthlyRecurringRevenue
          ? parseFloat(project.monthlyRecurringRevenue.toString())
          : null,
      },
    });
  } catch (error) {
    console.error("Error updating project MRR:", error);
    return NextResponse.json(
      { error: "Failed to update MRR" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    const project = await db.project.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        monthlyRecurringRevenue: true,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...project,
        monthlyRecurringRevenue: project.monthlyRecurringRevenue
          ? parseFloat(project.monthlyRecurringRevenue.toString())
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
