/**
 * Executive Systems Overview
 */

"use client";

import { SectionCard } from "@/components/admin/SectionCard";
import { StatCard } from "@/components/admin/StatCard";
import { Server, Key, Database, Activity } from "lucide-react";
import Link from "next/link";

export default function SystemsPage() {
  return (
    <div className="space-y-6">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Systems</h1>
        <p className="admin-page-subtitle">
          Infrastructure status and controls
        </p>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="System Uptime"
          value="99.9%"
          icon={<Server className="w-5 h-5" />}
        />
        <StatCard
          label="API Status"
          value="Healthy"
          icon={<Activity className="w-5 h-5" />}
        />
        <StatCard
          label="Database"
          value="Online"
          icon={<Database className="w-5 h-5" />}
        />
        <StatCard
          label="Active Sessions"
          value={12}
          icon={<Key className="w-5 h-5" />}
        />
      </div>

      {/* Environment Variables */}
      <SectionCard title="Environment Keys (Masked)">
        <div className="space-y-2 font-mono text-sm">
          {[
            { key: "DATABASE_URL", value: "postgresql://••••••••••••" },
            { key: "NEXTAUTH_SECRET", value: "••••••••••••••••••••" },
            { key: "GOOGLE_CLIENT_ID", value: "1234567890-••••••••••••" },
            { key: "STRIPE_SECRET_KEY", value: "sk_live_••••••••••••" },
          ].map((env) => (
            <div
              key={env.key}
              className="flex justify-between items-center p-3 rounded-lg bg-slate-900/40 border border-white/5"
            >
              <span className="text-blue-400">{env.key}</span>
              <span className="text-slate-500">{env.value}</span>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-4">
        <Link href="/admin/executive/systems/logs">
          <div className="p-6 rounded-xl bg-slate-900/40 border border-white/5 hover:border-white/10 hover:bg-slate-900/60 transition-all cursor-pointer">
            <h3 className="text-lg font-semibold text-white mb-2">
              System Logs
            </h3>
            <p className="text-sm text-slate-400">
              View activity, system, and security logs
            </p>
          </div>
        </Link>

        <Link href="/admin/executive/systems/automations">
          <div className="p-6 rounded-xl bg-slate-900/40 border border-white/5 hover:border-white/10 hover:bg-slate-900/60 transition-all cursor-pointer">
            <h3 className="text-lg font-semibold text-white mb-2">
              Automations
            </h3>
            <p className="text-sm text-slate-400">
              Manage automated workflows and rules
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}


