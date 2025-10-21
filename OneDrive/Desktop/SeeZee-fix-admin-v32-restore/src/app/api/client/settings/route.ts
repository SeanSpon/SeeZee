import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { clientSettingsUpdate } from "@/lib/validation/client";

/**
 * GET /api/client/settings
 * Returns client profile settings
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        company: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      name: user.name || "",
      email: user.email,
      timezone: "UTC", // Default timezone, add to user model if needed
      phone: user.phone || "",
      company: user.company || "",
    });
  } catch (error: any) {
    console.error("[GET /api/client/settings]", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

/**
 * PUT /api/client/settings
 * Update client profile settings
 */
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = clientSettingsUpdate.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error }, { status: 400 });
    }

    const { name, timezone } = parsed.data;

    const user = await prisma.user.update({
      where: { email: session.user.email! },
      data: {
        name,
        // Timezone would need to be added to user model
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        company: true,
      },
    });

    return NextResponse.json({
      item: {
        name: user.name || "",
        email: user.email,
        timezone,
        phone: user.phone || "",
        company: user.company || "",
      },
    });
  } catch (error: any) {
    console.error("[PUT /api/client/settings]", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
