import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminSidebar from "./components/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  // Redirect if not authenticated
  if (!session?.user) {
    redirect("/login?returnUrl=/admin");
  }

  // Check if user has admin privileges (CEO or ADMIN role)
  if (session.user.role !== "CEO" && session.user.role !== "ADMIN") {
    // Not an admin - redirect to client dashboard
    console.log(`❌ Access denied for role: ${session.user.role}`);
    redirect("/client");
  }

  console.log(`✅ Admin access granted for ${session.user.email} (role: ${session.user.role})`);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-20">
      <div className="flex">
        <AdminSidebar />
        
        <main className="flex-1 p-8 ml-64">
          {children}
        </main>
      </div>
    </div>
  );
}