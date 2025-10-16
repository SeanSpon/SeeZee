import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(new URL("/login?error=no_token", req.url));
    }

    // Find all invite codes for this email
    const inviteCodes = await prisma.staffInviteCode.findMany({
      where: {
        email: session.user.email.toLowerCase(),
        redeemedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (inviteCodes.length === 0) {
      return NextResponse.redirect(new URL("/login?error=invalid_invitation", req.url));
    }

    // Find the invitation that matches the provided token
    let validInvitation = null;
    for (const invite of inviteCodes) {
      const isValid = await bcrypt.compare(token, invite.codeHash);
      if (isValid) {
        validInvitation = invite;
        break;
      }
    }

    if (!validInvitation) {
      return NextResponse.redirect(new URL("/login?error=invalid_invitation", req.url));
    }

    // Find or create the user
    let user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      // This shouldn't happen as NextAuth creates the user, but handle it just in case
      return NextResponse.redirect(new URL("/login?error=user_not_found", req.url));
    }

    // Update the user with the invited role
    await prisma.user.update({
      where: { id: user.id },
      data: {
        role: validInvitation.role,
        // Mark onboarding as complete for staff
        tosAcceptedAt: new Date(),
        profileDoneAt: new Date(),
      },
    });

    // Mark invitation as redeemed
    await prisma.staffInviteCode.update({
      where: { id: validInvitation.id },
      data: {
        redeemedAt: new Date(),
      },
    });

    // Force sign out and back in to refresh the JWT token with new role
    return NextResponse.redirect(new URL("/api/auth/signout?callbackUrl=/login?invited=success", req.url));
  } catch (error) {
    console.error("Error redeeming invitation:", error);
    return NextResponse.redirect(new URL("/login?error=redeem_failed", req.url));
  }
}
