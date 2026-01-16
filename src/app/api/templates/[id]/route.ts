import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/requireRole";
import { ROLE } from "@/lib/role";

/**
 * GET /api/templates/[id]
 * Get a single template by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const template = await prisma.emailTemplate.findUnique({
      where: { id },
      include: {
        campaigns: {
          select: {
            id: true,
            name: true,
            status: true,
            totalSent: true,
            opened: true,
          },
        },
      },
    });

    if (!template) {
      return NextResponse.json(
        { success: false, error: "Template not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      template,
    });
  } catch (error: any) {
    console.error("Error fetching template:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch template" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/templates/[id]
 * Update a template
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await req.json();

    // Check if template exists
    const existing = await prisma.emailTemplate.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Template not found" },
        { status: 404 }
      );
    }

    // If changing name, check for conflicts
    if (body.name && body.name !== existing.name) {
      const nameConflict = await prisma.emailTemplate.findUnique({
        where: { name: body.name },
      });

      if (nameConflict) {
        return NextResponse.json(
          { success: false, error: "Template with this name already exists" },
          { status: 400 }
        );
      }
    }

    const template = await prisma.emailTemplate.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.category && { category: body.category }),
        ...(body.subject !== undefined && { subject: body.subject }),
        ...(body.htmlContent !== undefined && { htmlContent: body.htmlContent }),
        ...(body.textContent !== undefined && { textContent: body.textContent }),
        ...(body.variables !== undefined && { variables: body.variables }),
        ...(body.active !== undefined && { active: body.active }),
      },
    });

    return NextResponse.json({
      success: true,
      template,
    });
  } catch (error: any) {
    console.error("Error updating template:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update template" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/templates/[id]
 * Delete a template
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const allowedRoles = [ROLE.CEO, ROLE.CFO];
    if (!allowedRoles.includes(user.role as any)) {
      return NextResponse.json(
        { success: false, error: "Only CEO/CFO can delete templates" },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Check if template is being used in any campaigns
    const template = await prisma.emailTemplate.findUnique({
      where: { id },
      include: {
        campaigns: {
          select: { id: true },
        },
      },
    });

    if (!template) {
      return NextResponse.json(
        { success: false, error: "Template not found" },
        { status: 404 }
      );
    }

    if (template.campaigns.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete template - it's being used by ${template.campaigns.length} campaign(s). Set it to inactive instead.`,
        },
        { status: 400 }
      );
    }

    await prisma.emailTemplate.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Template deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting template:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete template" },
      { status: 500 }
    );
  }
}
