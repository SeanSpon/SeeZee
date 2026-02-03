/**
 * Admin Reports & Data Export Page
 * Download CSV exports of all business data
 */

import { db } from "@/server/db";
import { ReportsClient } from "@/components/admin/ReportsClient";
import { getCurrentUser } from "@/lib/auth/requireRole";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  try {
    const user = await getCurrentUser();
    if (!user) redirect('/login');

    // Fetch summary data for the reports page
    const [
      invoicesCount,
      paymentsCount,
      projectsCount,
      clientsCount,
      tasksCount,
      expensesCount,
    ] = await Promise.all([
      db.invoice.count(),
      db.payment.count(),
      db.project.count(),
      db.organization.count(),
      db.clientTask.count(),
      db.businessExpense.count(),
    ]);

    return (
      <ReportsClient
        stats={{
          invoices: invoicesCount,
          payments: paymentsCount,
          projects: projectsCount,
          clients: clientsCount,
          tasks: tasksCount,
          expenses: expensesCount,
        }}
      />
    );
  } catch (error) {
    console.error("Reports Page Error:", error);
    
    return (
      <div className="p-6">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
          <h1 className="text-2xl font-bold text-red-500 mb-2">Error Loading Reports</h1>
          <p className="text-white mb-4">There was an error loading the reports page.</p>
          <details className="text-sm">
            <summary className="cursor-pointer text-gray-400 hover:text-white">Error Details</summary>
            <pre className="mt-2 p-4 bg-black/30 rounded text-xs overflow-auto">
              {error instanceof Error ? error.message : String(error)}
            </pre>
          </details>
        </div>
      </div>
    );
  }
}
