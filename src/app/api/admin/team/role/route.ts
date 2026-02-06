import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { revalidateTag } from "next/cache";
import { revalidatePath } from "next/cache";

// CEO/CFO role management endpoint
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();

    // Check if user is authenticated and has CEO or CFO role
    if (!session?.user?.role || !['CEO', 'CFO'].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Unauthorized. CEO or CFO access required." },
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

    // Prevent changing CEO role
    if (currentUser.role === "CEO") {
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

    // Revalidate team data so the UI reflects the change
    revalidateTag("team", {});
    revalidatePath("/admin/team");

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
