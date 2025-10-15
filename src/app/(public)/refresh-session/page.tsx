import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import PageShell from "@/components/PageShell";

export default async function RefreshSessionPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <PageShell>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-white mb-6">
          Session Information
        </h1>

        <div className="space-y-4 mb-8">
          <div className="bg-slate-900/50 border border-white/10 rounded-lg p-4">
            <div className="text-sm text-slate-400 mb-1">Email</div>
            <div className="text-white font-medium">{session.user.email}</div>
          </div>

          <div className="bg-slate-900/50 border border-white/10 rounded-lg p-4">
            <div className="text-sm text-slate-400 mb-1">Role</div>
            <div className="text-white font-medium">{session.user.role}</div>
          </div>

          <div className="bg-slate-900/50 border border-white/10 rounded-lg p-4">
            <div className="text-sm text-slate-400 mb-1">Role</div>
            <div className="text-white font-medium">{session.user.role}</div>
          </div>

          <div className="bg-slate-900/50 border border-white/10 rounded-lg p-4">
            <div className="text-sm text-slate-400 mb-1">User ID</div>
            <div className="text-white font-mono text-sm">{session.user.id}</div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4 text-sm text-blue-200">
            💡 <strong>Tip:</strong> If your role was just changed in the database, sign out and sign back in to refresh your session.
          </div>

          <form action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }} className="w-full">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 px-6 rounded-lg transition-all"
            >
              Sign Out & Refresh Session
            </button>
          </form>

          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/client"
              className="block text-center bg-slate-700/50 hover:bg-slate-700 text-white font-semibold py-3 px-6 rounded-lg transition-all border border-white/10"
            >
              Client Dashboard
            </Link>

            <Link
              href="/admin"
              className="block text-center bg-purple-600/50 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg transition-all border border-purple-500/30"
            >
              Admin Dashboard
            </Link>
          </div>
        </div>
      </div>
      </div>
    </PageShell>
  );
}
