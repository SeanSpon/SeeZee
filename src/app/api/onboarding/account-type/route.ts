import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { accountType } = body;

    // Only allow CLIENT selection here (STAFF upgrade happens via verify-code)
    if (accountType !== "CLIENT") {
      return NextResponse.json(
        { error: "Only CLIENT account type can be set directly. Use verify-code endpoint for STAFF." },
        { status: 400 }
      );
    }

    // Update user to CLIENT
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        accountType: "CLIENT",
        role: "CLIENT",
      },
    });

    return NextResponse.json({
      success: true,
      accountType: updatedUser.accountType,
      role: updatedUser.role,
    });
  } catch (error) {
    console.error("Error setting account type:", error);
    return NextResponse.json(
      { error: "Failed to set account type" },
      { status: 500 }
    );
  }
}
