import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Force Node.js runtime for Prisma support
export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const invitation = await prisma.invitation.findUnique({
      where: { token },
    });

    if (!invitation) {
      return NextResponse.json({ error: "Invalid invitation token" }, { status: 404 });
    }

    if (invitation.redeemedAt) {
      return NextResponse.json({ error: "Invitation already used" }, { status: 400 });
    }

    if (invitation.expiresAt < new Date()) {
      return NextResponse.json({ error: "Invitation has expired" }, { status: 400 });
    }

    return NextResponse.json({
      email: invitation.email,
      role: invitation.role,
    });
  } catch (error) {
    console.error("Invitation validation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
