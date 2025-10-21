import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/server/db";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        company: true,
        phone: true,
        image: true,
      },
    });

    return NextResponse.json({ profile: user });
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, company, phone } = body;

    const updatedUser = await db.user.update({
      where: { email: session.user.email },
      data: {
        name: name || undefined,
        company: company || undefined,
        phone: phone || undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        company: true,
        phone: true,
      },
    });

    return NextResponse.json({ profile: updatedUser });
  } catch (error) {
    console.error("Failed to update profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
