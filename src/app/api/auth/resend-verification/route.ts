import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateToken } from "@/lib/encryption/crypto";
import { sendEmailWithRateLimit } from "@/lib/email/send";
import { renderVerificationEmail } from "@/lib/email/templates/verification";
import { emailSchema } from "@/lib/auth/validation";
import { auth } from "@/auth";

export async function POST(request: NextRequest) {  try {
    const body = await request.json().catch(() => ({}));
    let { email } = body;
    
    // Priority: Always use session email if available (it's the source of truth)
    const session = await auth();
    if (session?.user?.email) {
      // Session email takes priority over body email to prevent stale data issues
      email = session.user.email;
    } else if (!email) {
      // Only use body email if no session email available
      email = body.email;
    }    
    if (!email) {
      return NextResponse.json(
        { error: "Email address is required" },
        { status: 400 }
      );
    }
    
    // Validate email
    const validation = emailSchema.safeParse(email);
    if (!validation.success) {      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });    
    if (!user) {
      // Don't reveal if email exists for security
      return NextResponse.json({
        success: true,
        message: "If an account exists with this email, a verification link has been sent.",
      });
    }
    
    // Check if already verified
    if (user.emailVerified) {      return NextResponse.json(
        { error: "Email is already verified" },
        { status: 400 }
      );
    }
    
    // Generate new verification token
    const verificationToken = generateToken(32);
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    // Update user with new token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
      },
    });    
    // Send verification email with rate limiting
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/verify-email/${verificationToken}`;
    const emailTemplate = renderVerificationEmail({
      email: user.email,
      verificationUrl,
    });    
    const emailResult = await sendEmailWithRateLimit(
      {
        to: user.email,
        subject: "Verify your email address - SeeZee Studio",
        html: emailTemplate.html,
        text: emailTemplate.text,
      },
      "email_verification"
    );    
    if (!emailResult.success) {
      console.error("[RESEND VERIFICATION] Failed to send email:", {
        email: user.email,
        error: emailResult.error,
        rateLimited: emailResult.rateLimited,
      });
      
      if (emailResult.rateLimited) {
        return NextResponse.json(
          { error: emailResult.error || "Too many emails sent. Please try again later." },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { error: emailResult.error || "Failed to send verification email. Please try again later." },
        { status: 500 }
      );
    }
    
    console.log("[RESEND VERIFICATION] ✅ Email sent successfully to:", user.email);
    return NextResponse.json({
      success: true,
      message: "Verification email sent successfully.",
    });
  } catch (error) {    console.error("Resend verification error:", error);
    return NextResponse.json(
      { error: "Failed to resend verification email" },
      { status: 500 }
    );
  }
}










