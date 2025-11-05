import "@/styles/admin.css";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ClientShell from "@/components/client/ClientShell";
import { Toaster } from "@/components/ui/toaster";
import { ROLE } from "@/lib/role";

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

  // Check if user has appropriate role to access client dashboard
  // Allow CLIENT, ADMIN, CEO, STAFF, DESIGNER, DEV to view client dashboard
  const userRole = session.user.role;
  const allowedRoles = [
    ROLE.CLIENT,
    ROLE.ADMIN,
    ROLE.CEO,
    ROLE.STAFF,
    ROLE.DESIGNER,
    ROLE.DEV,
  ];

  if (!userRole || !allowedRoles.includes(userRole as any)) {
    redirect("/unauthorized");
  }

  return (
    <div className="min-h-screen" style={{ paddingTop: 'var(--h-nav)' }}>
      <ClientShell>{children}</ClientShell>
      <Toaster />
    </div>
  );
}
