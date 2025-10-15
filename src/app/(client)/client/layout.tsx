import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ClientSidebar from "./components/ClientSidebar";

export default async function ClientDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Redirect if not authenticated
  if (!session?.user) {
    redirect("/login?returnUrl=/client");
  }

  // Redirect STAFF/ADMIN/CEO users to admin dashboard
  const isStaffRole = ["CEO", "ADMIN", "DESIGNER", "DEV", "OUTREACH", "INTERN", "STAFF"].includes(session.user.role);
  if (isStaffRole) {
    redirect("/admin/overview");
  }

  return (
    <div className="min-h-screen">
      <div className="flex pt-[var(--nav-h)]">
        {/* Sidebar */}
        <ClientSidebar user={session.user} />

        {/* Main Content */}
        <div className="flex-1 lg:pl-64">
          {/* Top Bar */}
          <div className="sticky top-[var(--nav-h)] z-40 backdrop-blur-xl bg-black/30 border-b border-white/10">
            <div className="px-6 py-4 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Client Portal</h1>
                <p className="text-sm text-slate-400 mt-1">
                  Welcome back, {session.user.name}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <img
                  src={session.user.image || "/default-avatar.png"}
                  alt={session.user.name || "User"}
                  className="w-10 h-10 rounded-full border-2 border-cyan-500/30"
                />
              </div>
            </div>
          </div>

          {/* Page Content */}
          <main className="p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
