'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface DashboardStats {
  projects: {
    total: number;
    active: number;
    completionRate: number;
  };
  invoices: {
    total: number;
    paid: number;
    paidRate: number;
  };
  revenue: {
    total: number;
    formatted: string;
  };
  leads: {
    total: number;
  };
  activity: {
    recentMessages: number;
  };
}

export default function DashboardStatsCards() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      fetch('/api/dashboard/stats')
        .then(res => {
          if (!res.ok) {
            throw new Error('Failed to fetch stats');
          }
          return res.json();
        })
        .then(data => {
          // Provide fallback structure if API returns incomplete data
          const safeStats = {
            projects: {
              total: data?.projects?.total || 0,
              active: data?.projects?.active || 0,
              completionRate: data?.projects?.completionRate || 0,
            },
            invoices: {
              total: data?.invoices?.total || 0,
              paid: data?.invoices?.paid || 0,
              paidRate: data?.invoices?.paidRate || 0,
            },
            revenue: {
              total: data?.revenue?.total || 0,
              formatted: data?.revenue?.formatted || "$0",
            },
            leads: {
              total: data?.leads?.total || 0,
            },
            activity: {
              recentMessages: data?.activity?.recentMessages || 0,
            },
          };
          setStats(safeStats);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching stats:', error);
          // Set fallback stats on error
          setStats({
            projects: { total: 0, active: 0, completionRate: 0 },
            invoices: { total: 0, paid: 0, paidRate: 0 },
            revenue: { total: 0, formatted: "$0" },
            leads: { total: 0 },
            activity: { recentMessages: 0 },
          });
          setLoading(false);
        });
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-xl p-6 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-slate-700 rounded-lg"></div>
              <div className="w-8 h-4 bg-slate-700 rounded"></div>
            </div>
            <div className="w-16 h-8 bg-slate-700 rounded mb-1"></div>
            <div className="w-24 h-4 bg-slate-700 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-red-900/20 backdrop-blur-xl border border-red-500/20 rounded-xl p-6">
          <p className="text-red-400">Please sign in to view dashboard</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-red-900/20 backdrop-blur-xl border border-red-500/20 rounded-xl p-6">
          <p className="text-red-400">Failed to load dashboard stats</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Messages */}
      <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-slate-900/90 hover:border-blue-500/30 hover:shadow-[0_0_30px_rgba(37,99,235,0.2)] transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <span className="text-blue-400 text-sm">{stats?.activity?.recentMessages || 0} today</span>
        </div>
        <h3 className="text-2xl font-bold mb-1 text-white">{stats?.activity?.recentMessages || 0}</h3>
        <p className="text-slate-400">Recent Messages</p>
      </div>
      
      {/* Leads */}
      <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-slate-900/90 hover:border-blue-500/30 hover:shadow-[0_0_30px_rgba(37,99,235,0.2)] transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <span className="text-green-400 text-sm">Active</span>
        </div>
        <h3 className="text-2xl font-bold mb-1 text-white">{stats?.leads?.total || 0}</h3>
        <p className="text-slate-400">Total Leads</p>
      </div>
      
      {/* Projects (Coming Soon) */}
      <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-slate-900/90 hover:border-purple-500/30 hover:shadow-[0_0_30px_rgba(147,51,234,0.2)] transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
            </svg>
          </div>
          <span className="text-gray-400 text-sm">Soon</span>
        </div>
        <h3 className="text-2xl font-bold mb-1 text-white">0</h3>
        <p className="text-slate-400">Projects</p>
      </div>
      
      {/* Revenue (Coming Soon) */}
      <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-slate-900/90 hover:border-yellow-500/30 hover:shadow-[0_0_30px_rgba(234,179,8,0.2)] transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <span className="text-gray-400 text-sm">Soon</span>
        </div>
        <h3 className="text-2xl font-bold mb-1 text-white">$0</h3>
        <p className="text-slate-400">Revenue</p>
      </div>
    </div>
  );
}