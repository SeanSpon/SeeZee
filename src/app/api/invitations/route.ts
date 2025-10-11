import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { UserRole } from "@prisma/client";

// Force Node.js runtime for crypto and future email support
export const runtime = "nodejs";

const CEO_EMAIL = "seanspm1007@gmail.com";

export async function POST(request: Request) {
  try {
    const session = await auth();
    
    // Only CEO can create invitations
    if (!session?.user || session.user.email !== CEO_EMAIL) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { email, role } = await request.json();

    // Validate inputs
    if (!email || !role) {
      return NextResponse.json({ error: "Email and role are required" }, { status: 400 });
    }

    // Validate role
    const validRoles: UserRole[] = ["CEO", "ADMIN", "DESIGNER", "DEV", "OUTREACH", "INTERN", "STAFF"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // Check if there's already a pending invitation
    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        email,
        redeemedAt: null,
        expiresAt: { gte: new Date() },
      },
    });

    if (existingInvitation) {
      return NextResponse.json({ error: "Pending invitation already exists" }, { status: 400 });
    }

    // Generate secure token
    const token = randomBytes(24).toString("hex");

    // Create invitation
    const invitation = await prisma.invitation.create({
      data: {
        email,
        role,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        createdById: session.user.id,
      },
    });

    // TODO: Send invitation email
    // await sendInvitationEmail(email, role, token);

    return NextResponse.json({
      success: true,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        expiresAt: invitation.expiresAt,
        invitationUrl: `${process.env.NEXTAUTH_URL}/join?token=${token}`,
      },
    });
  } catch (error) {
    console.error("Invitation creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth();
    
    // Only CEO can view invitations
    if (!session?.user || session.user.email !== CEO_EMAIL) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const invitations = await prisma.invitation.findMany({
      where: {
        redeemedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ invitations });
  } catch (error) {
    console.error("Fetch invitations error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
