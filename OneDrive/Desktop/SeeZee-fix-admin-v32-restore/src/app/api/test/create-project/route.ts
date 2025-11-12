import { NextRequest, NextResponse } from "next/server";
import { createTestProject } from "@/server/actions/test";
import { auth } from "@/auth";

/**
 * POST /api/test/create-project
 * Create a test project setup without payment
 * Only accessible by CEO/Admin
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || !["CEO", "CFO"].includes(session.user.role || "")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, email, company, phone, packageType, totalAmount, depositAmount } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    const result = await createTestProject({
      name,
      email,
      company,
      phone,
      packageType: packageType || "starter",
      totalAmount,
      depositAmount,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[POST /api/test/create-project]", error);
    return NextResponse.json(
      { error: error.message || "Failed to create test project" },
      { status: 500 }
    );
  }
}


