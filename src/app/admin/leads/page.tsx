/**
 * Simplified Leads & Marketing Dashboard
 * Cleaner navigation with focus on quick actions
 */

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/requireRole";
import { ROLE } from "@/lib/role";
import Link from "next/link";
import {
  Users,
  Mail,
  TrendingUp,
  Database,
  Target,
  Search,
  Zap,
  BarChart3,
  CheckSquare,
  FolderOpen,
  ArrowRight,
} from "lucide-react";
import { getMarketingAnalyticsAction } from "@/server/actions/outreach";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Only CEO, CFO, or OUTREACH roles can access this page
  const allowedRoles = [ROLE.CEO, ROLE.CFO, ROLE.OUTREACH];
  if (!allowedRoles.includes(user.role as any)) {
    redirect("/admin");
  }

  const analytics = await getMarketingAnalyticsAction();

  return (
    <div className="min-h-screen p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white flex items-center gap-3">
            <Target className="w-10 h-10 text-cyan-400" />
            Leads & Marketing
          </h1>
          <p className="text-slate-400 mt-2 text-lg">
            Manage prospects, run campaigns, and track performance
          </p>
        </div>
        <Link
          href="/admin/marketing/analytics"
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-colors"
        >
          <BarChart3 className="w-4 h-4" />
          <span>Full Analytics</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Key Metrics - Compact */}
      {analytics.success && analytics.metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            label="Prospects"
            value={analytics.metrics.totalProspects.toLocaleString()}
            icon={Users}
            color="cyan"
          />
          <MetricCard
            label="Converted"
            value={`${analytics.metrics.conversionRate.toFixed(1)}%`}
            icon={TrendingUp}
            color="green"
          />
          <MetricCard
            label="Open Rate"
            value={`${analytics.metrics.openRate.toFixed(1)}%`}
            icon={Mail}
            color="blue"
          />
          <MetricCard
            label="Reply Rate"
            value={`${analytics.metrics.replyRate.toFixed(1)}%`}
            icon={Mail}
            color="purple"
          />
        </div>
      )}

      {/* Main Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Discover Prospects */}
        <ActionCard
          title="Discover Prospects"
          description="Import 200+ businesses from Google Places, Apollo.io, and more"
          icon={Database}
          iconColor="cyan"
          href="/admin/marketing/discover"
          badge="Import Data"
        />

        {/* Manage Prospects */}
        <ActionCard
          title="Manage Prospects"
          description="Filter, bulk operations, and advanced prospect management"
          icon={Users}
          iconColor="purple"
          href="/admin/marketing/prospects"
          badge="View All"
        />

        {/* Email Campaigns */}
        <ActionCard
          title="Email Campaigns"
          description="AI-powered personalized emails with tracking"
          icon={Mail}
          iconColor="green"
          href="/admin/marketing/campaigns"
          badge="Create"
        />

        {/* Find Clients */}
        <ActionCard
          title="Client Finder"
          description="Advanced search and filtering for potential clients"
          icon={Search}
          iconColor="blue"
          href="/admin/leads/finder"
          badge="Search"
        />

        {/* Email Management */}
        <ActionCard
          title="Email Management"
          description="Manage email templates and campaign emails"
          icon={Mail}
          iconColor="amber"
          href="/admin/leads/emails"
          badge="Templates"
        />

        {/* Related Tasks */}
        <ActionCard
          title="Related Tasks"
          description="View and manage tasks linked to leads and prospects"
          icon={CheckSquare}
          iconColor="red"
          href="/admin/todos"
          badge="View Tasks"
        />
      </div>

      {/* Quick Links Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Client Integration */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-cyan-400" />
            Client Portal Integration
          </h3>
          <div className="space-y-3">
            <Link
              href="/start"
              className="block p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">Client Dashboard</span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </div>
              <p className="text-sm text-gray-400 mt-1">View client-facing dashboard</p>
            </Link>
            <Link
              href="/admin/projects"
              className="block p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">Projects</span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </div>
              <p className="text-sm text-gray-400 mt-1">Manage client projects</p>
            </Link>
            <Link
              href="/admin/archive"
              className="block p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">Archive</span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </div>
              <p className="text-sm text-gray-400 mt-1">View archived items</p>
            </Link>
          </div>
        </div>

        {/* System Capabilities */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            System Features
          </h3>
          <div className="grid grid-cols-1 gap-2">
            <FeatureItem icon="🔍" text="Mass prospect discovery (200+ at once)" />
            <FeatureItem icon="⚡" text="Bulk operations with safety checks" />
            <FeatureItem icon="🤖" text="AI email generation with Claude" />
            <FeatureItem icon="📊" text="Real-time email tracking" />
            <FeatureItem icon="🎯" text="Advanced filtering & scoring" />
            <FeatureItem icon="📁" text="Archive system for old items" />
          </div>
        </div>
      </div>

      {/* Quick Start Guide - Collapsible */}
      <details className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl p-6">
        <summary className="text-xl font-semibold text-amber-400 mb-3 cursor-pointer">
          🚀 Quick Start Guide
        </summary>
        <div className="space-y-3 text-slate-300 mt-4">
          <Step number={1} title="Discover Prospects" description="Import 200+ businesses from Google Places" />
          <Step number={2} title="Filter & Select" description="Filter by lead score, location, and website quality" />
          <Step number={3} title="Send AI Emails" description="Select prospects and generate personalized outreach" />
          <Step number={4} title="Track Results" description="Monitor opens, clicks, and replies in real-time" />
        </div>
      </details>
    </div>
  );
}

// Simplified Helper Components
function MetricCard({
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
  const colorClasses = {
    cyan: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-400',
    green: 'from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-400',
    blue: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-400',
    purple: 'from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-400',
  };

  return (
    <div className={`p-4 bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} border rounded-xl`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-5 h-5" />
        <div className="text-slate-400 text-sm">{label}</div>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
    </div>
  );
}

function ActionCard({
  title,
  description,
  icon: Icon,
  iconColor,
  href,
  badge,
}: {
  title: string;
  description: string;
  icon: any;
  iconColor: string;
  href: string;
  badge: string;
}) {
  const iconColors = {
    cyan: 'text-cyan-400',
    green: 'text-green-400',
    blue: 'text-blue-400',
    purple: 'text-purple-400',
    amber: 'text-amber-400',
    red: 'text-red-400',
  };

  return (
    <Link
      href={href}
      className="group relative p-6 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <Icon className={`w-8 h-8 ${iconColors[iconColor as keyof typeof iconColors]} group-hover:scale-110 transition-transform`} />
        <span className="px-2 py-1 text-xs font-medium bg-white/10 text-white rounded">
          {badge}
        </span>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400">{description}</p>
      <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
        <ArrowRight className="w-5 h-5 text-white" />
      </div>
    </Link>
  );
}

function FeatureItem({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-300">
      <span className="text-lg">{icon}</span>
      <span>{text}</span>
    </div>
  );
}

function Step({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex-shrink-0 w-6 h-6 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-400 text-sm font-bold">
        {number}
      </span>
      <div>
        <strong className="text-white">{title}</strong>
        <p className="text-sm text-slate-400">{description}</p>
      </div>
    </div>
  );
}
