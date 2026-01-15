/**
 * Business Expenses Page
 * Comprehensive expense tracking and analytics
 */

import { Suspense } from "react";
import { ExpenseManager } from "@/components/admin/finance/ExpenseManager";
import { requireAdmin } from "@/lib/authz";

export const dynamic = "force-dynamic";

export default async function ExpensesPage() {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="max-w-7xl mx-auto p-6 lg:p-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <a href="/admin" className="hover:text-white transition-colors">Admin</a>
          <span>/</span>
          <a href="/admin/finance" className="hover:text-white transition-colors">Finance</a>
          <span>/</span>
          <span className="text-white">Expenses</span>
        </div>

        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
            </div>
          }
        >
          <ExpenseManager />
        </Suspense>
      </div>
    </div>
  );
}
