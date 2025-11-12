/**
 * Pipeline Layout - Server Component with AdminAppShell
 */

import { AdminAppShell } from "@/components/admin/AdminAppShell";
import { getCurrentUser } from "@/lib/auth/requireRole";
import PipelineTabs from "./PipelineTabs";

export default async function PipelineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  
  if (!user) {
    return null;
  }

  return (
    <AdminAppShell user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="admin-page-header">
          <h1 className="admin-page-title">Pipeline</h1>
          <p className="admin-page-subtitle">
            Manage leads, projects, and invoices
          </p>
        </div>

        <PipelineTabs />

        {/* Content */}
        {children}
      </div>
    </AdminAppShell>
  );
}
