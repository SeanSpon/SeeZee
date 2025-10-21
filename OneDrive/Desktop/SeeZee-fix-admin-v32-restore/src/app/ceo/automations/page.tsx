/**
 * CEO Automations
 * Manage automated workflows and cron jobs
 */

"use client";

import { SectionCard } from "@/components/admin/SectionCard";
import { Zap } from "lucide-react";

export default function CEOAutomationsPage() {
  return (
    <div className="space-y-6">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Automations</h1>
        <p className="admin-page-subtitle">
          Automated workflows and scheduled tasks
        </p>
      </div>

      <SectionCard>
        <div className="text-center py-12 text-slate-500">
          <Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-sm">Automation manager coming soon</p>
        </div>
      </SectionCard>
    </div>
  );
}
