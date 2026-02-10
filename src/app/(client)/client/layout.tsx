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

  // CEO email whitelist allows specific emails to access client dashboard
  // This is useful for CEOs to view the client perspective for testing/monitoring
  // Note: CEO role users (without whitelisted email) will be redirected to admin dashboard
  const CEO_EMAILS = ["seanspm1007@gmail.com", "seanpm1007@gmail.com", "sean.mcculloch23@gmail.com"];
  const isCEOEmail = user.email && CEO_EMAILS.includes(user.email.toLowerCase());

  // Check access permissions
  // Allow: CLIENT role OR CEO email (whitelist)
  // Redirect: Staff roles → /admin, Unknown roles → /login
  if (!isCEOEmail && user.role !== ROLE.CLIENT) {
    // Non-CLIENT users should be redirected based on their role
    if (isStaffRole(user.role)) {
      redirect("/admin");
    }
    // Unknown or invalid role
    redirect("/login");
  }

  // Allow access: CLIENT role or CEO email
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
