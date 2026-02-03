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

    // For now, return a comprehensive CSV with all key data
    // In the future, this could be enhanced to create a ZIP file with multiple CSVs
    
    const now = new Date();
    
    // Fetch all critical data
    const [
      organizations,
      projects,
      tasks,
      invoices,
      payments,
      expenses,
      users,
    ] = await Promise.all([
      db.organization.findMany({ include: { members: true } }),
      db.project.findMany({ include: { clientTasks: true, milestones: true } }),
      db.clientTask.findMany(),
      db.invoice.findMany({ include: { items: true, payments: true } }),
      db.payment.findMany(),
      db.businessExpense.findMany(),
      db.user.findMany({ select: { id: true, name: true, email: true, role: true, createdAt: true } }),
    ]);

    // Create a comprehensive backup report
    const backupData = [
      ["FULL DATABASE BACKUP", ""],
      ["Generated", now.toISOString()],
      ["", ""],
      ["SUMMARY", ""],
      ["Organizations", organizations.length],
      ["Projects", projects.length],
      ["Tasks", tasks.length],
      ["Invoices", invoices.length],
      ["Payments", payments.length],
      ["Expenses", expenses.length],
      ["Users", users.length],
      ["", ""],
      ["", ""],
      ["NOTE: This is a summary backup.", ""],
      ["For complete data export, download individual reports.", ""],
      ["", ""],
      ["", ""],
      ["ORGANIZATIONS", ""],
      ["ID", "Name", "Email", "Phone", "Created Date", "Member Count"],
    ];

    organizations.forEach(org => {
      backupData.push([
        org.id,
        org.name,
        org.email || "",
        org.phone || "",
        org.createdAt.toISOString(),
        org.members.length.toString(),
      ]);
    });

    backupData.push(["", ""], ["", ""], ["PROJECTS", ""]);
    backupData.push(["ID", "Name", "Status", "Budget", "Created Date", "Task Count"]);

    projects.forEach(proj => {
      backupData.push([
        proj.id,
        proj.name,
        proj.status,
        proj.budget ? Number(proj.budget).toFixed(2) : "",
        proj.createdAt.toISOString(),
        proj.clientTasks.length.toString(),
      ]);
    });

    backupData.push(["", ""], ["", ""], ["INVOICES", ""]);
    backupData.push(["ID", "Number", "Total", "Status", "Created Date", "Payment Count"]);

    invoices.forEach(inv => {
      backupData.push([
        inv.id,
        inv.number || "",
        Number(inv.total).toFixed(2),
        inv.status,
        inv.createdAt.toISOString(),
        inv.payments.length.toString(),
      ]);
    });

    backupData.push(["", ""], ["", ""], ["PAYMENTS", ""]);
    backupData.push(["ID", "Amount", "Method", "Status", "Created Date"]);

    payments.forEach(payment => {
      backupData.push([
        payment.id,
        Number(payment.amount).toFixed(2),
        payment.method || "",
        payment.status,
        payment.createdAt.toISOString(),
      ]);
    });

    backupData.push(["", ""], ["", ""], ["EXPENSES", ""]);
    backupData.push(["ID", "Category", "Amount", "Date", "Description"]);

    expenses.forEach(exp => {
      backupData.push([
        exp.id,
        exp.category || "",
        Number(exp.amount).toFixed(2),
        exp.expenseDate.toISOString().split('T')[0],
        (exp.description || "").replace(/"/g, '""'),
      ]);
    });

    // Convert to CSV
    const csv = backupData
      .map(row => 
        row.map(cell => {
          const value = String(cell);
          if (value.includes(",") || value.includes('"') || value.includes("\n")) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(",")
      )
      .join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="full_backup_${now.toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error generating full backup:", error);
    return NextResponse.json(
      { error: "Failed to generate backup" },
      { status: 500 }
    );
  }
}
