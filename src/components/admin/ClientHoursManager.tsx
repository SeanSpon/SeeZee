'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  Plus,
  Edit,
  Trash2,
  Package,
  Calendar,
  DollarSign,
  AlertCircle,
  Check,
  X,
  TrendingUp,
  Gift,
  RefreshCw,
  History,
  Zap,
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
  stripePaymentId: string | null;
}

interface MaintenancePlan {
  id: string;
  tier: string;
  status: string;
  supportHoursIncluded: number;
  supportHoursUsed: number;
  changeRequestsIncluded: number;
  changeRequestsUsed: number;
  onDemandEnabled: boolean;
  hourPacks: HourPack[];
  rolloverRecords: any[];
}

interface Project {
  id: string;
  name: string;
  status: string;
}

interface ClientHoursManagerProps {
  clientId: string;
  clientName: string;
  projects: Project[];
  initialPlan?: MaintenancePlan | null;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const PACK_TYPES = [
  { value: 'SMALL', label: 'Starter Pack', hours: 5, color: 'blue' },
  { value: 'MEDIUM', label: 'Growth Pack', hours: 10, color: 'green' },
  { value: 'LARGE', label: 'Scale Pack', hours: 20, color: 'purple' },
  { value: 'PREMIUM', label: 'Premium Reserve', hours: 40, color: 'yellow' },
  { value: 'COMPLIMENTARY', label: 'Complimentary', hours: 0, color: 'cyan' },
  { value: 'CUSTOM', label: 'Custom', hours: 0, color: 'gray' },
];

const EXPIRATION_OPTIONS = [
  { value: null, label: 'Never Expires' },
  { value: 30, label: '30 Days' },
  { value: 60, label: '60 Days' },
  { value: 90, label: '90 Days' },
  { value: 180, label: '180 Days' },
  { value: 365, label: '1 Year' },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function formatHours(hours: number): string {
  if (Number.isInteger(hours)) return hours.toString();
  return hours.toFixed(1);
}

function formatDate(date: string | null): string {
  if (!date) return 'Never';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

function getPackColor(packType: string): string {
  const pack = PACK_TYPES.find(p => p.value === packType);
  return pack?.color || 'gray';
}

// =============================================================================
// COMPONENT
// =============================================================================

export function ClientHoursManager({
  clientId,
  clientName,
  projects,
  initialPlan,
}: ClientHoursManagerProps) {
  const [plan, setPlan] = useState<MaintenancePlan | null>(initialPlan || null);
  const [selectedProject, setSelectedProject] = useState<string>(projects[0]?.id || '');
  const [loading, setLoading] = useState(false);
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedPackForAdjust, setSelectedPackForAdjust] = useState<HourPack | null>(null);
  
  // Grant hours form
  const [grantForm, setGrantForm] = useState({
    hours: 10,
    packType: 'COMPLIMENTARY',
    expirationDays: null as number | null,
    cost: 0,
    notes: '',
  });
  
  // Adjust hours form
  const [adjustForm, setAdjustForm] = useState({
    adjustment: 0,
    reason: '',
  });

  // Calculate totals
  const totalHoursAvailable = plan 
    ? (plan.supportHoursIncluded - plan.supportHoursUsed) + 
      plan.hourPacks.reduce((sum, pack) => sum + pack.hoursRemaining, 0)
    : 0;
  
  const monthlyRemaining = plan 
    ? Math.max(0, plan.supportHoursIncluded - plan.supportHoursUsed)
    : 0;
  
  const packHoursTotal = plan
    ? plan.hourPacks.reduce((sum, pack) => sum + pack.hoursRemaining, 0)
    : 0;

  useEffect(() => {
    if (selectedProject) {
      fetchPlan();
    }
  }, [selectedProject]);

  const fetchPlan = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/clients/${clientId}/hours?projectId=${selectedProject}`);
      if (response.ok) {
        const data = await response.json();
        setPlan(data.plan);
      }
    } catch (error) {
      console.error('Failed to fetch plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGrantHours = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/clients/${clientId}/hours/grant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProject,
          ...grantForm,
        }),
      });

      if (response.ok) {
        await fetchPlan();
        setShowGrantModal(false);
        setGrantForm({
          hours: 10,
          packType: 'COMPLIMENTARY',
          expirationDays: null,
          cost: 0,
          notes: '',
        });
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to grant hours');
      }
    } catch (error) {
      console.error('Failed to grant hours:', error);
      alert('Failed to grant hours');
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustHours = async () => {
    if (!selectedPackForAdjust) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/clients/${clientId}/hours/adjust`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hourPackId: selectedPackForAdjust.id,
          ...adjustForm,
        }),
      });

      if (response.ok) {
        await fetchPlan();
        setShowAdjustModal(false);
        setSelectedPackForAdjust(null);
        setAdjustForm({ adjustment: 0, reason: '' });
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to adjust hours');
      }
    } catch (error) {
      console.error('Failed to adjust hours:', error);
      alert('Failed to adjust hours');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Clock className="w-7 h-7 text-cyan-400" />
            Hours Management
          </h2>
          <p className="text-gray-400 mt-1">{clientName}</p>
        </div>
        <button
          onClick={() => setShowGrantModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg flex items-center gap-2 hover:from-cyan-600 hover:to-blue-600 transition-all"
        >
          <Plus className="w-4 h-4" />
          Grant Hours
        </button>
      </div>

      {/* Project Selector */}
      {projects.length > 1 && (
        <div className="bg-gray-900/40 border border-white/10 rounded-xl p-4">
          <label className="block text-sm text-gray-400 mb-2">Select Project</label>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="w-full px-4 py-2 bg-gray-900 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          >
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name} ({project.status})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900/40 border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-gray-400">Monthly Hours</span>
          </div>
          <div className="text-3xl font-bold text-blue-400">
            {formatHours(monthlyRemaining)}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {plan ? `${formatHours(plan.supportHoursUsed)} used of ${formatHours(plan.supportHoursIncluded)}` : 'No plan'}
          </p>
        </div>

        <div className="bg-gray-900/40 border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Package className="w-5 h-5 text-green-400" />
            <span className="text-sm text-gray-400">Hour Packs</span>
          </div>
          <div className="text-3xl font-bold text-green-400">
            {formatHours(packHoursTotal)}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {plan?.hourPacks.filter(p => p.isActive).length || 0} active packs
          </p>
        </div>

        <div className="bg-gray-900/40 border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            <span className="text-sm text-gray-400">Total Available</span>
          </div>
          <div className="text-3xl font-bold text-white">
            {formatHours(totalHoursAvailable)}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {plan?.onDemandEnabled ? 'On-demand enabled' : 'Fixed hours only'}
          </p>
        </div>
      </div>

      {/* Plan Info */}
      {plan && (
        <div className="bg-gray-900/40 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Plan Details</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-400">Tier</p>
              <p className="text-white font-medium mt-1">{plan.tier}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Status</p>
              <p className={`font-medium mt-1 ${
                plan.status === 'ACTIVE' ? 'text-green-400' : 'text-gray-400'
              }`}>
                {plan.status}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Change Requests</p>
              <p className="text-white font-medium mt-1">
                {plan.changeRequestsUsed} / {plan.changeRequestsIncluded}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">On-Demand</p>
              <p className={`font-medium mt-1 ${
                plan.onDemandEnabled ? 'text-green-400' : 'text-gray-400'
              }`}>
                {plan.onDemandEnabled ? 'Enabled' : 'Disabled'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Hour Packs Table */}
      <div className="bg-gray-900/40 border border-white/10 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-green-400" />
            Hour Packs
          </h3>
        </div>
        
        {plan?.hourPacks && plan.hourPacks.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Remaining</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Cost</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Purchased</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Expires</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {plan.hourPacks.map((pack) => (
                  <tr key={pack.id} className="hover:bg-white/5">
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-${getPackColor(pack.packType)}-500/10 text-${getPackColor(pack.packType)}-400 border border-${getPackColor(pack.packType)}-500/20`}>
                        {pack.packType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white">{formatHours(pack.hours)}h</td>
                    <td className="px-6 py-4">
                      <span className={`font-medium ${
                        pack.hoursRemaining === 0 ? 'text-gray-500' :
                        pack.hoursRemaining < pack.hours * 0.2 ? 'text-yellow-400' :
                        'text-white'
                      }`}>
                        {formatHours(pack.hoursRemaining)}h
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {pack.cost === 0 ? 'Free' : formatCurrency(pack.cost)}
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {formatDate(pack.purchasedAt)}
                    </td>
                    <td className="px-6 py-4">
                      {pack.neverExpires ? (
                        <span className="text-green-400 text-sm">Never</span>
                      ) : pack.expiresAt ? (
                        <span className={`text-sm ${
                          new Date(pack.expiresAt) < new Date() ? 'text-red-400' :
                          new Date(pack.expiresAt) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) ? 'text-yellow-400' :
                          'text-gray-400'
                        }`}>
                          {formatDate(pack.expiresAt)}
                        </span>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {pack.isActive ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-400">
                          <Check className="w-3 h-3" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                          <X className="w-3 h-3" />
                          Used
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {pack.isActive && (
                        <button
                          onClick={() => {
                            setSelectedPackForAdjust(pack);
                            setShowAdjustModal(true);
                          }}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                          title="Adjust hours"
                        >
                          <Edit className="w-4 h-4 text-gray-400" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No hour packs yet</p>
            <button
              onClick={() => setShowGrantModal(true)}
              className="mt-4 text-cyan-400 hover:text-cyan-300 text-sm"
            >
              Grant first hour pack
            </button>
          </div>
        )}
      </div>

      {/* Grant Hours Modal */}
      {showGrantModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowGrantModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-900 border border-white/10 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Gift className="w-6 h-6 text-cyan-400" />
                  Grant Hours
                </h3>
                <button
                  onClick={() => setShowGrantModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Hours */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Hours to Grant</label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={grantForm.hours}
                  onChange={(e) => setGrantForm({ ...grantForm, hours: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
              </div>

              {/* Pack Type */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Pack Type</label>
                <select
                  value={grantForm.packType}
                  onChange={(e) => setGrantForm({ ...grantForm, packType: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                >
                  {PACK_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Expiration */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Expiration</label>
                <select
                  value={grantForm.expirationDays || ''}
                  onChange={(e) => setGrantForm({ 
                    ...grantForm, 
                    expirationDays: e.target.value ? parseInt(e.target.value) : null 
                  })}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                >
                  {EXPIRATION_OPTIONS.map((option) => (
                    <option key={String(option.value)} value={option.value || ''}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cost */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Cost (USD)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={grantForm.cost / 100}
                  onChange={(e) => setGrantForm({ 
                    ...grantForm, 
                    cost: Math.round((parseFloat(e.target.value) || 0) * 100)
                  })}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Notes (Optional)</label>
                <textarea
                  value={grantForm.notes}
                  onChange={(e) => setGrantForm({ ...grantForm, notes: e.target.value })}
                  rows={3}
                  placeholder="Reason for granting hours..."
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowGrantModal(false)}
                  className="flex-1 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGrantHours}
                  disabled={loading || grantForm.hours <= 0}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Granting...
                    </>
                  ) : (
                    <>
                      <Gift className="w-4 h-4" />
                      Grant Hours
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Adjust Hours Modal */}
      {showAdjustModal && selectedPackForAdjust && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowAdjustModal(false);
            setSelectedPackForAdjust(null);
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-900 border border-white/10 rounded-2xl max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Edit className="w-6 h-6 text-cyan-400" />
                  Adjust Hours
                </h3>
                <button
                  onClick={() => {
                    setShowAdjustModal(false);
                    setSelectedPackForAdjust(null);
                  }}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Current Pack Info */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-2">Current Pack</p>
                <p className="text-white font-medium">{selectedPackForAdjust.packType}</p>
                <p className="text-sm text-gray-400 mt-1">
                  {formatHours(selectedPackForAdjust.hoursRemaining)} hours remaining of {formatHours(selectedPackForAdjust.hours)}
                </p>
              </div>

              {/* Adjustment */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Adjustment (positive to add, negative to remove)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={adjustForm.adjustment}
                  onChange={(e) => setAdjustForm({ ...adjustForm, adjustment: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
                {adjustForm.adjustment !== 0 && (
                  <p className={`text-sm mt-2 ${adjustForm.adjustment > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    New total: {formatHours(selectedPackForAdjust.hoursRemaining + adjustForm.adjustment)} hours
                  </p>
                )}
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Reason</label>
                <textarea
                  value={adjustForm.reason}
                  onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                  rows={3}
                  placeholder="Why are you adjusting these hours?"
                  className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowAdjustModal(false);
                    setSelectedPackForAdjust(null);
                  }}
                  className="flex-1 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdjustHours}
                  disabled={loading || adjustForm.adjustment === 0}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Adjusting...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Adjust Hours
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
