/**
 * Leads & Marketing Outreach Dashboard
 * Professional marketing and outreach system with mass discovery, AI emails, and analytics
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
  BarChart3,
  Send,
  Eye,
  MousePointer,
  MessageSquare,
  Search,
  Zap,
} from "lucide-react";
import { getMarketingAnalyticsAction } from "@/server/actions/outreach";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Staff roles that can access leads (CEO, CFO, OUTREACH, or legacy ADMIN)
  const allowedRoles: string[] = [ROLE.CEO, ROLE.CFO, ROLE.OUTREACH, "ADMIN"];
  if (!allowedRoles.includes(user.role)) {
    redirect("/admin");
  }

  const analytics = await getMarketingAnalyticsAction();

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white flex items-center gap-3">
            <Target className="w-10 h-10 text-cyan-400" />
            Marketing & Outreach
          </h1>
          <p className="text-slate-400 mt-2 text-lg">
            Professional prospect discovery, AI-powered campaigns, and advanced analytics
          </p>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/admin/marketing/discover"
          className="p-6 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl hover:border-cyan-400/40 transition-all group"
        >
          <Database className="w-8 h-8 text-cyan-400 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="text-xl font-semibold text-white mb-2">Discover Prospects</h3>
          <p className="text-slate-400 text-sm">
            Pull 200+ businesses from Google Places, Apollo.io, and more
          </p>
          <div className="mt-3 flex items-center gap-2 text-cyan-400 font-medium">
            <Zap className="w-4 h-4" />
            Mass Discovery →
          </div>
        </Link>

        <Link
          href="/admin/marketing/prospects"
          className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl hover:border-purple-400/40 transition-all group"
        >
          <Users className="w-8 h-8 text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="text-xl font-semibold text-white mb-2">Manage Prospects</h3>
          <p className="text-slate-400 text-sm">
            Advanced filtering, bulk operations, and prospect management
          </p>
          <div className="mt-3 flex items-center gap-2 text-purple-400 font-medium">
            <Search className="w-4 h-4" />
            View All →
          </div>
        </Link>

        <Link
          href="/admin/marketing/campaigns"
          className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl hover:border-green-400/40 transition-all group"
        >
          <Mail className="w-8 h-8 text-green-400 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="text-xl font-semibold text-white mb-2">Email Campaigns</h3>
          <p className="text-slate-400 text-sm">
            AI-powered personalized emails with tracking and automation
          </p>
          <div className="mt-3 flex items-center gap-2 text-green-400 font-medium">
            <Send className="w-4 h-4" />
            Create Campaign →
          </div>
        </Link>
      </div>

      {/* Analytics Dashboard */}
      {analytics.success && analytics.metrics && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              label="Total Prospects"
              value={analytics.metrics.totalProspects.toLocaleString()}
              icon={Users}
              color="cyan"
              trend="+12%"
            />
            <MetricCard
              label="Conversion Rate"
              value={`${analytics.metrics.conversionRate.toFixed(1)}%`}
              icon={TrendingUp}
              color="green"
              subtext={`${analytics.metrics.convertedProspects} converted`}
            />
            <MetricCard
              label="Open Rate"
              value={`${analytics.metrics.openRate.toFixed(1)}%`}
              icon={Eye}
              color="blue"
              subtext={`${analytics.metrics.emailsOpened} of ${analytics.metrics.totalEmailsSent}`}
            />
            <MetricCard
              label="Reply Rate"
              value={`${analytics.metrics.replyRate.toFixed(1)}%`}
              icon={MessageSquare}
              color="purple"
              subtext={`${analytics.metrics.emailsReplied} replies`}
            />
          </div>

          {/* Detailed Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Prospects by Status */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-cyan-400" />
                Prospects by Status
              </h3>
              <div className="space-y-3">
                {analytics.prospectsByStatus.map((item: any) => {
                  const total = analytics.metrics.totalProspects;
                  const percentage = total > 0 ? (item._count / total) * 100 : 0;
                  
                  return (
                    <div key={item.status} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-300">{formatStatus(item.status)}</span>
                        <span className="text-white font-semibold">{item._count}</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getStatusColor(item.status)}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Email Performance */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-cyan-400" />
                Email Performance
              </h3>
              <div className="space-y-4">
                <StatRow
                  label="Emails Sent"
                  value={analytics.metrics.totalEmailsSent}
                  icon={Send}
                  iconColor="text-blue-400"
                />
                <StatRow
                  label="Opened"
                  value={analytics.metrics.emailsOpened}
                  icon={Eye}
                  iconColor="text-green-400"
                  percentage={analytics.metrics.openRate}
                />
                <StatRow
                  label="Clicked"
                  value={analytics.metrics.emailsClicked}
                  icon={MousePointer}
                  iconColor="text-yellow-400"
                  percentage={analytics.metrics.clickRate}
                />
                <StatRow
                  label="Replied"
                  value={analytics.metrics.emailsReplied}
                  icon={MessageSquare}
                  iconColor="text-purple-400"
                  percentage={analytics.metrics.replyRate}
                />
              </div>
            </div>
          </div>

          {/* Top Campaigns */}
          {analytics.topCampaigns.length > 0 && (
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
                Top Performing Campaigns
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-slate-400 text-sm border-b border-slate-700">
                      <th className="pb-3">Campaign</th>
                      <th className="pb-3">Sent</th>
                      <th className="pb-3">Opens</th>
                      <th className="pb-3">Clicks</th>
                      <th className="pb-3">Replies</th>
                      <th className="pb-3">Open Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.topCampaigns.map((campaign: any) => {
                      const openRate = campaign.totalSent > 0 ? (campaign.opened / campaign.totalSent) * 100 : 0;
                      
                      return (
                        <tr key={campaign.id} className="border-b border-slate-800 hover:bg-slate-800/30">
                          <td className="py-3">
                            <div>
                              <div className="text-white font-medium">{campaign.name}</div>
                              <div className="text-slate-400 text-sm">{campaign.template.name}</div>
                            </div>
                          </td>
                          <td className="py-3 text-slate-300">{campaign.totalSent}</td>
                          <td className="py-3 text-slate-300">{campaign.opened}</td>
                          <td className="py-3 text-slate-300">{campaign.clicked}</td>
                          <td className="py-3 text-slate-300">{campaign.replied}</td>
                          <td className="py-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              openRate >= 30 ? 'bg-green-500/20 text-green-400' :
                              openRate >= 20 ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {openRate.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Features Overview */}
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">System Capabilities</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FeatureCard
            title="Mass Discovery"
            description="Import 200+ prospects at once from Google Places, Apollo.io, Hunter.io"
            icon="🔍"
          />
          <FeatureCard
            title="Bulk Operations"
            description="Mass delete, archive, tag, and status updates with safety checks"
            icon="⚡"
          />
          <FeatureCard
            title="AI Email Generation"
            description="Claude AI writes personalized emails for each prospect automatically"
            icon="🤖"
          />
          <FeatureCard
            title="Email Tracking"
            description="Track opens, clicks, replies with pixel and link tracking"
            icon="📊"
          />
          <FeatureCard
            title="Advanced Filtering"
            description="Filter by score, location, tags, website quality, and more"
            icon="🎯"
          />
          <FeatureCard
            title="Campaign Automation"
            description="Drip campaigns, follow-ups, and A/B testing capabilities"
            icon="🚀"
          />
        </div>
      </div>

      {/* Quick Setup Guide */}
      <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-amber-400 mb-3">🚀 Quick Start</h3>
        <div className="space-y-3 text-slate-300">
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-400 text-sm font-bold">1</span>
            <div>
              <strong className="text-white">Discover Prospects</strong>
              <p className="text-sm text-slate-400">Click "Discover Prospects" to import 200+ businesses from Google Places</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-400 text-sm font-bold">2</span>
            <div>
              <strong className="text-white">Filter & Select</strong>
              <p className="text-sm text-slate-400">Go to "Manage Prospects" and filter by lead score, location, and website quality</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-400 text-sm font-bold">3</span>
            <div>
              <strong className="text-white">Send AI Emails</strong>
              <p className="text-sm text-slate-400">Select prospects and click "Send AI Emails" for personalized outreach</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-400 text-sm font-bold">4</span>
            <div>
              <strong className="text-white">Track Results</strong>
              <p className="text-sm text-slate-400">Monitor opens, clicks, and replies in real-time on this dashboard</p>
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-amber-500/20">
          <p className="text-sm text-slate-400">
            📖 Read the full guide: <code className="px-2 py-1 bg-slate-900 rounded text-amber-400">OUTREACH_QUICK_START.md</code>
          </p>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function MetricCard({
  label,
  value,
  icon: Icon,
  color,
  trend,
  subtext,
}: {
  label: string;
  value: string;
  icon: any;
  color: string;
  trend?: string;
  subtext?: string;
}) {
  const colorClasses = {
    cyan: 'from-cyan-500/10 to-blue-500/10 border-cyan-500/20 text-cyan-400',
    green: 'from-green-500/10 to-emerald-500/10 border-green-500/20 text-green-400',
    blue: 'from-blue-500/10 to-indigo-500/10 border-blue-500/20 text-blue-400',
    purple: 'from-purple-500/10 to-pink-500/10 border-purple-500/20 text-purple-400',
    amber: 'from-amber-500/10 to-orange-500/10 border-amber-500/20 text-amber-400',
  };

  return (
    <div className={`p-6 bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} border rounded-xl`}>
      <div className="flex items-center justify-between mb-2">
        <Icon className={`w-6 h-6 ${colorClasses[color as keyof typeof colorClasses].split(' ').pop()}`} />
        {trend && (
          <span className="text-green-400 text-sm font-medium">{trend}</span>
        )}
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-slate-400 text-sm">{label}</div>
      {subtext && (
        <div className="text-slate-500 text-xs mt-1">{subtext}</div>
      )}
    </div>
  );
}

function StatRow({
  label,
  value,
  icon: Icon,
  iconColor,
  percentage,
}: {
  label: string;
  value: number;
  icon: any;
  iconColor: string;
  percentage?: number;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Icon className={`w-5 h-5 ${iconColor}`} />
        <span className="text-slate-300">{label}</span>
      </div>
      <div className="text-right">
        <div className="text-white font-semibold">{value.toLocaleString()}</div>
        {percentage !== undefined && (
          <div className="text-slate-400 text-sm">{percentage.toFixed(1)}%</div>
        )}
      </div>
    </div>
  );
}

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/30 hover:border-cyan-500/30 transition-colors">
      <div className="text-2xl mb-2">{icon}</div>
      <h4 className="text-white font-semibold mb-1">{title}</h4>
      <p className="text-slate-400 text-sm">{description}</p>
    </div>
  );
}

function formatStatus(status: string): string {
  return status.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ');
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PROSPECT: 'bg-slate-500',
    REVIEWING: 'bg-blue-500',
    QUALIFIED: 'bg-cyan-500',
    DRAFT_READY: 'bg-purple-500',
    CONTACTED: 'bg-indigo-500',
    RESPONDED: 'bg-green-500',
    MEETING: 'bg-yellow-500',
    PROPOSAL: 'bg-orange-500',
    NEGOTIATING: 'bg-amber-500',
    CONVERTED: 'bg-emerald-500',
    LOST: 'bg-red-500',
    ARCHIVED: 'bg-gray-500',
  };
  return colors[status] || 'bg-slate-500';
}

