import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// CEO-only CSV export endpoint
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    // Check if user is authenticated and is CEO
    if (!session?.user?.email || session.user.email !== "seanspm1007@gmail.com") {
      return NextResponse.json(
        { error: "Unauthorized. CEO access required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "leads";

    let csvContent = "";
    let filename = "";

    switch (type) {
      case "leads":
        const leads = await prisma.lead.findMany({
          orderBy: { createdAt: "desc" },
        });

        csvContent = "ID,Name,Email,Phone,Company,Status,Service Type,Budget,Timeline,Source,Created At\n";
        leads.forEach((lead) => {
          csvContent += `"${lead.id}","${lead.name}","${lead.email}","${lead.phone || ""}","${lead.company || ""}","${lead.status}","${lead.serviceType || ""}","${lead.budget || ""}","${lead.timeline || ""}","${lead.source || ""}","${lead.createdAt.toISOString()}"\n`;
        });

        filename = `leads-export-${new Date().toISOString().split("T")[0]}.csv`;
        break;

      case "projects":
        const projects = await prisma.project.findMany({
          include: {
            organization: { select: { name: true } },
            assignee: { select: { name: true, email: true } },
          },
          orderBy: { createdAt: "desc" },
        });

        csvContent = "ID,Name,Status,Organization,Assignee,Budget,Start Date,End Date,Created At\n";
        projects.forEach((project) => {
          csvContent += `"${project.id}","${project.name}","${project.status}","${project.organization.name}","${project.assignee?.name || "Unassigned"}","${project.budget || ""}","${project.startDate?.toISOString() || ""}","${project.endDate?.toISOString() || ""}","${project.createdAt.toISOString()}"\n`;
        });

        filename = `projects-export-${new Date().toISOString().split("T")[0]}.csv`;
        break;

      case "invoices":
        const invoices = await prisma.invoice.findMany({
          include: {
            organization: { select: { name: true } },
            project: { select: { name: true } },
          },
          orderBy: { createdAt: "desc" },
        });

        csvContent = "ID,Number,Title,Organization,Project,Amount,Tax,Total,Status,Due Date,Sent At,Paid At,Created At\n";
        invoices.forEach((invoice) => {
          csvContent += `"${invoice.id}","${invoice.number}","${invoice.title}","${invoice.organization.name}","${invoice.project?.name || "N/A"}","${invoice.amount}","${invoice.tax}","${invoice.total}","${invoice.status}","${invoice.dueDate.toISOString()}","${invoice.sentAt?.toISOString() || ""}","${invoice.paidAt?.toISOString() || ""}","${invoice.createdAt.toISOString()}"\n`;
        });

        filename = `invoices-export-${new Date().toISOString().split("T")[0]}.csv`;
        break;

      case "users":
        const users = await prisma.user.findMany({
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            _count: {
              select: { assignedProjects: true },
            },
          },
          orderBy: { createdAt: "desc" },
        });

        csvContent = "ID,Name,Email,Role,Projects,Created At\n";
        users.forEach((user) => {
          csvContent += `"${user.id}","${user.name || ""}","${user.email}","${user.role}","${user._count.assignedProjects}","${user.createdAt.toISOString()}"\n`;
        });

        filename = `users-export-${new Date().toISOString().split("T")[0]}.csv`;
        break;

      default:
        return NextResponse.json(
          { error: "Invalid export type. Must be: leads, projects, invoices, or users" },
          { status: 400 }
        );
    }

    // Return CSV file
    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error exporting data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
