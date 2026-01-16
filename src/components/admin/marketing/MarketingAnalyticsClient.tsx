"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  ArrowLeft,
  TrendingUp,
  Users,
  Mail,
  Target,
  Zap,
  Trophy,
  Calendar,
  Globe,
  DollarSign,
} from "lucide-react";

interface AnalyticsData {
  stats: {
    prospects: {
      total: number;
      byScore: { hot: number; warm: number; cold: number };
      byStatus: Record<string, number>;
      converted: number;
    };
    templates: {
      total: number;
      active: number;
      performance: Array<{
        id: string;
        name: string;
        category: string;
        totalSent: number;
        totalOpened: number;
        totalReplied: number;
      }>;
    };
    campaigns: {
      total: number;
      sent: number;
      opened: number;
      replied: number;
    };
    drips: {
      total: number;
      active: number;
      enrolled: number;
      completed: number;
    };
  };
  prospects: any[];
  templates: any[];
  campaigns: any[];
  sentEmails: any[];
}

interface Props {
  data: AnalyticsData;
}

export function MarketingAnalyticsClient({ data }: Props) {
  const { stats } = data;
  
  // Calculate rates
  const openRate = stats.campaigns.sent > 0
    ? ((stats.campaigns.opened / stats.campaigns.sent) * 100).toFixed(1)
    : "0.0";
  
  const replyRate = stats.campaigns.sent > 0
    ? ((stats.campaigns.replied / stats.campaigns.sent) * 100).toFixed(1)
    : "0.0";
  
  const conversionRate = stats.prospects.total > 0
    ? ((stats.prospects.converted / stats.prospects.total) * 100).toFixed(1)
    : "0.0";

  // Get top performing templates
  const topTemplates = stats.templates.performance.slice(0, 5);

  // Calculate engagement by lead score
  const engagementByScore = data.sentEmails.reduce((acc, email) => {
    if (!email.prospect) return acc;
    
    const scoreRange = 
      email.prospect.leadScore >= 80 ? "hot" :
      email.prospect.leadScore >= 60 ? "warm" : "cold";
    
    if (!acc[scoreRange]) {
      acc[scoreRange] = { sent: 0, opened: 0, replied: 0 };
    }
    
    acc[scoreRange].sent++;
    if (email.openedAt) acc[scoreRange].opened++;
    if (email.repliedAt) acc[scoreRange].replied++;
    
    return acc;
  }, {} as Record<string, { sent: number; opened: number; replied: number }>);

  // Category performance
  const categoryPerformance = data.sentEmails.reduce((acc, email) => {
    if (!email.prospect?.category) return acc;
    
    const cat = email.prospect.category;
    if (!acc[cat]) {
      acc[cat] = { sent: 0, opened: 0, replied: 0 };
    }
    
    acc[cat].sent++;
    if (email.openedAt) acc[cat].opened++;
    if (email.repliedAt) acc[cat].replied++;
    
    return acc;
  }, {} as Record<string, { sent: number; opened: number; replied: number }>);

  const topCategories = Object.entries(categoryPerformance)
    .sort((a, b) => (b[1] as { sent: number; opened: number; replied: number }).replied - (a[1] as { sent: number; opened: number; replied: number }).replied)
    .slice(0, 5);

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
              <BarChart3 className="w-8 h-8 text-purple-400" />
              Marketing Analytics
            </h1>
            <p className="text-slate-400 mt-1">
              Performance insights and campaign metrics
            </p>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-600/20 border border-purple-500/30 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5 text-purple-400" />
            <TrendingUp className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-2xl font-bold text-white">{stats.prospects.total}</p>
          <p className="text-sm text-slate-300">Total Prospects</p>
          <p className="text-xs text-slate-400 mt-1">
            {stats.prospects.converted} converted ({conversionRate}%)
          </p>
        </div>

        <div className="p-4 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <Mail className="w-5 h-5 text-cyan-400" />
            <span className="text-xs text-cyan-300">{openRate}% open</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {stats.campaigns.sent.toLocaleString()}
          </p>
          <p className="text-sm text-slate-300">Emails Sent</p>
          <p className="text-xs text-slate-400 mt-1">
            {stats.campaigns.opened.toLocaleString()} opened
          </p>
        </div>

        <div className="p-4 bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-500/30 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-5 h-5 text-green-400" />
            <span className="text-xs text-green-300">{replyRate}% reply</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {stats.campaigns.replied.toLocaleString()}
          </p>
          <p className="text-sm text-slate-300">Replies</p>
          <p className="text-xs text-slate-400 mt-1">
            From {stats.campaigns.total} campaigns
          </p>
        </div>

        <div className="p-4 bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/30 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <span className="text-xs text-amber-300">{stats.drips.active} active</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.drips.enrolled}</p>
          <p className="text-sm text-slate-300">Drip Enrollments</p>
          <p className="text-xs text-slate-400 mt-1">
            {stats.drips.completed} completed
          </p>
        </div>
      </div>

      {/* Lead Quality Distribution */}
      <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          Lead Quality Distribution
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-3xl font-bold text-red-400">
              {stats.prospects.byScore.hot}
            </p>
            <p className="text-sm text-slate-300">Hot Leads (80-100)</p>
            <p className="text-xs text-slate-400 mt-1">High priority contacts</p>
          </div>
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <p className="text-3xl font-bold text-amber-400">
              {stats.prospects.byScore.warm}
            </p>
            <p className="text-sm text-slate-300">Warm Leads (60-79)</p>
            <p className="text-xs text-slate-400 mt-1">Good prospects</p>
          </div>
          <div className="p-4 bg-slate-500/10 border border-slate-500/30 rounded-lg">
            <p className="text-3xl font-bold text-slate-400">
              {stats.prospects.byScore.cold}
            </p>
            <p className="text-sm text-slate-300">Cold Leads (0-59)</p>
            <p className="text-xs text-slate-400 mt-1">Lower priority</p>
          </div>
        </div>
      </div>

      {/* Engagement by Lead Score */}
      <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-cyan-400" />
          Engagement by Lead Score
        </h3>
        <div className="space-y-3">
          {Object.entries(engagementByScore).map(([range, data]) => {
            const stats = data as { sent: number; opened: number; replied: number };
            const openRate = stats.sent > 0
              ? ((stats.opened / stats.sent) * 100).toFixed(1)
              : "0.0";
            const replyRate = stats.sent > 0
              ? ((stats.replied / stats.sent) * 100).toFixed(1)
              : "0.0";
            
            const colors = {
              hot: { bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/30" },
              warm: { bg: "bg-amber-500/20", text: "text-amber-400", border: "border-amber-500/30" },
              cold: { bg: "bg-slate-500/20", text: "text-slate-400", border: "border-slate-500/30" },
            }[range] || { bg: "bg-slate-500/20", text: "text-slate-400", border: "border-slate-500/30" };
            
            return (
              <div
                key={range}
                className={`p-4 ${colors.bg} border ${colors.border} rounded-lg`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-medium ${colors.text} capitalize`}>
                    {range} Leads
                  </span>
                  <span className="text-sm text-slate-300">
                    {stats.sent} emails sent
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Open Rate:</span>
                    <span className="text-white ml-2 font-medium">{openRate}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Reply Rate:</span>
                    <span className="text-white ml-2 font-medium">{replyRate}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Performing Templates */}
      <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Mail className="w-5 h-5 text-purple-400" />
          Top Performing Templates
        </h3>
        <div className="space-y-2">
          {topTemplates.map((template, index) => {
            const openRate = template.totalSent > 0
              ? ((template.totalOpened / template.totalSent) * 100).toFixed(1)
              : "0.0";
            const replyRate = template.totalSent > 0
              ? ((template.totalReplied / template.totalSent) * 100).toFixed(1)
              : "0.0";
            
            return (
              <div
                key={template.id}
                className="p-4 bg-slate-800/50 border border-white/10 rounded-lg hover:border-purple-500/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 text-sm font-bold">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-white">{template.name}</p>
                      <p className="text-xs text-slate-400">{template.category}</p>
                    </div>
                  </div>
                  <span className="text-sm text-slate-300">
                    {template.totalSent.toLocaleString()} sent
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-500"
                        style={{ width: `${openRate}%` }}
                      />
                    </div>
                    <span className="text-white font-medium min-w-[3rem]">
                      {openRate}% open
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500"
                        style={{ width: `${replyRate}%` }}
                      />
                    </div>
                    <span className="text-white font-medium min-w-[3rem]">
                      {replyRate}% reply
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Performance */}
      <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-green-400" />
          Top Performing Categories
        </h3>
        <div className="space-y-2">
          {topCategories.map(([category, data]) => {
            const stats = data as { sent: number; opened: number; replied: number };
            const replyRate = stats.sent > 0
              ? ((stats.replied / stats.sent) * 100).toFixed(1)
              : "0.0";
            
            return (
              <div
                key={category}
                className="p-3 bg-slate-800/50 border border-white/10 rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-white">{category}</span>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-slate-400">
                      {stats.sent} sent
                    </span>
                    <span className="text-green-400 font-medium">
                      {replyRate}% reply rate
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
