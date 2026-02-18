import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isStaffRole } from "@/lib/role";
import { getAccessToken } from "@/lib/google-drive";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || !isStaffRole(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const accessToken = await getAccessToken(session.user.id);

    return NextResponse.json({
      accessToken,
      developerKey: process.env.GOOGLE_API_KEY ?? "",
    });
  } catch (error) {
    console.error("Picker token error:", error);
    const message = error instanceof Error ? error.message : "Failed to get picker token";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
