import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean().optional(),
  projectUpdates: z.boolean().optional(),
  invoiceReminders: z.boolean().optional(),
  systemAlerts: z.boolean().optional(),
  executiveReports: z.boolean().optional(),
});

/**
 * GET /api/client/settings/notifications
 * Returns user notification preferences from database
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const prefs = await prisma.notificationPreferences.findUnique({
      where: { userId: session.user.id },
    });

    return NextResponse.json({
      emailNotifications: prefs?.securityEmail ?? true,
      projectUpdates: prefs?.projectUpdatesEmail ?? true,
      invoiceReminders: prefs?.billingEmail ?? true,
      systemAlerts: true,
      executiveReports: true,
    });
  } catch (error: any) {
    console.error("[GET /api/client/settings/notifications]", error);
    return NextResponse.json({ error: "Failed to fetch notification settings" }, { status: 500 });
  }
}

/**
 * PUT /api/client/settings/notifications
 * Update user notification preferences in database
 */
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = notificationSettingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error }, { status: 400 });
    }

    const data = parsed.data;

    // Map client field names to Prisma schema fields
    const dbUpdate: Record<string, any> = {};
    if (data.emailNotifications !== undefined) dbUpdate.securityEmail = data.emailNotifications;
    if (data.projectUpdates !== undefined) dbUpdate.projectUpdatesEmail = data.projectUpdates;
    if (data.invoiceReminders !== undefined) dbUpdate.billingEmail = data.invoiceReminders;

    await prisma.notificationPreferences.upsert({
      where: { userId: session.user.id },
      update: {
        ...dbUpdate,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        ...dbUpdate,
      },
    });

    return NextResponse.json({
      success: true,
      settings: data,
    });
  } catch (error: any) {
    console.error("[PUT /api/client/settings/notifications]", error);
    return NextResponse.json({ error: "Failed to update notification settings" }, { status: 500 });
  }
}
