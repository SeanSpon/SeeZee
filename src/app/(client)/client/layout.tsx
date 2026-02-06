import "@/styles/admin.css";
import { redirect } from "next/navigation";
import ClientShell from "@/components/client/ClientShell";
import { ClientErrorBoundary } from "@/components/client/ClientErrorBoundary";
import { Toaster } from "@/components/ui/toaster";
import { ToastContainer } from "@/components/ui/Toast";
import { getCurrentUser } from "@/lib/auth/requireRole";
import { isStaffRole, ROLE } from "@/lib/role";

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
  const CEO_EMAILS = ["seanspm1007@gmail.com", "seanpm1007@gmail.com", "sean.mcculloch23@gmail.com"];
  if (user.email && CEO_EMAILS.includes(user.email.toLowerCase())) {
    // CEO can access client dashboard
    return (
      <ClientErrorBoundary>
        <div className="min-h-screen" style={{ paddingTop: 'var(--h-nav)' }}>
          <ClientShell>{children}</ClientShell>
          <Toaster />
          <ToastContainer />
        </div>
      </ClientErrorBoundary>
    );
  }

  // CLIENT role should stay on client dashboard
  // Staff/admin roles should be redirected to admin dashboard
  if (user.role === ROLE.CLIENT) {
    // Allow CLIENT role to access client dashboard
    return (
      <ClientErrorBoundary>
        <div className="min-h-screen" style={{ paddingTop: 'var(--h-nav)' }}>
          <ClientShell>{children}</ClientShell>
          <Toaster />
          <ToastContainer />
        </div>
      </ClientErrorBoundary>
    );
  } else if (isStaffRole(user.role)) {
    // Staff/admin roles trying to access client dashboard should be redirected to admin
    redirect("/admin");
  } else {
    // Unknown role or no access - redirect to login
    redirect("/login");
  }
}
