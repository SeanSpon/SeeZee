/**
 * Unified Transactions Page
 * All-in-one management for invoices and payments
 */

import { db } from "@/server/db";
import { TransactionsManager } from "@/components/admin/finance/TransactionsManager";
import { getCurrentUser } from "@/lib/auth/requireRole";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  try {
    const user = await getCurrentUser();
    if (!user) redirect('/login');

    // Test each query separately to identify which one is failing
    let invoices, payments, organizations, projects;
    
    try {
      console.log("[Transactions] Fetching invoices...");
      invoices = await db.invoice.findMany({
        include: {
          organization: { select: { id: true, name: true, email: true } },
          project: { select: { id: true, name: true } },
          items: true,
          payments: {
            select: {
              id: true,
              amount: true,
              method: true,
              status: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      console.log(`[Transactions] Found ${invoices.length} invoices`);
    } catch (error) {
      console.error("[Transactions] Invoice query failed:", error);
      throw new Error(`Invoice query failed: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    try {
      console.log("[Transactions] Fetching payments...");
      payments = await db.payment.findMany({
        include: {
          invoice: {
            select: { 
              number: true, 
              title: true,
              organization: { select: { name: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      console.log(`[Transactions] Found ${payments.length} payments`);
    } catch (error) {
      console.error("[Transactions] Payment query failed:", error);
      throw new Error(`Payment query failed: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    try {
      console.log("[Transactions] Fetching organizations...");
      organizations = await db.organization.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          stripeCustomerId: true,
        },
        orderBy: { name: "asc" },
      });
      console.log(`[Transactions] Found ${organizations.length} organizations`);
    } catch (error) {
      console.error("[Transactions] Organization query failed:", error);
      throw new Error(`Organization query failed: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    try {
      console.log("[Transactions] Fetching projects...");
      projects = await db.project.findMany({
        select: {
          id: true,
          name: true,
          organizationId: true,
          status: true,
        },
        where: {
          status: { in: ["ACTIVE", "MAINTENANCE", "COMPLETED"] },
        },
        orderBy: { name: "asc" },
      });
      console.log(`[Transactions] Found ${projects.length} projects`);
    } catch (error) {
      console.error("[Transactions] Project query failed:", error);
      throw new Error(`Project query failed: ${error instanceof Error ? error.message : String(error)}`);
    }

    console.log("[Transactions] All queries completed successfully");

    // Serialize invoices
    const serializedInvoices = invoices.map(inv => {
      // Calculate subtotal from items
      const subtotal = inv.items.reduce((sum, item) => sum + Number(item.amount), 0);
      const total = Number(inv.total);
      const tax = total - subtotal;
      
      return {
        id: inv.id,
        number: inv.number || `INV-${inv.id.slice(0, 6)}`,
        title: inv.title,
        description: inv.description,
        organizationId: inv.organizationId,
        organizationName: inv.organization?.name || "Unknown",
        organizationEmail: inv.organization?.email || null,
        projectId: inv.projectId,
        projectName: inv.project?.name || null,
        amount: subtotal,
        tax: tax,
        total: total,
        status: inv.status,
        issueDate: inv.createdAt.toISOString(),
        dueDate: inv.dueDate?.toISOString() || null,
        paidAt: inv.paidAt?.toISOString() || null,
        createdAt: inv.createdAt.toISOString(),
        payments: inv.payments.map((p: any) => ({
          id: p.id,
          amount: Number(p.amount),
          paymentMethod: p.method,
          status: p.status,
          createdAt: p.createdAt.toISOString(),
        })),
      };
    });

    // Serialize payments (mark manual entries by invoice number pattern)
    const serializedPayments = payments.map(payment => {
      const isManual = payment.invoice?.number?.startsWith("MANUAL-");
      
      return {
        id: payment.id,
        amount: Number(payment.amount),
        paymentMethod: payment.method,
        status: payment.status,
        invoiceId: payment.invoiceId,
        invoiceNumber: isManual ? "Manual Entry" : (payment.invoice?.number || "N/A"),
        invoiceTitle: payment.invoice?.title || "External Transaction",
        clientName: payment.invoice?.organization?.name || "No Client",
        stripePaymentIntentId: payment.stripePaymentId,
        createdAt: payment.createdAt.toISOString(),
      };
    });

    console.log("[Transactions] Rendering component with data");

    return (
      <TransactionsManager
        invoices={serializedInvoices}
        payments={serializedPayments}
        organizations={organizations}
        projects={projects}
      />
    );
  } catch (error) {
    console.error("Transactions Page Error:", error);
    
    // Return a minimal error page to show the error to the user
    return (
      <div className="p-6">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
          <h1 className="text-2xl font-bold text-red-500 mb-2">Error Loading Transactions</h1>
          <p className="text-white mb-4">There was an error loading the transactions page.</p>
          <details className="text-sm">
            <summary className="cursor-pointer text-gray-400 hover:text-white">Error Details</summary>
            <pre className="mt-2 p-4 bg-black/30 rounded text-xs overflow-auto">
              {error instanceof Error ? error.message : String(error)}
              {"\n\n"}
              {error instanceof Error && error.stack ? error.stack : ''}
            </pre>
          </details>
        </div>
      </div>
    );
  }
}
