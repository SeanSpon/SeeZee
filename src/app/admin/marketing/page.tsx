import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/requireRole";
import { ROLE } from "@/lib/role";
import Link from "next/link";
import { 
  Send, 
  FileText, 
  MessageSquare, 
  Users, 
  Database,
  TrendingUp,
  Search,
  Zap,
  Target,
  BarChart3
} from "lucide-react";
import { getMarketingAnalyticsAction } from "@/server/actions/outreach";

export const dynamic = "force-dynamic";

export default async function MarketingPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const allowedRoles = [ROLE.CEO, ROLE.CFO, ROLE.OUTREACH];
  if (!allowedRoles.includes(user.role as any)) {
    redirect("/admin");
  }

  // Get comprehensive analytics
  const analytics = await getMarketingAnalyticsAction();

  // Handle error case
  if (!analytics.success || !analytics.metrics) {
    return (
      <div className="p-6">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
          <p className="text-red-400">Error loading analytics. Please try again.</p>
        </div>
      </div>
    );
  }

  // Extract metrics with defaults
  const metrics = {
    totalProspects: analytics.metrics?.totalProspects || 0,
    totalEmailsSent: analytics.metrics?.totalEmailsSent || 0,
    openRate: analytics.metrics?.openRate || 0,
    clickRate: analytics.metrics?.clickRate || 0,
    emailsOpened: analytics.metrics?.emailsOpened || 0,
    emailsClicked: analytics.metrics?.emailsClicked || 0,
  };
  
  // Convert prospect status array to object
  const statusCounts = {
    NEW: 0,
    CONTACTED: 0,
    RESPONDED: 0,
    QUALIFIED: 0,
    CONVERTED: 0,
    LOST: 0,
  };
  
  if (analytics.prospectsByStatus) {
    analytics.prospectsByStatus.forEach((item: any) => {
      statusCounts[item.status as keyof typeof statusCounts] = item._count;
    });
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <MessageSquare className="w-8 h-8 text-cyan-400" />
          Marketing Command Center
        </h1>
        <p className="text-slate-400 mt-1">
          Mass outreach, AI emails, and powerful tracking
        </p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Prospects"
          value={metrics.totalProspects.toLocaleString()}
          icon={Database}
          color="blue"
        />
        <StatCard
          label="Emails Sent"
          value={metrics.totalEmailsSent.toLocaleString()}
          icon={Send}
          color="green"
        />
        <StatCard
          label="Open Rate"
          value={`${Math.round(metrics.openRate)}%`}
          icon={TrendingUp}
          color="amber"
        />
        <StatCard
          label="Click Rate"
          value={`${Math.round(metrics.clickRate)}%`}
          icon={Target}
          color="purple"
        />
      </div>

      {/* Main Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/admin/marketing/discover"
          className="p-6 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl hover:border-cyan-500/50 transition-all group"
        >
          <Search className="w-10 h-10 text-cyan-400 mb-4" />
          <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors mb-2">
            Discover Prospects
          </h3>
          <p className="text-slate-400 text-sm">
            Import 200+ businesses at once from Google Places, Apollo, and Hunter
          </p>
          <div className="mt-4 text-cyan-400 text-sm font-medium">
            Mass Import →
          </div>
        </Link>

        <Link
          href="/admin/marketing/prospects"
          className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl hover:border-green-500/50 transition-all group"
        >
          <Users className="w-10 h-10 text-green-400 mb-4" />
          <h3 className="text-xl font-bold text-white group-hover:text-green-400 transition-colors mb-2">
            Manage Prospects
          </h3>
          <p className="text-slate-400 text-sm">
            Filter, tag, bulk delete, and send AI-powered emails to hundreds
          </p>
          <div className="mt-4 text-green-400 text-sm font-medium">
            View Database →
          </div>
        </Link>

        <Link
          href="/admin/marketing/outreach"
          className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl hover:border-purple-500/50 transition-all group"
        >
          <BarChart3 className="w-10 h-10 text-purple-400 mb-4" />
          <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors mb-2">
            Analytics Dashboard
          </h3>
          <p className="text-slate-400 text-sm">
            Track opens, clicks, replies, and campaign ROI in real-time
          </p>
          <div className="mt-4 text-purple-400 text-sm font-medium">
            View Analytics →
          </div>
        </Link>
      </div>

      {/* System Status */}
      <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          System Capabilities
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FeatureCard
            label="Mass Discovery"
            value="200+ per search"
            description="Google Places API"
          />
          <FeatureCard
            label="Smart Filtering"
            value="Auto-qualify"
            description="Based on criteria"
          />
          <FeatureCard
            label="Personalization"
            value="AI-powered"
            description="Custom messages"
          />
          <FeatureCard
            label="Multi-channel"
            value="Email + Phone"
            description="Omni-channel reach"
          />
        </div>
      </div>

      {/* Campaign Status Overview */}
      <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-green-400" />
          Campaign Progress
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatusBar
            label="New"
            count={statusCounts.NEW}
            color="blue"
          />
          <StatusBar
            label="Contacted"
            count={statusCounts.CONTACTED}
              color="cyan"
            />
            <StatusBar
              label="Responded"
              count={statusCounts.RESPONDED}
              color="green"
            />
            <StatusBar
              label="Qualified"
              count={statusCounts.QUALIFIED}
              color="emerald"
            />
          </div>
        </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Prospect Breakdown */}
        <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Prospect Status</h2>
          <div className="space-y-3">
            <StatusBar
              label="New"
              count={statusCounts.NEW}
              color="blue"
            />
            <StatusBar
              label="Contacted"
              count={statusCounts.CONTACTED}
              color="cyan"
            />
            <StatusBar
              label="Responded"
              count={statusCounts.RESPONDED}
              color="green"
            />
            <StatusBar
              label="Qualified"
              count={statusCounts.QUALIFIED}
              color="purple"
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <QuickAction
              href="/admin/marketing/discover"
              icon={Search}
              label="Import New Prospects"
              color="cyan"
            />
            <QuickAction
              href="/admin/marketing/prospects?filter=new"
              icon={Users}
              label="View New Prospects"
              color="blue"
            />
            <QuickAction
              href="/admin/marketing/prospects?action=bulk-email"
              icon={Send}
              label="Send Bulk Emails"
              color="green"
            />
            <QuickAction
              href="/admin/marketing/outreach"
              icon={BarChart3}
              label="View Analytics"
              color="purple"
            />
          </div>
        </div>
      </div>

      {/* Additional Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/admin/marketing/templates"
          className="p-4 bg-slate-900/50 border border-white/10 rounded-xl hover:border-purple-500/30 transition-colors group"
        >
          <FileText className="w-6 h-6 text-purple-400 mb-2" />
          <h3 className="font-semibold text-white group-hover:text-purple-400 transition-colors">
            Email Templates
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Manage reusable email templates
          </p>
        </Link>
        <Link
          href="/admin/marketing/campaigns"
          className="p-4 bg-slate-900/50 border border-white/10 rounded-xl hover:border-cyan-500/30 transition-colors group"
        >
          <Send className="w-6 h-6 text-cyan-400 mb-2" />
          <h3 className="font-semibold text-white group-hover:text-cyan-400 transition-colors">
            Campaigns
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            View all email campaigns
          </p>
        </Link>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  icon: any;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: "from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-400",
    green: "from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-400",
    amber: "from-amber-500/20 to-yellow-500/20 border-amber-500/30 text-amber-400",
    purple: "from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-400",
  };

  return (
    <div className={`p-4 rounded-xl bg-gradient-to-br border ${colorClasses[color]}`}>
      <div className="flex items-center gap-3">
        <Icon className="w-6 h-6" />
        <div>
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-sm opacity-80">{label}</p>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="p-4 bg-slate-800/50 rounded-lg border border-white/5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="text-xl font-bold text-white mt-1">{value}</p>
      <p className="text-xs text-slate-500 mt-1">{description}</p>
    </div>
  );
}

function StatusBar({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-500",
    cyan: "bg-cyan-500",
    green: "bg-green-500",
    purple: "bg-purple-500",
  };

  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-slate-300">{label}</span>
        <span className="text-white font-medium">{count}</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClasses[color]}`}
          style={{ width: count > 0 ? "100%" : "0%" }}
        />
      </div>
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  label,
  color,
}: {
  href: string;
  icon: any;
  label: string;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    cyan: "text-cyan-400 group-hover:text-cyan-300",
    blue: "text-blue-400 group-hover:text-blue-300",
    green: "text-green-400 group-hover:text-green-300",
    purple: "text-purple-400 group-hover:text-purple-300",
  };

  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors group"
    >
      <Icon className={`w-5 h-5 ${colorClasses[color]}`} />
      <span className="text-slate-300 group-hover:text-white transition-colors">
        {label}
      </span>
    </Link>
  );
}