/**
 * Automations - Rule builder for workflow automation
 */

"use client";

import { SectionCard } from "@/components/admin/SectionCard";
import { Plus, Play, Pause, Settings } from "lucide-react";

interface Automation {
  id: string;
  name: string;
  trigger: string;
  action: string;
  enabled: boolean;
  lastRun?: Date;
}

const mockAutomations: Automation[] = [
  {
    id: "auto-1",
    name: "Client Survey on Project Completion",
    trigger: "Project status → Completed",
    action: "Send client satisfaction survey email",
    enabled: true,
    lastRun: new Date(Date.now() - 1000 * 60 * 60 * 12),
  },
  {
    id: "auto-2",
    name: "Failed Payment Ticket Creation",
    trigger: "Stripe renewal → Failed",
    action: "Create maintenance ticket for billing issue",
    enabled: true,
    lastRun: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
  },
];

export default function AutomationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="admin-page-header">
          <h1 className="admin-page-title">Automations</h1>
          <p className="admin-page-subtitle">
            Create and manage automated workflows
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-all">
          <Plus className="w-4 h-4" />
          New Automation
        </button>
      </div>

      {/* Automations List */}
      <div className="space-y-4">
        {mockAutomations.map((automation) => (
          <SectionCard key={automation.id}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-white">
                    {automation.name}
                  </h3>
                  {automation.enabled ? (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-500/20 text-slate-400">
                      Paused
                    </span>
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Trigger:</span>
                    <span className="text-blue-400">{automation.trigger}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Action:</span>
                    <span className="text-white">{automation.action}</span>
                  </div>
                  {automation.lastRun && (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Last run:</span>
                      <span className="text-slate-400">
                        {automation.lastRun.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all">
                  <Settings className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all">
                  {automation.enabled ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </SectionCard>
        ))}
      </div>

      {/* Rule Builder Preview */}
      <SectionCard title="Rule Builder">
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-slate-900/40 border border-white/5">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-slate-500 mb-2 block">
                  IF (Event)
                </label>
                <select className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-white/10 text-white text-sm">
                  <option>Project → Completed</option>
                  <option>Invoice → Paid</option>
                  <option>Stripe → Renewal failed</option>
                  <option>Task → Completed</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-2 block">
                  THEN (Action)
                </label>
                <select className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-white/10 text-white text-sm">
                  <option>Send email</option>
                  <option>Create ticket</option>
                  <option>Update status</option>
                  <option>Notify team</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-2 block">
                  Target
                </label>
                <input
                  type="text"
                  placeholder="Email, user, etc."
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-white/10 text-white text-sm placeholder:text-slate-500"
                />
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-500 text-center">
            TODO: Implement full rule builder with condition logic
          </p>
        </div>
      </SectionCard>
    </div>
  );
}


