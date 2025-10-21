"use client";

import { SectionCard } from "@/components/admin/SectionCard";
import { StatCard } from "@/components/admin/StatCard";
import { BarChart3, TrendingUp, Users, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/ui";

interface AnalyticsClientProps {
  metrics: any;
}

export function AnalyticsClient({ metrics }: AnalyticsClientProps) {
  if (!metrics) {
    return (
      <div className="space-y-6">
        <div className="admin-page-header">
          <h1 className="admin-page-title">Analytics</h1>
          <p className="admin-page-subtitle">
            Executive insights and business metrics
          </p>
        </div>
        <div className="text-center py-12 text-slate-500">
          No data available
        </div>
      </div>
    );
  }

  const completionRate =
    metrics.projects.total > 0
      ? (metrics.projects.completed / metrics.projects.total) * 100
      : 0;

  return (
    <div className="space-y-6">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Analytics</h1>
        <p className="admin-page-subtitle">
          Executive insights and business metrics
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Revenue"
          value={formatCurrency(metrics.revenue.total)}
          icon={<DollarSign className="w-5 h-5" />}
          trend={{
            value: Math.round(metrics.revenue.trend),
            label: "vs last period",
          }}
        />
        <StatCard
          label="Active Projects"
          value={metrics.projects.active}
          icon={<Users className="w-5 h-5" />}
        />
        <StatCard
          label="Conversion Rate"
          value={`${Math.round(metrics.leads.conversionRate)}%`}
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <StatCard
          label="Avg Project Value"
          value={formatCurrency(metrics.projects.avgValue)}
          icon={<BarChart3 className="w-5 h-5" />}
        />
      </div>

      {/* Revenue Breakdown */}
      <SectionCard title="Revenue Overview">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-slate-400 mb-2">Total Received</p>
            <p className="text-2xl font-bold text-white">
              {formatCurrency(metrics.revenue.total)}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-2">Pending Payments</p>
            <p className="text-2xl font-bold text-yellow-400">
              {formatCurrency(metrics.revenue.pending)}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-2">Last 30 Days</p>
            <p className="text-2xl font-bold text-green-400">
              {formatCurrency(metrics.revenue.recent)}
            </p>
          </div>
        </div>
      </SectionCard>

      <div className="grid grid-cols-2 gap-6">
        <SectionCard title="Project Performance">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">In Progress</span>
              <span className="text-lg font-semibold text-white">
                {metrics.projects.active}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Completed</span>
              <span className="text-lg font-semibold text-white">
                {metrics.projects.completed}
              </span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-white/5">
              <span className="text-sm text-slate-400">Completion Rate</span>
              <span className="text-lg font-semibold text-green-400">
                {Math.round(completionRate)}%
              </span>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Task Productivity">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Total Tasks</span>
              <span className="text-lg font-semibold text-white">
                {metrics.tasks.total}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Completed</span>
              <span className="text-lg font-semibold text-white">
                {metrics.tasks.completed}
              </span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-white/5">
              <span className="text-sm text-slate-400">Completion Rate</span>
              <span className="text-lg font-semibold text-green-400">
                {Math.round(metrics.tasks.completionRate)}%
              </span>
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Lead Funnel">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">Total Leads</span>
            <span className="text-white font-medium">{metrics.leads.total}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">Converted</span>
            <span className="text-white font-medium">
              {metrics.leads.converted}
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-4">
            <div
              className="bg-blue-500 h-4 rounded-full flex items-center justify-center text-xs text-white font-medium"
              style={{ width: `${metrics.leads.conversionRate}%` }}
            >
              {Math.round(metrics.leads.conversionRate)}%
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
