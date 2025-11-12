/**
 * Learning Hub Layout - Server Component with AdminAppShell
 */

import { AdminAppShell } from "@/components/admin/AdminAppShell";
import { getCurrentUser } from "@/lib/auth/requireRole";
import LearningTabs from "./LearningTabs";

export default async function LearningLayout({
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
        <div className="admin-page-header">
          <h1 className="admin-page-title">Learning Hub</h1>
          <p className="admin-page-subtitle">
            Training modules, tools, and resources for team growth
          </p>
        </div>

        <LearningTabs />

        {children}
      </div>
    </AdminAppShell>
  );
}
