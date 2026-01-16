import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/requireRole";
import { ROLE } from "@/lib/role";
import { EmailCategory } from "@prisma/client";

/**
 * GET /api/templates
 * List all email templates
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") as EmailCategory | null;
    const activeOnly = searchParams.get("active") === "true";

    const where: any = {};
    if (category) where.category = category;
    if (activeOnly) where.active = true;

    const templates = await prisma.emailTemplate.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        campaigns: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      templates,
    });
  } catch (error: any) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch templates" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/templates
 * Create a new email template
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const allowedRoles = [ROLE.CEO, ROLE.CFO, ROLE.OUTREACH];
    if (!allowedRoles.includes(user.role as any)) {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, category, subject, htmlContent, textContent, variables, active } = body;

    // Validation
    if (!name || !category || !subject || !htmlContent) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if template name already exists
    const existing = await prisma.emailTemplate.findUnique({
      where: { name },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Template with this name already exists" },
        { status: 400 }
      );
    }

    const template = await prisma.emailTemplate.create({
      data: {
        name,
        category,
        subject,
        htmlContent,
        textContent: textContent || null,
        variables: variables || [],
        active: active !== undefined ? active : true,
      },
    });

    return NextResponse.json({
      success: true,
      template,
    });
  } catch (error: any) {
    console.error("Error creating template:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create template" },
      { status: 500 }
    );
  }
}
