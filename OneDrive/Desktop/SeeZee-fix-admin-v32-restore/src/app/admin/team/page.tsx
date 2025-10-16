import { listTeam } from '@/server/actions/team';
import { TeamClient } from '@/components/admin/TeamClient';

export const dynamic = 'force-dynamic';

export default async function TeamPage() {
  const result = await listTeam();
  const users = result.success ? result.users : [];
  return <TeamClient users={users} />;
}
