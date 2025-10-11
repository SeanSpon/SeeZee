export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code } = await request.json();

    if (!code || code.length !== 6) {
      return NextResponse.json(
        { error: "Invalid code format" },
        { status: 400 }
      );
    }

    // Find the newest active invite for this email
    const invite = await prisma.staffInviteCode.findFirst({
      where: {
        email: session.user.email,
        redeemedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!invite) {
      return NextResponse.json(
        { error: "no_active_invite", message: "No active invitation found" },
        { status: 404 }
      );
    }

    // Check if locked due to too many attempts
    if (invite.attempts >= invite.maxAttempts) {
      await prisma.systemLog.create({
        data: {
          userId: session.user.id,
          action: "invite_locked",
          entityType: "StaffInviteCode",
          entityId: invite.id,
          metadata: { attempts: invite.attempts },
        },
      });

      return NextResponse.json(
        {
          error: "locked",
          message: "Too many failed attempts. Please request a new code.",
        },
        { status: 423 }
      );
    }

    // Verify the code
    const isValid = await bcrypt.compare(code, invite.codeHash);

    if (!isValid) {
      // Increment attempts
      await prisma.staffInviteCode.update({
        where: { id: invite.id },
        data: { attempts: { increment: 1 } },
      });

      await prisma.systemLog.create({
        data: {
          userId: session.user.id,
          action: "invite_fail",
          entityType: "StaffInviteCode",
          entityId: invite.id,
          metadata: { attempts: invite.attempts + 1 },
        },
      });

      const remainingAttempts = invite.maxAttempts - (invite.attempts + 1);

      return NextResponse.json(
        {
          error: "invalid_code",
          message: `Invalid code. ${remainingAttempts} attempt${remainingAttempts !== 1 ? "s" : ""} remaining.`,
          remainingAttempts,
        },
        { status: 400 }
      );
    }

    // Code is valid - upgrade user and redeem invite
    await prisma.$transaction([
      prisma.user.update({
        where: { email: session.user.email },
        data: {
          role: invite.role,
          invitedById: invite.createdById,
        },
      }),
      prisma.staffInviteCode.update({
        where: { id: invite.id },
        data: { redeemedAt: new Date() },
      }),
      prisma.systemLog.create({
        data: {
          userId: session.user.id,
          action: "invite_redeem",
          entityType: "StaffInviteCode",
          entityId: invite.id,
          metadata: { role: invite.role },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Code verified successfully",
      role: invite.role,
    });
  } catch (error) {
    console.error("Code verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
