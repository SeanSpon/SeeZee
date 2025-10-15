/**
 * Pipeline Overview
 */

import { StatCard } from "@/components/admin/StatCard";
import { Users, Briefcase, FileText, TrendingUp } from "lucide-react";

export default function PipelineOverview() {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Active Leads"
          value={8}
          icon={<Users className="w-5 h-5" />}
          trend={{ value: 12, label: "this week" }}
        />
        <StatCard
          label="In Progress Projects"
          value={12}
          icon={<Briefcase className="w-5 h-5" />}
          trend={{ value: 5, label: "this month" }}
        />
        <StatCard
          label="Pending Invoices"
          value={5}
          icon={<FileText className="w-5 h-5" />}
        />
        <StatCard
          label="Conversion Rate"
          value="68%"
          icon={<TrendingUp className="w-5 h-5" />}
          trend={{ value: 3, label: "from last quarter" }}
        />
      </div>

      {/* Overview content */}
      <div className="rounded-xl bg-slate-900/40 backdrop-blur-xl border border-white/5 p-8 text-center">
        <p className="text-slate-400">
          Select a tab above to view leads, projects, invoices, or the kanban board
        </p>
      </div>
    </div>
  );
}


