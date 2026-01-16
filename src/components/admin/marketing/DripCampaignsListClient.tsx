"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Zap,
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Power,
  Users,
  Mail,
  TrendingUp,
  Play,
  Pause,
} from "lucide-react";

interface Template {
  id: string;
  name: string;
  subject: string;
}

interface Step {
  id: string;
  stepNumber: number;
  delayDays: number;
  delayHours: number;
  template: Template;
  sent: number;
  opened: number;
  clicked: number;
  replied: number;
  createdAt: string;
  updatedAt: string;
}

interface Campaign {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  targetStatus: string[];
  targetTags: string[];
  minLeadScore: number | null;
  maxLeadScore: number | null;
  steps: Step[];
  enrollments: Array<{ id: string; completed: boolean; unsubscribed: boolean }>;
  _count: { enrollments: number };
  createdAt: string;
  updatedAt: string;
}

interface Props {
  initialCampaigns: Campaign[];
}

export function DripCampaignsListClient({ initialCampaigns }: Props) {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    setDeleting(id);
    try {
      const res = await fetch(`/api/drip-campaigns/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete campaign");
      }

      setCampaigns(campaigns.filter((c) => c.id !== id));
      alert("Campaign deleted successfully");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setDeleting(null);
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      const res = await fetch(`/api/drip-campaigns/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !currentActive }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update campaign");
      }

      setCampaigns(
        campaigns.map((c) =>
          c.id === id ? { ...c, active: !currentActive } : c
        )
      );

      alert(
        !currentActive
          ? "Campaign activated! Prospects can now be enrolled."
          : "Campaign paused. No new emails will be sent."
      );
    } catch (error: any) {
      alert(error.message);
    }
  };

  const stats = {
    total: campaigns.length,
    active: campaigns.filter((c) => c.active).length,
    totalEnrollments: campaigns.reduce((sum, c) => sum + c._count.enrollments, 0),
    totalSteps: campaigns.reduce((sum, c) => sum + c.steps.length, 0),
  };

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
              <Zap className="w-8 h-8 text-purple-400" />
              Drip Campaigns
            </h1>
            <p className="text-slate-400 mt-1">
              Automated email sequences to nurture prospects
            </p>
          </div>
        </div>
        <Link
          href="/admin/marketing/drip-campaigns/new"
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all font-medium flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Campaign
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900/50 border border-white/10 rounded-xl">
          <p className="text-2xl font-bold text-white">{stats.total}</p>
          <p className="text-sm text-slate-400">Total Campaigns</p>
        </div>
        <div className="p-4 bg-slate-900/50 border border-white/10 rounded-xl">
          <p className="text-2xl font-bold text-green-400">{stats.active}</p>
          <p className="text-sm text-slate-400">Active</p>
        </div>
        <div className="p-4 bg-slate-900/50 border border-white/10 rounded-xl">
          <p className="text-2xl font-bold text-cyan-400">
            {stats.totalEnrollments}
          </p>
          <p className="text-sm text-slate-400">Total Enrollments</p>
        </div>
        <div className="p-4 bg-slate-900/50 border border-white/10 rounded-xl">
          <p className="text-2xl font-bold text-purple-400">{stats.totalSteps}</p>
          <p className="text-sm text-slate-400">Total Steps</p>
        </div>
      </div>

      {/* Campaigns List */}
      {campaigns.length === 0 ? (
        <div className="bg-slate-900/50 border border-white/10 rounded-xl p-12 text-center">
          <Zap className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            No drip campaigns yet
          </h3>
          <p className="text-slate-400 mb-6">
            Create your first automated email sequence to nurture prospects
          </p>
          <Link
            href="/admin/marketing/drip-campaigns/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Campaign
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {campaigns.map((campaign) => {
            const enrollments = campaign._count.enrollments;
            const completed = campaign.enrollments.filter((e) => e.completed).length;
            const unsubscribed = campaign.enrollments.filter((e) => e.unsubscribed).length;
            const totalSent = campaign.steps.reduce((sum, s) => sum + s.sent, 0);
            const totalOpened = campaign.steps.reduce((sum, s) => sum + s.opened, 0);
            const openRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : "0";

            return (
              <div
                key={campaign.id}
                className="bg-slate-900/50 border border-white/10 rounded-xl p-6 hover:border-purple-500/30 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-white">
                        {campaign.name}
                      </h3>
                      <button
                        onClick={() => handleToggleActive(campaign.id, campaign.active)}
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          campaign.active
                            ? "bg-green-500/20 text-green-400"
                            : "bg-slate-500/20 text-slate-400"
                        }`}
                      >
                        {campaign.active ? "Active" : "Inactive"}
                      </button>
                    </div>
                    {campaign.description && (
                      <p className="text-slate-400 text-sm mb-3">
                        {campaign.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-3 text-sm">
                      <div className="flex items-center gap-1 text-slate-300">
                        <Mail className="w-4 h-4" />
                        {campaign.steps.length} steps
                      </div>
                      <div className="flex items-center gap-1 text-slate-300">
                        <Users className="w-4 h-4" />
                        {enrollments} enrolled
                      </div>
                      <div className="flex items-center gap-1 text-slate-300">
                        <TrendingUp className="w-4 h-4" />
                        {totalSent} sent
                      </div>
                      <div className="flex items-center gap-1 text-green-400">
                        {openRate}% open rate
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/marketing/drip-campaigns/${campaign.id}`}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      title="Edit campaign"
                    >
                      <Edit className="w-4 h-4 text-slate-400 hover:text-white" />
                    </Link>
                    <button
                      onClick={() => handleDelete(campaign.id, campaign.name)}
                      disabled={deleting === campaign.id || enrollments > 0}
                      className="p-2 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                      title={enrollments > 0 ? "Cannot delete campaign with active enrollments" : "Delete campaign"}
                    >
                      <Trash2 className="w-4 h-4 text-red-400 hover:text-red-300" />
                    </button>
                  </div>
                </div>

                {/* Campaign Steps Preview */}
                {campaign.steps.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-xs text-slate-500 mb-2">Sequence:</p>
                    <div className="flex flex-wrap gap-2">
                      {campaign.steps.map((step, index) => (
                        <div
                          key={step.id}
                          className="px-3 py-1.5 bg-slate-800 rounded-lg text-xs"
                        >
                          <span className="text-purple-400 font-medium">
                            Step {step.stepNumber + 1}
                          </span>
                          {step.delayDays > 0 && (
                            <span className="text-slate-400 ml-2">
                              +{step.delayDays}d
                              {step.delayHours > 0 && ` ${step.delayHours}h`}
                            </span>
                          )}
                          <span className="text-white ml-2 truncate max-w-[200px] inline-block align-bottom">
                            {step.template.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Info Box */}
      <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-cyan-400 mb-3">
          How Drip Campaigns Work
        </h3>
        <ul className="space-y-2 text-sm text-slate-300">
          <li>• Create a sequence of email templates with delays between them</li>
          <li>• Enroll prospects based on criteria (status, tags, lead score)</li>
          <li>• Emails are sent automatically at scheduled times</li>
          <li>• Campaign pauses if prospect replies or unsubscribes</li>
          <li>• Track opens, clicks, and replies for each step</li>
        </ul>
      </div>
    </div>
  );
}
