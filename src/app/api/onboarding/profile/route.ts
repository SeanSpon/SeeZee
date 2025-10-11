import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Force Node.js runtime for Prisma support
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, phone, company } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        phone: phone || null,
        company: company || null,
        profileDoneAt: new Date(),
      },
    });

    // If this is a CLIENT user, create a Lead record
    if (updatedUser.accountType === "CLIENT") {
      await prisma.lead.create({
        data: {
          name: name,
          email: updatedUser.email || "",
          phone: phone || null,
          company: company || null,
          message: "New client signup",
          source: "signup",
          status: "NEW",
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Profile completion error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
