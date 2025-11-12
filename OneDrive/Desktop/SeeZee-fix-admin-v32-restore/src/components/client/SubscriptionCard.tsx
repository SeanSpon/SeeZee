"use client";

import { useState } from "react";
import { CreditCard, Calendar, Package, ChevronDown, ChevronUp, ExternalLink, Check, Clock, XCircle } from "lucide-react";
import { getSubscriptionPlanByName, formatSubscriptionPrice } from "@/lib/subscriptionPlans";

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

interface SubscriptionCardProps {
  subscription: Subscription;
}

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-500/20 text-green-400 border-green-500/30",
  past_due: "bg-red-500/20 text-red-400 border-red-500/30",
  canceled: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  incomplete: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  past_due: "Past Due",
  canceled: "Canceled",
  incomplete: "Incomplete",
};

const CHANGE_REQUEST_STATUS_ICONS: Record<string, JSX.Element> = {
  pending: <Clock className="w-4 h-4 text-yellow-400" />,
  approved: <Check className="w-4 h-4 text-blue-400" />,
  completed: <Check className="w-4 h-4 text-green-400" />,
  rejected: <XCircle className="w-4 h-4 text-red-400" />,
};

export function SubscriptionCard({ subscription }: SubscriptionCardProps) {
  const [showChangeRequests, setShowChangeRequests] = useState(false);

  const plan = getSubscriptionPlanByName(subscription.planName);
  const changeRequestsRemaining = subscription.changeRequestsAllowed - subscription.changeRequestsUsed;
  const usagePercentage = (subscription.changeRequestsUsed / subscription.changeRequestsAllowed) * 100;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleManageSubscription = async () => {
    // Redirect to Stripe billing portal
    try {
      const response = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId: subscription.stripeId }),
      });
      
      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      }
    } catch (error) {
      console.error('Failed to open billing portal:', error);
    }
  };

  return (
    <div className="bg-gray-900/40 border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-colors">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-white mb-1">{subscription.projectName}</h3>
            <p className="text-sm text-gray-400">{subscription.planName}</p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium border ${
              STATUS_COLORS[subscription.status] || STATUS_COLORS.incomplete
            }`}
          >
            {STATUS_LABELS[subscription.status] || subscription.status}
          </span>
        </div>

        {plan && (
          <div className="text-2xl font-bold text-white">
            {formatSubscriptionPrice(plan.price, plan.billingCycle)}
          </div>
        )}
      </div>

      {/* Billing Info */}
      <div className="p-6 border-b border-white/10 space-y-4">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-gray-400" />
          <div className="flex-1">
            <div className="text-sm text-gray-400">Next Billing Date</div>
            <div className="text-white font-medium">{formatDate(subscription.currentPeriodEnd)}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <CreditCard className="w-5 h-5 text-gray-400" />
          <div className="flex-1">
            <div className="text-sm text-gray-400">Subscription ID</div>
            <div className="text-white font-mono text-sm">{subscription.stripeId.substring(0, 20)}...</div>
          </div>
        </div>
      </div>

      {/* Change Requests */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-400" />
            <span className="text-sm font-medium text-white">Change Requests</span>
          </div>
          <div className="text-sm">
            <span className={`font-bold ${changeRequestsRemaining > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {changeRequestsRemaining}
            </span>
            <span className="text-gray-400"> / {subscription.changeRequestsAllowed} remaining</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-800 rounded-full h-2 mb-2">
          <div
            className={`h-2 rounded-full transition-all ${
              usagePercentage >= 100 ? 'bg-red-500' : usagePercentage >= 75 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
          />
        </div>

        {subscription.resetDate && (
          <div className="text-xs text-gray-500">
            Resets on {formatDate(subscription.resetDate)}
          </div>
        )}

        {/* Toggle Change Requests History */}
        {subscription.changeRequests.length > 0 && (
          <button
            onClick={() => setShowChangeRequests(!showChangeRequests)}
            className="mt-4 flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            {showChangeRequests ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Hide Request History
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                View Request History ({subscription.changeRequests.length})
              </>
            )}
          </button>
        )}

        {/* Change Requests List */}
        {showChangeRequests && subscription.changeRequests.length > 0 && (
          <div className="mt-4 space-y-2">
            {subscription.changeRequests.map((cr) => (
              <div
                key={cr.id}
                className="bg-gray-800/50 border border-white/5 rounded-lg p-3 text-sm"
              >
                <div className="flex items-start gap-2">
                  {CHANGE_REQUEST_STATUS_ICONS[cr.status]}
                  <div className="flex-1">
                    <div className="text-white">{cr.description}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatDate(cr.createdAt)}
                      {cr.status === 'completed' && cr.completedAt && (
                        <> • Completed {formatDate(cr.completedAt)}</>
                      )}
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300 capitalize">
                    {cr.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-6">
        <button
          onClick={handleManageSubscription}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Manage Subscription
        </button>
      </div>
    </div>
  );
}



