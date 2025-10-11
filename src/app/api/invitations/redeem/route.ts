import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

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

    // Find the invitation
    const invitation = await prisma.invitation.findFirst({
      where: {
        token,
        redeemedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!invitation) {
      return NextResponse.redirect(new URL("/login?error=invalid_invitation", req.url));
    }

    // Verify the email matches
    if (invitation.email.toLowerCase() !== session.user.email.toLowerCase()) {
      return NextResponse.redirect(
        new URL(
          `/join?token=${token}&error=wrong_email&invited=${encodeURIComponent(invitation.email)}`,
          req.url
        )
      );
    }

    // Find or create the user
    let user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      // This shouldn't happen as NextAuth creates the user, but handle it just in case
      return NextResponse.redirect(new URL("/login?error=user_not_found", req.url));
    }

    // Update the user with STAFF account type and the invited role
    await prisma.user.update({
      where: { id: user.id },
      data: {
        accountType: "STAFF",
        role: invitation.role,
        // Mark onboarding as complete for staff
        tosAcceptedAt: new Date(),
        profileDoneAt: new Date(),
      },
    });

    // Mark invitation as redeemed
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: {
        redeemedAt: new Date(),
      },
    });

    // Force sign out and back in to refresh the JWT token with new role/accountType
    return NextResponse.redirect(new URL("/api/auth/signout?callbackUrl=/login?invited=success", req.url));
  } catch (error) {
    console.error("Error redeeming invitation:", error);
    return NextResponse.redirect(new URL("/login?error=redeem_failed", req.url));
  }
}
