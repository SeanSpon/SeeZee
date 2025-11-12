import { listTeam } from '@/server/actions/team';
import { TeamClient } from '@/components/admin/TeamClient';
import { AdminAppShell } from "@/components/admin/AdminAppShell";
import { getCurrentUser } from "@/lib/auth/requireRole";

export const dynamic = 'force-dynamic';

export default async function TeamPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    return null;
  }

  const result = await listTeam();
  const users = result.success ? result.users : [];
  
  return (
    <AdminAppShell user={user}>
      <TeamClient users={users} />
    </AdminAppShell>
  );
}
