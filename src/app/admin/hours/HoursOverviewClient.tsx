'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Clock,
  Package,
  TrendingUp,
  AlertTriangle,
  Users,
  Search,
  Filter,
  Calendar,
  ArrowRight,
  Zap,
  CheckCircle,
} from 'lucide-react';

// =============================================================================
// TYPES
// =============================================================================

interface HourPack {
  id: string;
  packType: string;
  hours: number;
  hoursRemaining: number;
  cost: number;
  purchasedAt: string;
  expiresAt: string | null;
  neverExpires: boolean;
  isActive: boolean;
}

interface RolloverRecord {
  id: string;
  hours: number;
  hoursRemaining: number;
  expiresAt: string;
  sourceMonth: string;
}

interface Plan {
  id: string;
  tier: string;
  status: string;
  supportHoursIncluded: number;
  supportHoursUsed: number;
  changeRequestsIncluded: number;
  changeRequestsUsed: number;
  onDemandEnabled: boolean;
  createdAt: string;
  project: {
    id: string;
    name: string;
    status: string;
    organization: {
      id: string;
      name: string | null;
      email: string | null;
    };
  };
  hourPacks: HourPack[];
  rolloverRecords: RolloverRecord[];
  monthlyRemaining: number;
  packHoursTotal: number;
  rolloverHoursTotal: number;
  totalAvailable: number;
}

interface Stats {
  totalPlans: number;
  totalHoursAvailable: number;
  totalHoursUsed: number;
  totalHourPacks: number;
  expiringHours: number;
}

interface HoursOverviewClientProps {
  plans: Plan[];
  stats: Stats;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function formatHours(hours: number): string {
  if (Number.isInteger(hours)) return hours.toString();
  return hours.toFixed(1);
}

function getHealthColor(available: number, included: number): string {
  if (included === 0) return 'text-gray-400';
  const percent = (available / included) * 100;
  if (percent >= 80) return 'text-green-400';
  if (percent >= 40) return 'text-yellow-400';
  return 'text-red-400';
}

function getHealthIcon(available: number, included: number) {
  if (included === 0) return Clock;
  const percent = (available / included) * 100;
  if (percent >= 80) return CheckCircle;
  if (percent >= 40) return AlertTriangle;
  return AlertTriangle;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function HoursOverviewClient({ plans, stats }: HoursOverviewClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'hours' | 'usage'>('hours');

  // Get unique tiers
  const tiers = useMemo(() => {
    const uniqueTiers = new Set(plans.map(p => p.tier));
    return Array.from(uniqueTiers).sort();
  }, [plans]);

  // Filter and sort plans
  const filteredPlans = useMemo(() => {
    let filtered = plans.filter(plan => {
      const matchesSearch = plan.project.organization.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plan.project.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTier = filterTier === 'all' || plan.tier === filterTier;
      const matchesStatus = filterStatus === 'all' || plan.status === filterStatus;
      return matchesSearch && matchesTier && matchesStatus;
    });

    // Sort
    if (sortBy === 'name') {
      filtered.sort((a, b) => 
        (a.project.organization.name || a.project.name).localeCompare(
          b.project.organization.name || b.project.name
        )
      );
    } else if (sortBy === 'hours') {
      filtered.sort((a, b) => b.totalAvailable - a.totalAvailable);
    } else if (sortBy === 'usage') {
      filtered.sort((a, b) => {
        const aPercent = a.supportHoursIncluded > 0 ? (a.supportHoursUsed / a.supportHoursIncluded) : 0;
        const bPercent = b.supportHoursIncluded > 0 ? (b.supportHoursUsed / b.supportHoursIncluded) : 0;
        return bPercent - aPercent;
      });
    }

    return filtered;
  }, [plans, searchQuery, filterTier, filterStatus, sortBy]);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Clock className="w-8 h-8 text-cyan-400" />
          Hours & Packages Management
        </h1>
        <p className="text-gray-400">
          Overview of all client hours, packages, and maintenance plans
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-gray-900/40 border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-gray-400">Active Plans</span>
          </div>
          <div className="text-3xl font-bold text-white">{stats.totalPlans}</div>
        </div>

        <div className="bg-gray-900/40 border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-green-400" />
            <span className="text-sm text-gray-400">Hours Available</span>
          </div>
          <div className="text-3xl font-bold text-green-400">
            {formatHours(stats.totalHoursAvailable)}
          </div>
        </div>

        <div className="bg-gray-900/40 border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            <span className="text-sm text-gray-400">Hours Used</span>
          </div>
          <div className="text-3xl font-bold text-purple-400">
            {formatHours(stats.totalHoursUsed)}
          </div>
        </div>

        <div className="bg-gray-900/40 border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Package className="w-5 h-5 text-yellow-400" />
            <span className="text-sm text-gray-400">Hour Packs</span>
          </div>
          <div className="text-3xl font-bold text-yellow-400">
            {stats.totalHourPacks}
          </div>
        </div>

        <div className="bg-gray-900/40 border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span className="text-sm text-gray-400">Expiring Soon</span>
          </div>
          <div className="text-3xl font-bold text-red-400">
            {formatHours(stats.expiringHours)}
          </div>
          <p className="text-xs text-gray-500 mt-1">Next 30 days</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-900/40 border border-white/10 rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>

          {/* Tier Filter */}
          <select
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          >
            <option value="all">All Tiers</option>
            {tiers.map(tier => (
              <option key={tier} value={tier}>{tier}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          >
            <option value="all">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING">Pending</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          >
            <option value="hours">Sort by Hours</option>
            <option value="name">Sort by Name</option>
            <option value="usage">Sort by Usage</option>
          </select>
        </div>
      </div>

      {/* Plans Table */}
      <div className="bg-gray-900/40 border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Client</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Tier</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Monthly</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Rollover</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Packs</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Total</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Usage</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredPlans.map((plan) => {
                const HealthIcon = getHealthIcon(plan.totalAvailable, plan.supportHoursIncluded);
                const healthColor = getHealthColor(plan.totalAvailable, plan.supportHoursIncluded);
                const usagePercent = plan.supportHoursIncluded > 0
                  ? Math.round((plan.supportHoursUsed / plan.supportHoursIncluded) * 100)
                  : 0;

                return (
                  <tr key={plan.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-medium">
                          {plan.project.organization.name || plan.project.name}
                        </p>
                        <p className="text-sm text-gray-400">{plan.project.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {plan.tier}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white">
                        {formatHours(plan.monthlyRemaining)}
                        <span className="text-gray-500 text-sm"> / {formatHours(plan.supportHoursIncluded)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-purple-400">
                      {formatHours(plan.rolloverHoursTotal)}
                    </td>
                    <td className="px-6 py-4 text-green-400">
                      {formatHours(plan.packHoursTotal)}
                      {plan.hourPacks.length > 0 && (
                        <span className="text-gray-500 text-xs ml-1">({plan.hourPacks.length})</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className={`flex items-center gap-2 font-bold ${healthColor}`}>
                        <HealthIcon className="w-4 h-4" />
                        {formatHours(plan.totalAvailable)}h
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              usagePercent >= 100 ? 'bg-red-500' :
                              usagePercent >= 80 ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(100, usagePercent)}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-400 w-12 text-right">
                          {usagePercent}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 text-xs ${
                        plan.status === 'ACTIVE' ? 'text-green-400' : 'text-gray-400'
                      }`}>
                        {plan.status === 'ACTIVE' && <CheckCircle className="w-3 h-3" />}
                        {plan.status}
                      </span>
                      {plan.onDemandEnabled && (
                        <span className="ml-2 inline-flex items-center gap-1 text-xs text-yellow-400">
                          <Zap className="w-3 h-3" />
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/clients/${plan.project.organization.id || plan.project.id}?tab=hours`}
                        className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-sm"
                      >
                        Manage
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredPlans.length === 0 && (
            <div className="p-12 text-center">
              <Clock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">No plans found</p>
              <p className="text-sm text-gray-500">
                Try adjusting your filters
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <Package className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
          <div>
            <h4 className="text-white font-semibold mb-2">
              About Hours Management
            </h4>
            <ul className="text-sm text-gray-300 space-y-2">
              <li>
                • Monthly hours reset at the end of each billing period
              </li>
              <li>
                • Unused monthly hours roll over (max 50% of monthly allocation)
              </li>
              <li>
                • Hour packs are purchased separately and have expiration dates
              </li>
              <li>
                • Hours are deducted in order: Monthly → Rollover → Packs → On-Demand
              </li>
              <li>
                • On-demand billing allows clients to exceed their limits at an hourly rate
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
