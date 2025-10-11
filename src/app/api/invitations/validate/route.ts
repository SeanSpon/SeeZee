import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ valid: false, error: "No token provided" }, { status: 400 });
    }

    const invitation = await prisma.invitation.findFirst({
      where: {
        token,
        redeemedAt: null,
      },
      select: {
        id: true,
        email: true,
        role: true,
        expiresAt: true,
      },
    });

    if (!invitation) {
      return NextResponse.json({ valid: false, error: "Invalid invitation" });
    }

    // Check if expired
    if (invitation.expiresAt < new Date()) {
      return NextResponse.json({ valid: false, expired: true, error: "Invitation expired" });
    }

    return NextResponse.json({
      valid: true,
      email: invitation.email,
      role: invitation.role,
      expiresAt: invitation.expiresAt,
    });
  } catch (error) {
    console.error("Error validating invitation:", error);
    return NextResponse.json(
      { valid: false, error: "Failed to validate invitation" },
      { status: 500 }
    );
  }
}
