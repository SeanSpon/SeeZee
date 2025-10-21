"use client";

import { useEffect, useState } from "react";
import { fetchJson } from "@/lib/client-api";

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
      <div className="admin-container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 w-full bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return <div>Failed to load data</div>;

  return (
    <div className="admin-container">
      {/* Page Header */}
      <div className="admin-page-header">
        <h1 className="admin-page-title">Dashboard Overview</h1>
        <p className="admin-page-subtitle">
          Welcome back! Here's what's happening with your projects.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="glass p-6 rounded-xl border border-white/10">
          <div className="text-3xl mb-2">📊</div>
          <div className="text-2xl font-bold text-white">{data.projects.active}</div>
          <div className="text-sm text-white/60">Active Projects</div>
        </div>
        <div className="glass p-6 rounded-xl border border-white/10">
          <div className="text-3xl mb-2">💰</div>
          <div className="text-2xl font-bold text-white">{data.invoices.open}</div>
          <div className="text-sm text-white/60">Open Invoices</div>
        </div>
        <div className="glass p-6 rounded-xl border border-white/10">
          <div className="text-3xl mb-2">⚠️</div>
          <div className="text-2xl font-bold text-red-400">{data.invoices.overdue}</div>
          <div className="text-sm text-white/60">Overdue</div>
        </div>
        <div className="glass p-6 rounded-xl border border-white/10">
          <div className="text-3xl mb-2">✅</div>
          <div className="text-2xl font-bold text-green-400">{data.invoices.paidThisMonth}</div>
          <div className="text-sm text-white/60">Paid This Month</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass p-6 rounded-xl border border-white/10 mb-8">
        <h3 className="text-xl font-bold text-white mb-6">Recent Activity</h3>
        {data.activity.items.length === 0 ? (
          <p className="text-white/50 text-center py-8">No recent activity</p>
        ) : (
          <div className="space-y-3">
            {data.activity.items.map((item: any) => (
              <div key={item.id} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                <div className="text-sm text-white/80">{item.title}</div>
                <div className="text-xs text-white/50 ml-auto">
                  {new Date(item.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Files */}
      <div className="glass p-6 rounded-xl border border-white/10">
        <h3 className="text-xl font-bold text-white mb-6">Recent Files</h3>
        {data.files.recent.length === 0 ? (
          <p className="text-white/50 text-center py-8">No files uploaded yet</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.files.recent.map((file: any) => (
              <a
                key={file.id}
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="text-sm font-medium text-white mb-1 truncate">{file.name}</div>
                <div className="text-xs text-white/50">
                  {new Date(file.uploadedAt).toLocaleDateString()}
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
