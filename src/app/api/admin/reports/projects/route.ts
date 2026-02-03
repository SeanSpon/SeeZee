import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { getCurrentUser } from "@/lib/auth/requireRole";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
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

    // Fetch projects
    const projects = await db.project.findMany({
      where: dateFilter,
      include: {
        organization: { select: { name: true, email: true } },
        assignee: { select: { name: true, email: true } },
        tasks: { select: { id: true, status: true } },
        _count: {
          select: {
            tasks: true,
            milestones: true,
            invoices: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Convert to CSV
    const headers = [
      "Project ID",
      "Project Name",
      "Client Name",
      "Client Email",
      "Status",
      "Type",
      "Budget",
      "Total Tasks",
      "Completed Tasks",
      "Milestones",
      "Invoices",
      "Assignee",
      "Start Date",
      "Due Date",
      "Completed Date",
      "Created Date",
      "Description",
    ];

    const rows = projects.map(project => {
      const completedTasks = project.tasks.filter(t => t.status === "COMPLETED").length;

      return [
        project.id,
        project.name,
        project.organization?.name || "No Client",
        project.organization?.email || "",
        project.status,
        project.type || "",
        project.budget ? Number(project.budget).toFixed(2) : "",
        project._count.tasks,
        completedTasks,
        project._count.milestones,
        project._count.invoices,
        project.assignee?.name || "Unassigned",
        project.startDate ? project.startDate.toISOString().split('T')[0] : "",
        project.dueDate ? project.dueDate.toISOString().split('T')[0] : "",
        project.completedAt ? project.completedAt.toISOString().split('T')[0] : "",
        project.createdAt.toISOString().split('T')[0],
        (project.description || "").replace(/"/g, '""'),
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
        "Content-Disposition": `attachment; filename="projects_${range}_${now.toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error generating projects report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
