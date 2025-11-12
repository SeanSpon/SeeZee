import "@/styles/admin.css";
import { redirect } from "next/navigation";
import ClientShell from "@/components/client/ClientShell";
import { Toaster } from "@/components/ui/toaster";
import { getCurrentUser } from "@/lib/auth/requireRole";
import { ROLE } from "@/lib/role";

export default async function ClientDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Use getCurrentUser to get properly mapped role
  const user = await getCurrentUser();

  // Not authenticated - redirect to login
  if (!user) {
    redirect("/login?returnUrl=/client");
  }

  // CEO email always has access to client dashboard
  const CEO_EMAIL = "seanspm1007@gmail.com";
  if (user.email === CEO_EMAIL || user.email === "seanpm1007@gmail.com") {
    // CEO can access client dashboard
    return (
      <div className="min-h-screen" style={{ paddingTop: 'var(--h-nav)' }}>
        <ClientShell>{children}</ClientShell>
        <Toaster />
      </div>
    );
  }

  // Check if user has appropriate role to access client dashboard
  // Allow CLIENT, CEO, CFO, FRONTEND, BACKEND, OUTREACH to view client dashboard
  const allowedRoles = [
    ROLE.CLIENT,
    ROLE.CEO,
    ROLE.CFO,
    ROLE.FRONTEND,
    ROLE.BACKEND,
    ROLE.OUTREACH,
  ];

  if (!allowedRoles.includes(user.role)) {
    // Wrong role - redirect to appropriate dashboard based on user's role
    if (user.role === "CEO" || user.role === "CFO" || 
        user.role === "FRONTEND" || user.role === "BACKEND" || user.role === "OUTREACH") {
      redirect("/admin");
    } else {
      // Unknown role - redirect to login
      redirect("/login");
    }
  }

  return (
    <div className="min-h-screen" style={{ paddingTop: 'var(--h-nav)' }}>
      <ClientShell>{children}</ClientShell>
      <Toaster />
    </div>
  );
}
