"use client";

import { useState } from "react";
import { SubscriptionCard } from "./SubscriptionCard";
import { CreditCard, Package, AlertCircle } from "lucide-react";

interface ChangeRequest {
  id: string;
  description: string;
  status: string;
  createdAt: string;
  completedAt: string | null;
}

interface Subscription {
  id: string;
  projectId: string;
  projectName: string;
  stripeId: string;
  priceId: string;
  status: string;
  planName: string;
  currentPeriodEnd: string | null;
  changeRequestsAllowed: number;
  changeRequestsUsed: number;
  resetDate: string | null;
  createdAt: string;
  changeRequests: ChangeRequest[];
}

interface SubscriptionsClientProps {
  subscriptions: Subscription[];
}

export function SubscriptionsClient({ subscriptions }: SubscriptionsClientProps) {
  const [filter, setFilter] = useState<'all' | 'active' | 'past_due'>('all');

  const activeSubscriptions = subscriptions.filter((s) => s.status === 'active');
  const pastDueSubscriptions = subscriptions.filter((s) => s.status === 'past_due');

  const filteredSubscriptions =
    filter === 'all'
      ? subscriptions
      : filter === 'active'
      ? activeSubscriptions
      : pastDueSubscriptions;

  if (subscriptions.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">My Subscriptions</h1>
        </div>

        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md">
            <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">No Active Subscriptions</h2>
            <p className="text-gray-400 mb-6">
              You don't have any active subscriptions yet. Subscriptions are created when your project goes live.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">My Subscriptions</h1>
          <p className="text-gray-400">
            Manage your monthly subscriptions and view remaining change requests
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            All ({subscriptions.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'active'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Active ({activeSubscriptions.length})
          </button>
          {pastDueSubscriptions.length > 0 && (
            <button
              onClick={() => setFilter('past_due')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'past_due'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Past Due ({pastDueSubscriptions.length})
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900/40 border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <CreditCard className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-gray-400">Active Subscriptions</span>
          </div>
          <div className="text-3xl font-bold text-white">{activeSubscriptions.length}</div>
        </div>

        <div className="bg-gray-900/40 border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Package className="w-5 h-5 text-green-400" />
            <span className="text-sm text-gray-400">Total Change Requests</span>
          </div>
          <div className="text-3xl font-bold text-white">
            {subscriptions.reduce((sum, s) => sum + s.changeRequestsUsed, 0)} /{' '}
            {subscriptions.reduce((sum, s) => sum + s.changeRequestsAllowed, 0)}
          </div>
        </div>

        {pastDueSubscriptions.length > 0 && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-sm text-red-400">Needs Attention</span>
            </div>
            <div className="text-3xl font-bold text-red-400">{pastDueSubscriptions.length}</div>
          </div>
        )}
      </div>

      {/* Subscriptions List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredSubscriptions.map((subscription) => (
          <SubscriptionCard key={subscription.id} subscription={subscription} />
        ))}
      </div>
    </div>
  );
}



