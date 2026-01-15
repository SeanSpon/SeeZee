import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/requireRole";
import { ROLE } from "@/lib/role";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Send, ArrowLeft, TrendingUp, Mail, Eye, MousePointer, MessageSquare } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CampaignsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const allowedRoles = [ROLE.CEO, ROLE.CFO, ROLE.OUTREACH];
  if (!allowedRoles.includes(user.role as any)) {
    redirect("/admin");
  }

  // Fetch all sent emails with prospect info
  const sentEmails = await prisma.sentEmail.findMany({
    orderBy: { sentAt: "desc" },
    include: {
      prospect: {
        select: {
          id: true,
          company: true,
          name: true,
          email: true,
          status: true,
        },
      },
    },
    take: 100,
  });

  // Calculate overall stats
  const totalSent = sentEmails.length;
  const totalOpened = sentEmails.filter(e => e.openedAt).length;
  const totalClicked = sentEmails.filter(e => e.clickedAt).length;
  const totalReplied = sentEmails.filter(e => e.repliedAt).length;

  const openRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0;
  const clickRate = totalSent > 0 ? Math.round((totalClicked / totalSent) * 100) : 0;
  const replyRate = totalSent > 0 ? Math.round((totalReplied / totalSent) * 100) : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/marketing"
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Send className="w-8 h-8 text-cyan-400" />
              Email Campaigns
            </h1>
            <p className="text-slate-400 mt-1">
              Track all sent emails and campaign performance
            </p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Sent"
          value={totalSent.toLocaleString()}
          icon={Mail}
          color="blue"
        />
        <StatCard
          label="Open Rate"
          value={`${openRate}%`}
          icon={Eye}
          color="green"
          subtext={`${totalOpened} opens`}
        />
        <StatCard
          label="Click Rate"
          value={`${clickRate}%`}
          icon={MousePointer}
          color="amber"
          subtext={`${totalClicked} clicks`}
        />
        <StatCard
          label="Reply Rate"
          value={`${replyRate}%`}
          icon={MessageSquare}
          color="purple"
          subtext={`${totalReplied} replies`}
        />
      </div>

      {/* Campaigns Table */}
      {sentEmails.length === 0 ? (
        <div className="bg-slate-900/50 border border-white/10 rounded-xl p-12 text-center">
          <Send className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No emails sent yet</h3>
          <p className="text-slate-400 mb-6">
            Start by discovering prospects and sending bulk emails
          </p>
          <Link
            href="/admin/marketing/prospects"
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all font-medium inline-flex items-center gap-2"
          >
            Go to Prospects
          </Link>
        </div>
      ) : (
        <div className="bg-slate-900/50 border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900/80 border-b border-white/10">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-slate-400">Prospect</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-400">Subject</th>
                  <th className="text-center p-4 text-sm font-medium text-slate-400">Status</th>
                  <th className="text-center p-4 text-sm font-medium text-slate-400">Opened</th>
                  <th className="text-center p-4 text-sm font-medium text-slate-400">Clicked</th>
                  <th className="text-center p-4 text-sm font-medium text-slate-400">Replied</th>
                  <th className="text-center p-4 text-sm font-medium text-slate-400">Sent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {sentEmails.map((email) => {
                  const opened = !!email.openedAt;
                  const clicked = !!email.clickedAt;
                  const replied = !!email.repliedAt;

                  return (
                    <tr key={email.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-white">
                            {email.prospect?.company || "Unknown"}
                          </p>
                          <p className="text-sm text-slate-400">
                            {email.prospect?.name || email.prospect?.email}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-white truncate max-w-xs">
                          {email.subject}
                        </p>
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            email.prospect?.status === "RESPONDED"
                              ? "bg-green-500/20 text-green-400"
                              : email.prospect?.status === "CONTACTED"
                              ? "bg-cyan-500/20 text-cyan-400"
                              : email.prospect?.status === "QUALIFIED"
                              ? "bg-purple-500/20 text-purple-400"
                              : "bg-slate-500/20 text-slate-400"
                          }`}
                        >
                          {email.prospect?.status || "N/A"}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        {opened ? (
                          <div className="text-green-400 text-sm">
                            ✓ {new Date(email.openedAt!).toLocaleDateString()}
                          </div>
                        ) : (
                          <div className="text-slate-500 text-sm">-</div>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {clicked ? (
                          <div className="text-cyan-400 text-sm">
                            ✓ {new Date(email.clickedAt!).toLocaleDateString()}
                          </div>
                        ) : (
                          <div className="text-slate-500 text-sm">-</div>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {replied ? (
                          <div className="text-purple-400 text-sm">
                            ✓ {new Date(email.repliedAt!).toLocaleDateString()}
                          </div>
                        ) : (
                          <div className="text-slate-500 text-sm">-</div>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <p className="text-sm text-slate-400">
                          {email.sentAt ? new Date(email.sentAt).toLocaleDateString() : '-'}
                        </p>
                        <p className="text-xs text-slate-500">
                          {email.sentAt ? new Date(email.sentAt).toLocaleTimeString() : '-'}
                        </p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Link
          href="/admin/marketing/prospects"
          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all font-medium flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          Send More Emails
        </Link>
        <Link
          href="/admin/marketing/outreach"
          className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-all font-medium flex items-center gap-2"
        >
          <TrendingUp className="w-4 h-4" />
          View Analytics
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
  subtext,
}: {
  label: string;
  value: string;
  icon: any;
  color: string;
  subtext?: string;
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
          {subtext && <p className="text-xs opacity-60 mt-0.5">{subtext}</p>}
        </div>
      </div>
    </div>
  );
}
