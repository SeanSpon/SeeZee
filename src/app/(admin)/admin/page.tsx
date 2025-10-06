import { getSession } from "../../../server/auth/session";
import { AdminDashboard } from "../../../components/admin/admin-dashboard";

export default async function AdminPage() {
  const session = await getSession();

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-300">Please sign in to access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  return <AdminDashboard />;
}