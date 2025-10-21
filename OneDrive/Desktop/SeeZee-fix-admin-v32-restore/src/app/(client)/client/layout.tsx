import "@/styles/admin.css";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ClientSidebar from "./components/ClientSidebar";
import { Toaster } from "@/components/ui/toaster";

export default async function ClientDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Allow CLIENT, ORG_MEMBER, ADMIN, CEO to view client dashboard
  if (!session?.user) {
    redirect("/login?returnUrl=/client");
  }

  return (
    <div className="with-sidebar fixed inset-0 flex flex-col">
      <div className="flex flex-1 overflow-hidden" style={{ marginTop: 'var(--h-nav)' }}>
        {/* Sidebar pinned below navbar */}
        <aside className="sidebar-layer hidden md:block fixed left-0" style={{ top: 'var(--h-nav)' }}>
          <ClientSidebar user={session.user} />
        </aside>

        {/* Content shifted by sidebar width and pushed below navbar */}
        <main className="admin-main flex-1 overflow-y-auto">
          <div className="main-inner px-6 py-8">
            {children}
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  );
}
