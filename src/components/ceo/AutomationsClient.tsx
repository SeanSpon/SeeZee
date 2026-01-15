"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Zap,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Code,
  Play,
  Pause,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface WebhookEvent {
  id: string;
  type: string;
  status: string;
  payload: any;
  createdAt: Date;
}

interface WebhookStats {
  total: number;
  successful: number;
  failed: number;
  byType: Record<string, number>;
}

interface Integration {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  webhooksReceived: number;
}

interface AutomationsClientProps {
  webhookEvents: WebhookEvent[];
  webhookStats: WebhookStats;
  integrations: Integration[];
}

export function AutomationsClient({
  webhookEvents,
  webhookStats,
  integrations,
}: AutomationsClientProps) {
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "SUCCESS" | "FAILED">("all");

  // Filter events
  const filteredEvents = webhookEvents.filter((event) => {
    if (filter === "all") return true;
    return event.status === filter;
  });

  // Calculate success rate
  const successRate =
    webhookStats.total > 0
      ? (webhookStats.successful / webhookStats.total) * 100
      : 0;

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
          Automations & Webhooks
        </h1>
        <p className="text-gray-400 mt-2">
          Monitor integrations, webhooks, and automated workflows
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          icon={<Activity className="w-6 h-6" />}
          label="Total Events"
          value={webhookStats.total}
          color="blue"
        />
        <StatCard
          icon={<CheckCircle className="w-6 h-6" />}
          label="Successful"
          value={webhookStats.successful}
          color="green"
        />
        <StatCard
          icon={<AlertCircle className="w-6 h-6" />}
          label="Failed"
          value={webhookStats.failed}
          color="red"
        />
        <div className="glass-card p-6 rounded-xl border border-white/10">
          <div className="inline-flex p-3 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 mb-3">
            <Zap className="w-6 h-6" />
          </div>
          <p className="text-3xl font-bold text-white mb-1">
            {successRate.toFixed(1)}%
          </p>
          <p className="text-sm text-gray-400">Success Rate</p>
          <div className="mt-3 w-full h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-300"
              style={{ width: `${successRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Active Integrations */}
      <div className="glass-card p-6 rounded-xl border border-white/10">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Zap className="w-6 h-6 text-yellow-400" />
          Active Integrations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {integrations.map((integration) => (
            <motion.div
              key={integration.id}
              whileHover={{ scale: 1.02 }}
              className="p-6 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <Code className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {integration.name}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {integration.description}
                    </p>
                  </div>
                </div>
                {integration.enabled ? (
                  <span className="px-2 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium">
                    Active
                  </span>
                ) : (
                  <span className="px-2 py-1 rounded-full bg-gray-500/10 border border-gray-500/20 text-gray-400 text-xs font-medium">
                    Inactive
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Events Received</span>
                <span className="text-white font-bold text-lg">
                  {integration.webhooksReceived}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Event Types Breakdown */}
      <div className="glass-card p-6 rounded-xl border border-white/10">
        <h2 className="text-2xl font-bold text-white mb-6">Event Types</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(webhookStats.byType).map(([type, count]) => (
            <div
              key={type}
              className="p-4 rounded-lg bg-white/5 border border-white/5"
            >
              <div className="flex items-center justify-between">
                <span className="text-gray-300 font-mono text-sm">{type}</span>
                <span className="text-white font-bold">{count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Webhook Events */}
      <div className="glass-card p-6 rounded-xl border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-400" />
            Recent Webhook Events
          </h2>
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Events</option>
            <option value="SUCCESS">Successful</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>

        <div className="space-y-2">
          {filteredEvents.length === 0 && (
            <div className="text-center py-12">
              <Activity className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No webhook events yet</p>
              <p className="text-sm text-gray-500 mt-2">
                Events will appear here as your integrations send data
              </p>
            </div>
          )}

          {filteredEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className={`rounded-lg border ${
                event.status === "SUCCESS"
                  ? "bg-green-500/5 border-green-500/20"
                  : "bg-red-500/5 border-red-500/20"
              }`}
            >
              <button
                onClick={() =>
                  setExpandedEvent(expandedEvent === event.id ? null : event.id)
                }
                className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors rounded-lg"
              >
                <div className="flex items-center gap-4">
                  {event.status === "SUCCESS" ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  )}
                  
                  <div className="text-left">
                    <p className="text-white font-medium font-mono text-sm">
                      {event.type}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {new Date(event.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {expandedEvent === event.id ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {expandedEvent === event.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-4 pb-4"
                >
                  <div className="p-4 rounded-lg bg-black/20 border border-white/5">
                    <p className="text-xs text-gray-400 mb-2">Payload:</p>
                    <pre className="text-xs text-gray-300 font-mono overflow-x-auto">
                      {JSON.stringify(event.payload, null, 2)}
                    </pre>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {filteredEvents.length > 0 && (
          <p className="text-center text-gray-500 text-sm mt-4">
            Showing {filteredEvents.length} of {webhookEvents.length} events
          </p>
        )}
      </div>

      {/* Coming Soon: Automation Rules */}
      <div className="glass-card p-8 rounded-xl border border-white/10 text-center">
        <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mb-4">
          <Zap className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">
          Custom Automation Rules
        </h3>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Build custom workflows and automation rules to automatically respond to
          webhook events, trigger actions, and streamline your operations.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-6 px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold shadow-lg shadow-purple-500/20"
        >
          Coming Soon
        </motion.button>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  const colorClasses = {
    blue: "from-blue-500 to-cyan-500",
    green: "from-green-500 to-emerald-500",
    red: "from-red-500 to-rose-500",
    yellow: "from-yellow-500 to-orange-500",
  };

  return (
    <div className="glass-card p-6 rounded-xl border border-white/10">
      <div
        className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${
          colorClasses[color as keyof typeof colorClasses]
        } mb-3`}
      >
        {icon}
      </div>
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  );
}
