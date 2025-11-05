"use client";

import { useEffect, useState } from "react";
import { fetchJson } from "@/lib/client-api";
import Link from "next/link";
import { Sparkles, DollarSign, AlertCircle, CheckCircle, FolderKanban, Clock, TrendingUp, Plus } from "lucide-react";

interface OverviewData {
  projects: { active: number; total: number };
  invoices: { open: number; overdue: number; paidThisMonth: number };
  activity: { items: any[] };
  files: { recent: any[] };
}

export default function ClientOverviewClient() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJson<OverviewData>("/api/client/overview")
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton h-32 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="skeleton h-64 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="seezee-glass p-12 text-center rounded-2xl">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400/60" />
        <h3 className="text-lg font-semibold text-white mb-2">Failed to load</h3>
        <p className="text-white/60">Please refresh the page to try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header - Clean and simple */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Dashboard Overview</h1>
          <p className="text-white/60">Track progress and stay connected with your projects</p>
        </div>
        <Link href="/start">
          <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Start Project
          </button>
        </Link>
      </div>

      {/* KPI Stats - Clean cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/client/projects" className="seezee-glass p-5 hover:bg-white/[0.08] transition-all rounded-xl group">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <FolderKanban className="w-5 h-5 text-blue-400" />
            </div>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {data.projects.active}
          </div>
          <div className="text-sm text-white/60">Active Projects</div>
          <div className="text-xs text-white/40 mt-1">of {data.projects.total} total</div>
        </Link>

        <div className="seezee-glass p-5 rounded-xl">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <DollarSign className="w-5 h-5 text-amber-400" />
            </div>
            <Clock className="w-4 h-4 text-white/40" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {data.invoices.open}
          </div>
          <div className="text-sm text-white/60">Open Invoices</div>
          <div className="text-xs text-white/40 mt-1">pending payment</div>
        </div>

        <div className="seezee-glass p-5 rounded-xl">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-red-400 mb-1">
            {data.invoices.overdue}
          </div>
          <div className="text-sm text-white/60">Overdue</div>
          <div className="text-xs text-white/40 mt-1">requires attention</div>
        </div>

        <div className="seezee-glass p-5 rounded-xl">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-emerald-400 mb-1">
            {data.invoices.paidThisMonth}
          </div>
          <div className="text-sm text-white/60">Paid This Month</div>
          <div className="text-xs text-white/40 mt-1">thank you!</div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="seezee-glass p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Recent Activity</h3>
            <Link href="/client/projects" className="text-sm text-blue-400 hover:text-blue-300">
              View all
            </Link>
          </div>
          {data.activity.items.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-white/40 text-sm">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-2">
              {data.activity.items.slice(0, 5).map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
                >
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white/90 truncate">{item.title}</div>
                    {item.description && (
                      <div className="text-xs text-white/50 mt-0.5">{item.description}</div>
                    )}
                    {item.user && (
                      <div className="text-xs text-white/40 mt-1">by {item.user.name}</div>
                    )}
                  </div>
                  <div className="text-xs text-white/40 flex-shrink-0">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="seezee-glass p-6 rounded-xl">
          <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link 
              href="/client/requests" 
              className="flex items-center gap-3 p-4 bg-white/5 hover:bg-blue-500/10 border border-white/10 hover:border-blue-400/30 rounded-lg transition-all group"
            >
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Plus className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-white">New Request</div>
                <div className="text-xs text-white/60">Submit a change request</div>
              </div>
            </Link>

            <Link 
              href="/client/files" 
              className="flex items-center gap-3 p-4 bg-white/5 hover:bg-blue-500/10 border border-white/10 hover:border-blue-400/30 rounded-lg transition-all group"
            >
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Clock className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-white">Upload Files</div>
                <div className="text-xs text-white/60">Share project assets</div>
              </div>
            </Link>

            <Link 
              href="/client/projects" 
              className="flex items-center gap-3 p-4 bg-white/5 hover:bg-blue-500/10 border border-white/10 hover:border-blue-400/30 rounded-lg transition-all group"
            >
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <FolderKanban className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-white">View Projects</div>
                <div className="text-xs text-white/60">Track all progress</div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Files */}
      {data.files.recent.length > 0 && (
        <div className="seezee-glass p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Recent Files</h3>
            <Link href="/client/files" className="text-sm text-blue-400 hover:text-blue-300">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.files.recent.slice(0, 6).map((file: any) => (
              <a
                key={file.id}
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 hover:border-blue-400/30 transition-all group"
              >
                <div className="text-sm font-medium text-white mb-1 truncate group-hover:text-blue-300 transition-colors">
                  {file.name}
                </div>
                <div className="text-xs text-white/40">
                  {new Date(file.uploadedAt).toLocaleDateString()}
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
