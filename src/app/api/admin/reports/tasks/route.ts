import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { getCurrentUser } from "@/lib/auth/requireRole";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const ADMIN_ROLES = ["CEO", "CFO", "ADMIN", "DEV", "FRONTEND", "BACKEND"];
    if (!user || !ADMIN_ROLES.includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const range = searchParams.get("range") || "all";

    // Calculate date filter
    let dateFilter = {};
    const now = new Date();
    if (range === "month") {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { gte: thirtyDaysAgo } };
    } else if (range === "quarter") {
      const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { gte: ninetyDaysAgo } };
    } else if (range === "year") {
      const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { gte: oneYearAgo } };
    }

    // Fetch tasks
    const tasks = await db.clientTask.findMany({
      where: dateFilter,
      include: {
        project: {
          select: {
            name: true,
            organization: { select: { name: true } },
          },
        },
        createdBy: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Convert to CSV
    const headers = [
      "Task ID",
      "Title",
      "Description",
      "Status",
      "Type",
      "Project",
      "Client",
      "Assigned To Client",
      "Requires Upload",
      "Due Date",
      "Completed Date",
      "Created Date",
      "Created By",
    ];

    const rows = tasks.map(task => {
      return [
        task.id,
        task.title,
        (task.description || "").replace(/"/g, '""'),
        task.status,
        task.type || "",
        task.project?.name || "No Project",
        task.project?.organization?.name || "No Client",
        task.assignedToClient ? "Yes" : "No",
        task.requiresUpload ? "Yes" : "No",
        task.dueDate ? task.dueDate.toISOString().split('T')[0] : "",
        task.completedAt ? task.completedAt.toISOString().split('T')[0] : "",
        task.createdAt.toISOString().split('T')[0],
        task.createdBy?.name || "System",
      ];
    });

    const csv = [
      headers.join(","),
      ...rows.map(row => 
        row.map(cell => {
          const value = String(cell);
          if (value.includes(",") || value.includes('"') || value.includes("\n")) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(",")
      ),
    ].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="tasks_${range}_${now.toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error generating tasks report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
