import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const ADMIN_ROLES = ["ADMIN", "CEO", "CFO", "STAFF", "FRONTEND", "BACKEND", "OUTREACH", "DESIGNER", "DEV"];

/**
 * GET /api/admin/tasks/[id]/materials
 * Get all materials for a task
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!ADMIN_ROLES.includes(session.user.role || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    // Verify task exists
    const task = await prisma.todo.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const materials = await prisma.taskMaterial.findMany({
      where: { todoId: id },
      orderBy: [
        { order: "asc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ materials });
  } catch (error) {
    console.error("[GET /api/admin/tasks/[id]/materials]", error);
    return NextResponse.json(
      { error: "Failed to fetch materials" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/tasks/[id]/materials
 * Create a new material for a task
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!ADMIN_ROLES.includes(session.user.role || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    // Verify task exists
    const task = await prisma.todo.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const {
      title,
      description,
      type,
      fileUrl,
      linkUrl,
      fileName,
      fileSize,
      mimeType,
      dueDate,
      isRequired,
      order,
    } = body;

    if (!title || !type) {
      return NextResponse.json(
        { error: "Title and type are required" },
        { status: 400 }
      );
    }

    // Get current max order
    const maxOrder = await prisma.taskMaterial.aggregate({
      where: { todoId: id },
      _max: { order: true },
    });

    const material = await prisma.taskMaterial.create({
      data: {
        todoId: id,
        title,
        description: description || null,
        type,
        fileUrl: fileUrl || null,
        linkUrl: linkUrl || null,
        fileName: fileName || null,
        fileSize: fileSize || null,
        mimeType: mimeType || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        isRequired: isRequired || false,
        order: order ?? (maxOrder._max.order || 0) + 1,
        createdById: session.user.id!,
      },
    });

    return NextResponse.json({ material }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/tasks/[id]/materials]", error);
    return NextResponse.json(
      { error: "Failed to create material" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/tasks/[id]/materials
 * Update a material (materialId passed in body)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!ADMIN_ROLES.includes(session.user.role || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    const { materialId, ...updateData } = body;

    if (!materialId) {
      return NextResponse.json(
        { error: "materialId is required" },
        { status: 400 }
      );
    }

    // Verify material exists and belongs to this task
    const existingMaterial = await prisma.taskMaterial.findFirst({
      where: {
        id: materialId,
        todoId: id,
      },
    });

    if (!existingMaterial) {
      return NextResponse.json(
        { error: "Material not found" },
        { status: 404 }
      );
    }

    const dataToUpdate: any = {};
    
    if (updateData.title !== undefined) dataToUpdate.title = updateData.title;
    if (updateData.description !== undefined) dataToUpdate.description = updateData.description;
    if (updateData.type !== undefined) dataToUpdate.type = updateData.type;
    if (updateData.fileUrl !== undefined) dataToUpdate.fileUrl = updateData.fileUrl;
    if (updateData.linkUrl !== undefined) dataToUpdate.linkUrl = updateData.linkUrl;
    if (updateData.fileName !== undefined) dataToUpdate.fileName = updateData.fileName;
    if (updateData.fileSize !== undefined) dataToUpdate.fileSize = updateData.fileSize;
    if (updateData.mimeType !== undefined) dataToUpdate.mimeType = updateData.mimeType;
    if (updateData.dueDate !== undefined) {
      dataToUpdate.dueDate = updateData.dueDate ? new Date(updateData.dueDate) : null;
    }
    if (updateData.isRequired !== undefined) dataToUpdate.isRequired = updateData.isRequired;
    if (updateData.order !== undefined) dataToUpdate.order = updateData.order;

    const material = await prisma.taskMaterial.update({
      where: { id: materialId },
      data: dataToUpdate,
    });

    return NextResponse.json({ material });
  } catch (error) {
    console.error("[PATCH /api/admin/tasks/[id]/materials]", error);
    return NextResponse.json(
      { error: "Failed to update material" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/tasks/[id]/materials
 * Delete a material (materialId passed in query)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!ADMIN_ROLES.includes(session.user.role || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const materialId = searchParams.get("materialId");

    if (!materialId) {
      return NextResponse.json(
        { error: "materialId is required" },
        { status: 400 }
      );
    }

    // Verify material exists and belongs to this task
    const existingMaterial = await prisma.taskMaterial.findFirst({
      where: {
        id: materialId,
        todoId: id,
      },
    });

    if (!existingMaterial) {
      return NextResponse.json(
        { error: "Material not found" },
        { status: 404 }
      );
    }

    await prisma.taskMaterial.delete({
      where: { id: materialId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/admin/tasks/[id]/materials]", error);
    return NextResponse.json(
      { error: "Failed to delete material" },
      { status: 500 }
    );
  }
}
