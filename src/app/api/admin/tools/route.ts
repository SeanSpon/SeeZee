import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  
  if (!session?.user || !["CEO", "CFO", "FRONTEND", "BACKEND", "OUTREACH"].includes(session.user.role || "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, url, description, category, logoUrl, pricing, tags } = body;

    if (!name || !url) {
      return NextResponse.json({ error: "Name and URL are required" }, { status: 400 });
    }

    const tool = await prisma.tool.create({
      data: {
        name,
        url,
        description: description || null,
        category: category || "Other",
        logoUrl: logoUrl || null,
        pricing: pricing || null,
        tags: tags || [],
      },
    });

    return NextResponse.json({ success: true, tool });
  } catch (error) {
    console.error("[Create Tool Error]", error);
    return NextResponse.json({ error: "Failed to create tool" }, { status: 500 });
  }
}



