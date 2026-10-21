import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { intakeSchema } from "@/lib/validation/intake";
import { submitIntake } from "@/server/intake";

export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const parsed = intakeSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        {
          error: "Please check your contact details and project information.",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    const session = await auth();
    const identity = session?.user?.id
      ? await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { id: true, name: true, email: true },
        })
      : null;
    if (identity && identity.email.toLowerCase() !== parsed.data.email)
      return NextResponse.json(
        {
          error:
            "Use the email for your signed-in account, or sign out to submit for someone else.",
        },
        { status: 400 },
      );
    // Count only new submissions; replaying a committed submission is safe and cheap.
    const recent = await prisma.lead.count({
      where: {
        email: parsed.data.email,
        source: "WEBSITE_INTAKE",
        createdAt: { gte: new Date(Date.now() - 60000) },
      },
    });
    if (recent >= 5)
      return NextResponse.json(
        { error: "Please wait a minute before submitting another request." },
        { status: 429, headers: { "Retry-After": "60" } },
      );
    const result = await submitIntake(prisma, parsed.data, identity);
    // Commit is the success boundary. Notification failures cannot turn a saved request into a failed submission.
    if (!result.duplicate)
      after(async () => {
        const { createNewLeadNotification } = await import(
          "@/lib/notifications"
        );
        await createNewLeadNotification(
          result.leadId,
          parsed.data.name,
          parsed.data.email,
          parsed.data.company || null,
          "Website intake",
        ).catch(() =>
          console.error("[Intake] Notification failed", result.leadId),
        );
        // Preview tests must not email real clients or staff.
        if (
          process.env.VERCEL_ENV !== "preview" &&
          process.env.INTAKE_DISABLE_EMAIL !== "true"
        ) {
          const { sendWelcomeEmail } = await import("@/lib/mailer");
          await sendWelcomeEmail({
            to: parsed.data.email,
            firstName: parsed.data.name.split(" ")[0],
            dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://seezeestudios.com"}/client`,
          }).catch(() => console.error("[Intake] Email failed", result.leadId));
        }
      });
    return NextResponse.json(
      { success: true, ...result },
      { status: result.duplicate ? 200 : 201 },
    );
  } catch (error) {
    console.error(
      "[Intake] Save failed",
      error instanceof Error ? error.name : "Unknown",
    );
    return NextResponse.json(
      { error: "We couldn't save your request. Please try again." },
      { status: 500 },
    );
  }
}
