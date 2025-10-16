/**
 * Executive Analytics Dashboard
 */

"use client";

import { SectionCard } from "@/components/admin/SectionCard";
import { StatCard } from "@/components/admin/StatCard";
import { BarChart3, TrendingUp, Users, DollarSign } from "lucide-react";

export default function AnalyticsPage() {
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
          value="$127.5k"
          icon={<DollarSign className="w-5 h-5" />}
          trend={{ value: 23, label: "vs last quarter" }}
        />
        <StatCard
          label="Active Clients"
          value={34}
          icon={<Users className="w-5 h-5" />}
          trend={{ value: 12, label: "new this month" }}
        />
        <StatCard
          label="Conversion Rate"
          value="68%"
          icon={<TrendingUp className="w-5 h-5" />}
          trend={{ value: 5, label: "improvement" }}
        />
        <StatCard
          label="Avg Project Value"
          value="$3.8k"
          icon={<BarChart3 className="w-5 h-5" />}
          trend={{ value: 8, label: "increase" }}
        />
      </div>

      {/* Charts placeholder */}
      <SectionCard title="Revenue Over Time">
        <div className="h-64 flex items-center justify-center text-slate-500">
          Chart component - TODO: Integrate with real analytics data
        </div>
      </SectionCard>

      <div className="grid grid-cols-2 gap-6">
        <SectionCard title="Project Completion Rate">
          <div className="h-48 flex items-center justify-center text-slate-500">
            Pie chart placeholder
          </div>
        </SectionCard>

        <SectionCard title="Workload by Role">
          <div className="h-48 flex items-center justify-center text-slate-500">
            Bar chart placeholder
          </div>
        </SectionCard>
      </div>
    </div>
  );
}


