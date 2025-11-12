import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has admin role
    const adminRoles = ["ADMIN", "CEO", "STAFF", "FRONTEND", "BACKEND", "OUTREACH", "DESIGNER", "DEV"];
    if (!adminRoles.includes(session.user.role || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get query params
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const assignedTo = searchParams.get("assignedTo");
    const limit = searchParams.get("limit");

    // Build where clause
    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (assignedTo === "me" && session.user.id) {
      where.assignedToId = session.user.id;
    } else if (assignedTo) {
      where.assignedToId = assignedTo;
    }

    // Fetch tasks
    const tasks = await prisma.todo.findMany({
      where,
      ...(limit && { take: parseInt(limit, 10) }),
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: [
        { priority: "desc" },
        { dueDate: "asc" },
        { createdAt: "desc" },
      ],
    });

    // Calculate stats
    const stats = {
      total: await prisma.todo.count({ where }),
      todo: await prisma.todo.count({ where: { ...where, status: "TODO" } }),
      inProgress: await prisma.todo.count({ where: { ...where, status: "IN_PROGRESS" } }),
      done: await prisma.todo.count({ where: { ...where, status: "DONE" } }),
      overdue: await prisma.todo.count({
        where: {
          ...where,
          status: { not: "DONE" },
          dueDate: { lt: new Date() },
        },
      }),
    };

    return NextResponse.json({
      tasks: tasks.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        dueDate: t.dueDate,
        completedAt: t.completedAt,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        assignedTo: t.assignedTo,
        createdBy: t.createdBy,
      })),
      stats,
    });
  } catch (error) {
    console.error("[GET /api/admin/tasks]", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

