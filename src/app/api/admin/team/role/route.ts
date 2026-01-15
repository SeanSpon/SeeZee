import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

// CEO-only role management endpoint
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();

    // Check if user is authenticated and is CEO
    if (!session?.user?.email || session.user.email !== "seanspm1007@gmail.com") {
      return NextResponse.json(
        { error: "Unauthorized. CEO access required." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { userId, role } = body;

    // Validate inputs
    if (!userId || !role) {
      return NextResponse.json(
        { error: "Missing required fields: userId and role" },
        { status: 400 }
      );
    }

    // Validate role is a valid UserRole
    if (!Object.values(UserRole).includes(role as UserRole)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${Object.values(UserRole).join(", ")}` },
        { status: 400 }
      );
    }

    // Get current user data
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true }
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Prevent CEO from changing their own role
    if (currentUser.email === "seanspm1007@gmail.com") {
      return NextResponse.json(
        { error: "Cannot change CEO role" },
        { status: 400 }
      );
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: role as UserRole },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        updatedAt: true
      }
    });

    // TODO: Log the role change after migration
    // await prisma.systemLog.create({
    //   data: {
    //     action: "ROLE_CHANGE",
    //     entityType: "User",
    //     entityId: userId,
    //     userId: session.user.id!,
    //     metadata: {
    //       oldRole: currentUser.role,
    //       newRole: role,
    //       userName: currentUser.name || currentUser.email,
    //       changedBy: session.user.email
    //     }
    //   }
    // });

    return NextResponse.json({
      success: true,
      message: `Role updated to ${role}`,
      user: updatedUser
    });

  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
