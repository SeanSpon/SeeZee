import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { getCurrentUser } from "@/lib/auth/requireRole";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all organizations (clients)
    const clients = await db.organization.findMany({
      include: {
        members: {
          include: {
            user: { select: { name: true, email: true, phone: true } },
          },
        },
        projects: { select: { id: true, status: true } },
        invoices: { select: { id: true, total: true, status: true } },
        _count: {
          select: {
            projects: true,
            invoices: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Convert to CSV
    const headers = [
      "Client ID",
      "Client Name",
      "Email",
      "Phone",
      "Website",
      "Industry",
      "Company Size",
      "Total Projects",
      "Active Projects",
      "Total Invoices",
      "Total Billed",
      "Stripe Customer ID",
      "Primary Contact Name",
      "Primary Contact Email",
      "Primary Contact Phone",
      "Created Date",
      "Address",
    ];

    const rows = clients.map(client => {
      const activeProjects = client.projects.filter(p => p.status === "ACTIVE").length;
      const totalBilled = client.invoices
        .filter(inv => inv.status === "PAID")
        .reduce((sum, inv) => sum + Number(inv.total), 0);
      
      const primaryContact = client.members.find(m => m.role === "OWNER")?.user || client.members[0]?.user;

      return [
        client.id,
        client.name,
        client.email || "",
        client.phone || "",
        client.website || "",
        client.industry || "",
        client.companySize || "",
        client._count.projects,
        activeProjects,
        client._count.invoices,
        totalBilled.toFixed(2),
        client.stripeCustomerId || "",
        primaryContact?.name || "",
        primaryContact?.email || "",
        primaryContact?.phone || "",
        client.createdAt.toISOString().split('T')[0],
        client.address || "",
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

    const now = new Date();
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="clients_${now.toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error generating clients report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
