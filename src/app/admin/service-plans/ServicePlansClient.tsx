"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { StatCard } from "@/components/admin/StatCard";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { NONPROFIT_TIERS } from "@/lib/config/tiers";
import {
  Wrench,
  Clock,
  CheckCircle,
  TrendingUp,
  Package,
  AlertTriangle,
  Users,
  Search,
  ArrowRight,
  Zap,
} from "lucide-react";

// =============================================================================
// TYPES
// =============================================================================

type MaintenancePlan = {
  id: string;
  tier: string;
  monthlyPrice: number | string;
  status: string;
  supportHoursIncluded: number;
  supportHoursUsed: number;
  changeRequestsIncluded: number;
  changeRequestsUsed: number;
  createdAt: string;
  project: {
    id: string;
    name: string;
    description: string | null;
    status: string;
    organization: {
      id: string;
      name: string;
      email: string | null;
    };
  } | null;
};

type ChangeRequest = {
  id: string;
  description: string;
  status: string;
  category: string;
  priority: string;
  estimatedHours: number | null;
  urgencyFee: number;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  project: {
    id: string;
    name: string;
    status: string;
    organization: {
      id: string;
      name: string;
    };
  };
  subscription: {
    id: string;
    planName: string | null;
    status: string;
  } | null;
};

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

interface HoursPlan {
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

interface HoursStats {
  totalPlans: number;
  totalHoursAvailable: number;
  totalHoursUsed: number;
  totalHourPacks: number;
  expiringHours: number;
}

interface ServicePlansClientProps {
  plans: MaintenancePlan[];
  schedules: any[];
  changeRequests: ChangeRequest[];
  stats: {
    activePlans: number;
    pending: number;
    resolvedThisWeek: number;
    avgResponseTime: string;
  };
  hoursPlans: HoursPlan[];
  hoursStats: HoursStats;
}

// =============================================================================
// HELPERS
// =============================================================================

const changeRequestStatusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  approved: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  in_progress: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  completed: "bg-green-500/20 text-green-400 border-green-500/30",
  rejected: "bg-red-500/20 text-red-400 border-red-500/30",
};

const priorityColors: Record<string, string> = {
  LOW: "text-slate-400",
  NORMAL: "text-blue-400",
  HIGH: "text-yellow-400",
  URGENT: "text-orange-400",
  EMERGENCY: "text-red-400",
};

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

export function ServicePlansClient({
  plans,
  schedules,
  changeRequests,
  stats,
  hoursPlans,
  hoursStats,
}: ServicePlansClientProps) {
  const router = useRouter();
  const [updating, setUpdating] = useState<string | null>(null);
  const [localChangeRequests, setLocalChangeRequests] = useState(changeRequests);

  // Hours tab state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'hours' | 'usage'>('hours');

  const tiers = useMemo(() => {
    const uniqueTiers = new Set(hoursPlans.map(p => p.tier));
    return Array.from(uniqueTiers).sort();
  }, [hoursPlans]);

  const filteredHoursPlans = useMemo(() => {
    let filtered = hoursPlans.filter(plan => {
      const matchesSearch = plan.project.organization.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plan.project.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTier = filterTier === 'all' || plan.tier === filterTier;
      return matchesSearch && matchesTier;
    });

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
  }, [hoursPlans, searchQuery, filterTier, sortBy]);

  const handleChangeRequestStatusUpdate = async (changeRequestId: string, newStatus: string) => {
    setUpdating(changeRequestId);
    try {
      const response = await fetch(`/api/admin/requests/${changeRequestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setLocalChangeRequests((prev) =>
          prev.map((cr) => (cr.id === changeRequestId ? { ...cr, status: newStatus } : cr))
        );
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to update change request status:', error);
    } finally {
      setUpdating(null);
    }
  };

  // Change request columns
  const changeRequestColumns: Column<ChangeRequest>[] = [
    {
      key: "project",
      label: "Client",
      sortable: true,
      render: (cr) => (
        <div>
          <div className="font-medium text-white">{cr.project.name}</div>
          <div className="text-xs text-slate-400">{cr.project.organization.name}</div>
        </div>
      ),
    },
    {
      key: "description",
      label: "Request",
      sortable: true,
      render: (cr) => {
        const lines = cr.description.split('\n');
        const title = lines[0] || cr.description.substring(0, 50);
        const preview = lines.slice(1).join(' ').substring(0, 100) || cr.description.substring(50, 150);
        return (
          <div>
            <div className="font-medium text-white">{title}</div>
            {preview && (
              <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">{preview}</div>
            )}
          </div>
        );
      },
    },
    {
      key: "category",
      label: "Category",
      render: (cr) => (
        <span className="text-xs text-slate-300 capitalize">
          {cr.category.toLowerCase().replace('_', ' ')}
        </span>
      ),
    },
    {
      key: "priority",
      label: "Priority",
      render: (cr) => (
        <span className={`text-xs font-medium ${priorityColors[cr.priority] || priorityColors.NORMAL}`}>
          {cr.priority}
        </span>
      ),
    },
    {
      key: "estimatedHours",
      label: "Hours",
      render: (cr) => (
        <span className="text-sm text-slate-300">
          {cr.estimatedHours ? `${cr.estimatedHours}h` : '\u2014'}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (cr) => (
        <select
          value={cr.status}
          onChange={(e) => {
            e.stopPropagation();
            handleChangeRequestStatusUpdate(cr.id, e.target.value);
          }}
          onClick={(e) => e.stopPropagation()}
          disabled={updating === cr.id}
          className={`
            px-2 py-1 rounded-full text-xs font-medium border
            bg-transparent cursor-pointer
            ${changeRequestStatusColors[cr.status] || changeRequestStatusColors.pending}
            ${updating === cr.id ? "opacity-50 cursor-wait" : ""}
          `}
          style={{ zIndex: 10, position: 'relative' }}
        >
          <option value="pending" style={{ backgroundColor: '#1e293b', color: '#fbbf24' }}>Pending</option>
          <option value="approved" style={{ backgroundColor: '#1e293b', color: '#60a5fa' }}>Approved</option>
          <option value="in_progress" style={{ backgroundColor: '#1e293b', color: '#a78bfa' }}>In Progress</option>
          <option value="completed" style={{ backgroundColor: '#1e293b', color: '#34d399' }}>Completed</option>
          <option value="rejected" style={{ backgroundColor: '#1e293b', color: '#f87171' }}>Rejected</option>
        </select>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (cr) => (
        <div className="text-sm text-slate-300">
          {new Date(cr.createdAt).toLocaleDateString()}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Service Plans</h1>
        <p className="admin-page-subtitle">
          Plans, hours, and change requests
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Active Plans"
          value={stats.activePlans}
          icon={<Wrench className="w-5 h-5" />}
        />
        <StatCard
          label="Pending Requests"
          value={stats.pending}
          icon={<Clock className="w-5 h-5" />}
        />
        <StatCard
          label="Resolved This Week"
          value={stats.resolvedThisWeek}
          icon={<CheckCircle className="w-5 h-5" />}
        />
        <StatCard
          label="Avg Response Time"
          value={stats.avgResponseTime}
          icon={<TrendingUp className="w-5 h-5" />}
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="plans">
        <TabsList>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="hours">Hours</TabsTrigger>
          <TabsTrigger value="change-requests">Change Requests</TabsTrigger>
        </TabsList>

        {/* ============ Plans Tab ============ */}
        <TabsContent value="plans">
          <div className="space-y-4">
            {plans.filter(plan => plan.project).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {plans.filter(plan => plan.project).map((plan) => (
                  <div
                    key={plan.id}
                    className="bg-seezee-card-bg border border-white/10 rounded-xl p-4 text-left cursor-pointer hover:border-white/20 transition-all"
                    onClick={() => router.push(`/admin/projects/${plan.project!.id}`)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-white">{plan.project!.name}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${
                        plan.status === 'ACTIVE'
                          ? 'bg-seezee-green/20 text-seezee-green border-seezee-green/30'
                          : plan.status === 'PENDING'
                          ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                          : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                      }`}>
                        {plan.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mb-2">{plan.project!.organization.name}</p>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Tier:</span>
                        <span className="text-white font-medium">
                          {NONPROFIT_TIERS[plan.tier as keyof typeof NONPROFIT_TIERS]?.shortName || plan.tier}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Monthly:</span>
                        <span className="text-seezee-green font-medium">
                          ${(Number(plan.monthlyPrice) / 100).toFixed(0)}/mo
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Hours:</span>
                        <span className="text-slate-300">
                          {plan.supportHoursUsed}/{plan.supportHoursIncluded} used
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Change Requests:</span>
                        <span className="text-slate-300">
                          {plan.changeRequestsUsed}/{plan.changeRequestsIncluded} used
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Created:</span>
                        <span className="text-slate-400 text-xs">
                          {new Date(plan.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wrench className="w-8 h-8 text-slate-600" />
                </div>
                <p className="text-slate-500 text-lg mb-2">No maintenance plans yet</p>
                <p className="text-slate-600 text-sm">
                  Maintenance plans will appear here once clients sign up
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ============ Hours Tab ============ */}
        <TabsContent value="hours">
          <div className="space-y-6">
            {/* Hours Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-gray-900/40 border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  <span className="text-sm text-gray-400">Active Plans</span>
                </div>
                <div className="text-3xl font-bold text-white">{hoursStats.totalPlans}</div>
              </div>

              <div className="bg-gray-900/40 border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-5 h-5 text-green-400" />
                  <span className="text-sm text-gray-400">Hours Available</span>
                </div>
                <div className="text-3xl font-bold text-green-400">
                  {formatHours(hoursStats.totalHoursAvailable)}
                </div>
              </div>

              <div className="bg-gray-900/40 border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                  <span className="text-sm text-gray-400">Hours Used</span>
                </div>
                <div className="text-3xl font-bold text-purple-400">
                  {formatHours(hoursStats.totalHoursUsed)}
                </div>
              </div>

              <div className="bg-gray-900/40 border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Package className="w-5 h-5 text-yellow-400" />
                  <span className="text-sm text-gray-400">Hour Packs</span>
                </div>
                <div className="text-3xl font-bold text-yellow-400">
                  {hoursStats.totalHourPacks}
                </div>
              </div>

              <div className="bg-gray-900/40 border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <span className="text-sm text-gray-400">Expiring Soon</span>
                </div>
                <div className="text-3xl font-bold text-red-400">
                  {formatHours(hoursStats.expiringHours)}
                </div>
                <p className="text-xs text-gray-500 mt-1">Next 30 days</p>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-gray-900/40 border border-white/10 rounded-xl p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

            {/* Hours Table */}
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
                    {filteredHoursPlans.map((plan) => {
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
                            {plan.project.organization?.id ? (
                              <Link
                                href={`/admin/clients/${plan.project.organization.id}?tab=hours`}
                                className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-sm"
                              >
                                Manage
                                <ArrowRight className="w-3 h-3" />
                              </Link>
                            ) : (
                              <span className="text-gray-500 text-sm">No org</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {filteredHoursPlans.length === 0 && (
                  <div className="p-12 text-center">
                    <Clock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 mb-2">No plans found</p>
                    <p className="text-sm text-gray-500">Try adjusting your filters</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ============ Change Requests Tab ============ */}
        <TabsContent value="change-requests">
          <DataTable
            data={localChangeRequests}
            columns={changeRequestColumns}
            searchPlaceholder="Search change requests..."
            onRowClick={(cr) => router.push(`/admin/projects/${cr.project.id}`)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
