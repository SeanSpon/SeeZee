/**
 * 🚌 AI CONTROL CENTER
 * /admin/ai-control
 * 
 * Monitor autonomous AI workers in real-time:
 * - See what the AI is coding right now
 * - Watch logs stream in
 * - Track success/fail rates
 * - Control the bus
 */

"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

interface ExecutionRun {
  id: string;
  status: "PENDING" | "RUNNING" | "SUCCESS" | "FAILED" | "CANCELED";
  branchName: string;
  prUrl: string | null;
  errorMessage: string | null;
  summary: string | null;
  startedAt: string;
  completedAt: string | null;
  node: {
    id: string;
    name: string;
    type: string;
  };
  request: {
    id: string;
    todo: {
      id: string;
      title: string;
      description: string | null;
    };
    repoUrl: string;
  };
  logs: Array<{
    id: string;
    timestamp: string;
    level: string;
    message: string;
  }>;
}

export default function AIControlCenter() {
  const [runs, setRuns] = useState<ExecutionRun[]>([]);
  const [selectedRun, setSelectedRun] = useState<ExecutionRun | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    running: 0,
    success: 0,
    failed: 0,
    total: 0,
  });

  useEffect(() => {
    fetchRuns();
    const interval = setInterval(fetchRuns, 5000); // Refresh every 5s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedRun) {
      fetchLogs(selectedRun.id);
      const interval = setInterval(() => fetchLogs(selectedRun.id), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedRun]);

  async function fetchRuns() {
    try {
      const res = await fetch("/api/admin/ai-runs");
      const data = await res.json();
      setRuns(data.runs || []);
      setStats(data.stats || { running: 0, success: 0, failed: 0, total: 0 });
    } catch (error) {
      console.error("Failed to fetch runs:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchLogs(runId: string) {
    try {
      const res = await fetch(`/api/runs/${runId}/logs`);
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "SUCCESS":
        return "text-green-400 bg-green-400/10 border-green-400/20";
      case "RUNNING":
        return "text-blue-400 bg-blue-400/10 border-blue-400/20 animate-pulse";
      case "FAILED":
        return "text-red-400 bg-red-400/10 border-red-400/20";
      default:
        return "text-gray-400 bg-gray-400/10 border-gray-400/20";
    }
  }

  function getLogColor(level: string) {
    switch (level) {
      case "error":
        return "text-red-400";
      case "warn":
        return "text-yellow-400";
      case "info":
        return "text-blue-400";
      default:
        return "text-gray-400";
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            🚌 AI Control Center
          </h1>
          <p className="text-gray-400">
            Monitor autonomous AI workers in real-time
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="text-3xl font-bold">{stats.total}</div>
            <div className="text-sm text-gray-400">Total Runs</div>
          </div>
          <div className="backdrop-blur-lg bg-blue-400/10 border border-blue-400/20 rounded-xl p-6">
            <div className="text-3xl font-bold text-blue-400 animate-pulse">
              {stats.running}
            </div>
            <div className="text-sm text-gray-400">Running Now</div>
          </div>
          <div className="backdrop-blur-lg bg-green-400/10 border border-green-400/20 rounded-xl p-6">
            <div className="text-3xl font-bold text-green-400">{stats.success}</div>
            <div className="text-sm text-gray-400">Success</div>
          </div>
          <div className="backdrop-blur-lg bg-red-400/10 border border-red-400/20 rounded-xl p-6">
            <div className="text-3xl font-bold text-red-400">{stats.failed}</div>
            <div className="text-sm text-gray-400">Failed</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* Runs List */}
          <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">Active & Recent Runs</h2>
            {loading ? (
              <div className="text-gray-400">Loading...</div>
            ) : runs.length === 0 ? (
              <div className="text-gray-400 py-8 text-center">
                No runs yet. Start a worker with: <br />
                <code className="bg-black/50 px-2 py-1 rounded mt-2 inline-block">
                  npm run worker:bus
                </code>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {runs.map((run) => (
                  <div
                    key={run.id}
                    onClick={() => setSelectedRun(run)}
                    className={`bg-black/50 border rounded-lg p-4 cursor-pointer hover:border-white/30 transition-colors ${
                      selectedRun?.id === run.id
                        ? "border-blue-400/50"
                        : "border-white/10"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm mb-1">
                          {run.request.todo.title}
                        </h3>
                        <div className="text-xs text-gray-400">
                          {run.node.name} • {run.branchName}
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold border ${getStatusColor(
                          run.status
                        )}`}
                      >
                        {run.status}
                      </span>
                    </div>
                    {run.prUrl && (
                      <a
                        href={run.prUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View PR →
                      </a>
                    )}
                    {run.errorMessage && (
                      <div className="text-xs text-red-400 mt-2 truncate">
                        Error: {run.errorMessage}
                      </div>
                    )}
                    <div className="text-xs text-gray-500 mt-2">
                      {new Date(run.startedAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Logs Panel */}
          <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">
              {selectedRun ? "Live Logs" : "Select a run to view logs"}
            </h2>
            {selectedRun ? (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                <div className="bg-black/50 border border-white/10 rounded-lg p-4 mb-4">
                  <div className="text-sm font-semibold mb-2">
                    {selectedRun.request.todo.title}
                  </div>
                  {selectedRun.request.todo.description && (
                    <div className="text-xs text-gray-400 mb-2">
                      {selectedRun.request.todo.description}
                    </div>
                  )}
                  <div className="text-xs text-gray-500">
                    Run ID: {selectedRun.id}
                  </div>
                </div>

                {logs.length === 0 ? (
                  <div className="text-gray-400 text-sm">No logs yet...</div>
                ) : (
                  logs.map((log) => (
                    <div
                      key={log.id}
                      className="bg-black/50 border border-white/10 rounded p-3 font-mono text-xs"
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-gray-500 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                        <span className={`font-bold ${getLogColor(log.level)}`}>
                          [{log.level.toUpperCase()}]
                        </span>
                        <span className="flex-1 text-gray-300 break-words">
                          {log.message}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="text-gray-400 text-center py-20">
                👈 Select a run from the left to see logs
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 backdrop-blur-lg bg-blue-400/5 border border-blue-400/20 rounded-xl p-6">
          <h3 className="text-lg font-bold mb-2">🚀 How to Run The Bus</h3>
          <pre className="text-sm bg-black/50 p-4 rounded border border-white/10 overflow-x-auto">
{`# 1. Create a node and get API key
npm run seed:node -- --name "AI Bus" --type AI_AGENT

# 2. Add to .env.local:
NODE_API_KEY=node_xxx.secret
ANTHROPIC_API_KEY=sk-ant-xxx
GITHUB_TOKEN=ghp_xxx

# 3. Start the bus:
npm run worker:bus

# Watch this dashboard to see AI coding in real-time! 🔥`}
          </pre>
        </div>
      </div>
    </div>
  );
}
