import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Link from "next/link";
import WelcomeScreen from "@/components/client/dashboard/WelcomeScreen";
import ActionPanel from "@/components/client/dashboard/ActionPanel";
import ActivityFeed from "@/components/client/dashboard/ActivityFeed";
import StatusBadge from "@/components/ui/StatusBadge";
import { getComprehensiveDashboardData } from "@/lib/dashboard-helpers";
import { getHoursBalanceAction } from "./actions/hours";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
import {
  FiArrowRight,
  FiFolder,
  FiFileText,
  FiMessageSquare,
  FiCheckCircle,
  FiPlus,
} from "react-icons/fi";
import ComprehensiveDashboardClient from "./components/ComprehensiveDashboardClient";
import DashboardClient from "./components/DashboardClient";
import LeadTracker from "@/components/client/LeadTracker";

export default async function ClientDashboard() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login?returnUrl=/client");
  }
  
  const { id: userId, email } = session.user;
  
  if (!userId || !email) {
    return (
      <div className="rounded-xl border border-red-700 bg-red-900/30 p-6 text-center">
        <p className="text-red-300">Invalid session. Please log in again.</p>
      </div>
    );
  }

  // CRITICAL: First check if user has projects or project requests
  // Users must create a project before accessing the client dashboard
  const { prisma } = await import('@/lib/prisma');
  const { getClientAccessContext } = await import('@/lib/client-access');
  
  const identity = {
    userId: userId,
    email: email,
  };
  const access = await getClientAccessContext(identity);
  
  // Quick check for projects or project requests
  const hasProjects = await prisma.project.findFirst({
    where: {
      OR: [
        { organizationId: { in: access.organizationIds } },
        { id: { in: access.leadProjectIds } },
      ],
    },
    select: { id: true },
  });
  
  const hasProjectRequests = await prisma.projectRequest.findFirst({
    where: {
      contactEmail: email,
      status: {
        in: ['DRAFT', 'SUBMITTED', 'REVIEWING', 'NEEDS_INFO', 'APPROVED'],
      },
    },
    select: { id: true },
  });

  // Check for leads by user email (contact form submissions)
  const userLeads = await prisma.lead.findMany({
    where: { email: email.toLowerCase(), status: { not: 'LOST' } },
    select: { id: true, name: true, status: true, createdAt: true, message: true, source: true },
    orderBy: { createdAt: 'desc' },
  });

  // CRITICAL: If no projects, no project requests, AND no leads → redirect to getting-started
  // This must happen BEFORE any subscription checks to prevent redirect loops
  if (!hasProjects && !hasProjectRequests && userLeads.length === 0) {
    redirect("/client/getting-started");
  }

  // If has leads but no projects or active requests → show lead tracker
  if (!hasProjects && !hasProjectRequests && userLeads.length > 0) {
    return <LeadTracker leads={userLeads} userName={session.user.name} />;
  }
  
  // Only check subscriptions if user has projects or project requests
  // No paywall - clients can access dashboard to purchase maintenance plans
  // Maintenance plans are optional add-ons that clients can subscribe to for ongoing support

  // Fetch comprehensive dashboard data with error handling
  let data;
  try {
    data = await getComprehensiveDashboardData(userId, email);
  } catch (error) {
    console.error("Error loading dashboard data:", error);
    return (
      <div className="rounded-xl border border-red-700 bg-red-900/30 p-6 text-center">
        <p className="text-red-300 mb-2">Error loading dashboard</p>
        <p className="text-sm text-red-400">
          {error instanceof Error ? error.message : "Unknown error occurred"}
        </p>
        <Link 
          href="/client" 
          className="mt-4 inline-block text-blue-400 hover:text-blue-300"
        >
          Try Again
        </Link>
      </div>
    );
  }
  
  // Check if user has no projects and no project requests (fallback check using dashboard data)
  const hasNoProjects = !data || data.projects.length === 0;
  const hasActiveProjectRequests = data && (data.stats.activeRequests > 0 || (data.recentRequests && data.recentRequests.length > 0));
  
  // If no projects and no project requests, redirect to getting-started page
  if (hasNoProjects && !hasActiveProjectRequests) {
    redirect("/client/getting-started");
  }
  
  // If no projects but has project requests, use DashboardClient which handles pre-client state
  if (hasNoProjects && hasActiveProjectRequests) {
    return <DashboardClient />;
  }
  
  // User has projects, show the comprehensive dashboard
  const activeProjects = data.projects.filter((p) => {
    const status = String(p.status || '').toUpperCase();
    return ['ACTIVE', 'IN_PROGRESS', 'DESIGN', 'BUILD', 'REVIEW', 'PLANNING', 'LAUNCH'].includes(status);
  });
  
  // Fetch hours balance if user has a maintenance plan
  // Always fetch fresh data (no caching) to ensure hours are up-to-date
  const hoursBalance = await getHoursBalanceAction();
  
  return (
    <ComprehensiveDashboardClient 
      data={data}
      userName={session.user.name || undefined}
      hoursBalance={hoursBalance}
    />
  );
}
