"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FiUser,
  FiActivity,
  FiSettings,
  FiFileText,
  FiRefreshCw,
  FiAlertTriangle,
  FiClock,
  FiExternalLink,
  FiGitPullRequest,
  FiTerminal,
  FiTruck,
  FiAward,
} from "react-icons/fi";

// ==================
// Types
// ==================

interface NodeRun {
  id: string;
  status: "RUNNING" | "DONE" | "FAILED" | "NEEDS_ANSWER";
  prUrl: string | null;
  previewUrl: string | null;
  branchName: string;
  startedAt: string;
  completedAt: string | null;
}

interface WorkflowNode {
  id: string;
  name: string;
  type: string;
  status: "ONLINE" | "BUSY" | "OFFLINE" | "ERROR";
  capabilities: Record<string, boolean>;
  metadata: Record<string, unknown>;
  lastHeartbeatAt: string | null;
  currentJobId: string | null;
  totalRuns: number;
  recentRuns: NodeRun[];
  createdAt: string;
}

interface RunDetail {
  id: string;
  status: string;
  branchName: string;
  prUrl: string | null;
  previewUrl: string | null;
  errorMessage: string | null;
  summary: string | null;
  questions: Record<string, unknown> | string | null;
  answers: Record<string, unknown> | string | null;
  startedAt: string;
  completedAt: string | null;
  logCount: number;
  node: { id: string; name: string; type: string };
  request: {
    id: string;
    repoUrl: string;
    branchName: string;
    priority: string;
    status: string;
    todo: { id: string; title: string; description: string | null; status: string; priority: string };
  };
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: string;
  message: string;
  truncated: boolean;
}

// ==================
// Dispatch Theme Helpers
// ==================

function crewStatus(status: string) {
  switch (status) {
    case "ONLINE":
      return { label: "On Shift", color: "text-emerald-400", bg: "border-emerald-500/40 bg-emerald-500/15", dot: "bg-emerald-400 shadow-lg shadow-emerald-400/50", emoji: "🟢" };
    case "BUSY":
      return { label: "En Route", color: "text-amber-400", bg: "border-amber-500/40 bg-amber-500/15", dot: "bg-amber-400 shadow-lg shadow-amber-400/50 animate-pulse", emoji: "🚌" };
    case "OFFLINE":
      return { label: "Off Duty", color: "text-slate-500", bg: "border-slate-500/40 bg-slate-500/15", dot: "bg-slate-600", emoji: "💤" };
    case "ERROR":
      return { label: "Breakdown", color: "text-red-400", bg: "border-red-500/40 bg-red-500/15", dot: "bg-red-500 shadow-lg shadow-red-500/50 animate-pulse", emoji: "⚠️" };
    default:
      return { label: status, color: "text-slate-400", bg: "border-slate-500/40 bg-slate-500/15", dot: "bg-slate-600", emoji: "" };
  }
}

function tripStatus(status: string) {
  switch (status) {
    case "RUNNING":
      return { label: "🚌 En Route", color: "text-blue-400", border: "border-l-blue-500" };
    case "DONE":
      return { label: "📦 Delivered", color: "text-emerald-400", border: "border-l-emerald-500" };
    case "FAILED":
      return { label: "🔥 Broke Down", color: "text-red-400", border: "border-l-red-500" };
    case "NEEDS_ANSWER":
      return { label: "📢 Asking HQ", color: "text-amber-400", border: "border-l-amber-500" };
    default:
      return { label: status, color: "text-slate-400", border: "border-l-slate-500" };
  }
}

function getInitials(name: string): string {
  return name
    .split(/[-_\s]+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function avatarGradient(status: string): string {
  switch (status) {
    case "ONLINE": return "from-emerald-500 to-emerald-700";
    case "BUSY": return "from-red-500 to-red-700";
    case "OFFLINE": return "from-slate-600 to-slate-800";
    case "ERROR": return "from-red-600 to-red-900";
    default: return "from-slate-600 to-slate-800";
  }
}

function timeAgo(date: string | null): string {
  if (!date) return "Never";
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

// Mini bus SVG inline
function BusChip({ smoking = false, size = "sm" }: { smoking?: boolean; size?: "sm" | "md" }) {
  const h = size === "sm" ? "h-5 w-9" : "h-7 w-12";
  return (
    <div className={`${h} relative flex-shrink-0`}>
      <div className={`${h} bg-gradient-to-b from-red-500 to-red-700 rounded-[4px] flex items-center justify-center border border-red-400/30`}>
        <span className={`font-black text-white/90 tracking-wider ${size === "sm" ? "text-[7px]" : "text-[9px]"}`}>BRB</span>
      </div>
      <div className="absolute -bottom-[2px] left-[3px] w-[5px] h-[5px] rounded-full bg-slate-800 border border-slate-600" />
      <div className="absolute -bottom-[2px] right-[3px] w-[5px] h-[5px] rounded-full bg-slate-800 border border-slate-600" />
      {smoking && <span className="absolute -top-3 -right-1 text-[10px] animate-bounce opacity-70">💨</span>}
    </div>
  );
}

// ==================
// Component
// ==================

export default function NodesClient() {
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [activeTab, setActiveTab] = useState<"routes" | "blackbox" | "idcard">("routes");
  const [nodeRuns, setNodeRuns] = useState<RunDetail[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [requeuing, setRequeuing] = useState(false);

  // Fetch nodes
  const fetchNodes = useCallback(async () => {
    try {
      const res = await fetch("/api/ceo/nodes");
      if (!res.ok) throw new Error("Failed to fetch nodes");
      const data = await res.json();
      setNodes(data.nodes);
      if (selectedNode) {
        const updated = data.nodes.find((n: WorkflowNode) => n.id === selectedNode.id);
        if (updated) setSelectedNode(updated);
      }
    } catch (err) {
      console.error("Failed to fetch nodes:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedNode]);

  // Fetch runs for selected node
  const fetchRuns = useCallback(async (nodeId: string) => {
    try {
      const res = await fetch(`/api/ceo/runs?nodeId=${nodeId}&limit=20`);
      if (!res.ok) return;
      const data = await res.json();
      setNodeRuns(data.runs);
    } catch (err) {
      console.error("Failed to fetch runs:", err);
    }
  }, []);

  // Fetch logs for selected run
  const fetchLogs = useCallback(async (runId: string) => {
    try {
      const res = await fetch(`/api/runs/${runId}/log?limit=200`);
      if (!res.ok) return;
      const data = await res.json();
      setLogs(data.logs);
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    }
  }, []);

  // Handle stale claim recovery
  const handleRequeueStale = async () => {
    setRequeuing(true);
    try {
      const res = await fetch("/api/ceo/maintenance/requeue-stale", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        alert(`Recovered ${data.requeued} stalled buses`);
        fetchNodes();
      }
    } catch (err) {
      console.error("Requeue failed:", err);
    } finally {
      setRequeuing(false);
    }
  };

  // Initial fetch + polling
  useEffect(() => {
    fetchNodes();
    const interval = setInterval(fetchNodes, 15000);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch runs when node changes
  useEffect(() => {
    if (selectedNode && activeTab === "routes") {
      fetchRuns(selectedNode.id);
    }
  }, [selectedNode, activeTab, fetchRuns]);

  // Fetch logs when run changes
  useEffect(() => {
    if (selectedRunId && activeTab === "blackbox") {
      fetchLogs(selectedRunId);
      const interval = setInterval(() => fetchLogs(selectedRunId), 5000);
      return () => clearInterval(interval);
    }
  }, [selectedRunId, activeTab, fetchLogs]);

  const onlineCount = nodes.filter((n) => n.status === "ONLINE" || n.status === "BUSY").length;
  const busyCount = nodes.filter((n) => n.status === "BUSY").length;

  const tabs = [
    { key: "routes" as const, label: "Routes", icon: FiTruck, emoji: "📋" },
    { key: "blackbox" as const, label: "Black Box", icon: FiTerminal, emoji: "📦" },
    { key: "idcard" as const, label: "ID Card", icon: FiSettings, emoji: "🪪" },
  ];

  return (
    <div className="flex h-[calc(100vh-220px)] gap-4">
      {/* ============================= */}
      {/* LEFT: Crew Roster */}
      {/* ============================= */}
      <div className="w-80 flex-shrink-0 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden flex flex-col">
        {/* Roster Header */}
        <div className="border-b border-white/10 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">👷</span>
              <span className="text-sm font-bold text-white tracking-wide">CREW ROSTER</span>
            </div>
            <button
              onClick={() => fetchNodes()}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Refresh crew"
            >
              <FiRefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
          {/* Quick Stats */}
          <div className="flex items-center gap-3 mt-2 text-[10px]">
            <span className="text-emerald-400">{onlineCount} active</span>
            <span className="text-slate-600">•</span>
            <span className="text-amber-400">{busyCount} driving</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-500">{nodes.length} total</span>
          </div>
        </div>

        {/* Worker Cards */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-red-500" />
              <span className="text-xs text-slate-500">Loading crew…</span>
            </div>
          ) : nodes.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <span className="text-4xl block mb-3">🏗️</span>
              <p className="text-sm text-slate-400 font-medium">The yard is quiet</p>
              <p className="mt-1 text-xs text-slate-600">
                No crew clocked in. Run{" "}
                <code className="text-slate-400 bg-white/5 px-1 rounded">npm run seed:node</code> to recruit.
              </p>
            </div>
          ) : (
            nodes.map((node) => {
              const crew = crewStatus(node.status);
              const isSelected = selectedNode?.id === node.id;
              return (
                <button
                  key={node.id}
                  onClick={() => {
                    setSelectedNode(node);
                    setSelectedRunId(null);
                    setActiveTab("routes");
                  }}
                  className={`w-full text-left px-4 py-3 border-b border-white/5 transition-all hover:bg-white/5 ${
                    isSelected ? "bg-white/10 border-l-2 border-l-red-500" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Worker Avatar */}
                    <div className="relative flex-shrink-0">
                      <div
                        className={`h-10 w-10 rounded-full bg-gradient-to-br ${avatarGradient(node.status)} flex items-center justify-center border-2 border-white/20`}
                      >
                        <span className="text-xs font-bold text-white">{getInitials(node.name)}</span>
                      </div>
                      <div
                        className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0a1128] ${crew.dot}`}
                      />
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white truncate">{node.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${crew.bg} ${crew.color}`}>
                          {crew.emoji} {crew.label}
                        </span>
                        <span className="text-[10px] text-slate-600">{node.type}</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-[10px] text-slate-400 flex items-center gap-1 justify-end">
                        <FiTruck className="h-3 w-3" />
                        {node.totalRuns}
                      </p>
                      <p className="text-[10px] text-slate-600 mt-0.5">{timeAgo(node.lastHeartbeatAt)}</p>
                    </div>
                  </div>

                  {/* Current Job Indicator */}
                  {node.status === "BUSY" && node.currentJobId && (
                    <div className="mt-2 flex items-center gap-2 pl-[52px]">
                      <BusChip />
                      <span className="text-[10px] text-amber-400/80 truncate">
                        Route active…
                      </span>
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ============================= */}
      {/* RIGHT: Worker Inspector */}
      {/* ============================= */}
      <div className="flex-1 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden flex flex-col">
        {selectedNode ? (
          <>
            {/* Inspector Header */}
            <div className="border-b border-white/10 px-5 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Big Avatar */}
                  <div className="relative">
                    <div
                      className={`h-14 w-14 rounded-full bg-gradient-to-br ${avatarGradient(selectedNode.status)} flex items-center justify-center border-2 border-white/20 shadow-lg`}
                    >
                      <span className="text-lg font-bold text-white">{getInitials(selectedNode.name)}</span>
                    </div>
                    <div
                      className={`absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-[#0a1128] ${crewStatus(selectedNode.status).dot}`}
                    />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">{selectedNode.name}</h2>
                    <p className="text-xs text-slate-400">
                      {selectedNode.type} • Last seen {timeAgo(selectedNode.lastHeartbeatAt)}
                    </p>
                  </div>
                </div>
                {/* Status Chip */}
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${crewStatus(selectedNode.status).bg} ${crewStatus(selectedNode.status).color}`}>
                  {crewStatus(selectedNode.status).emoji} {crewStatus(selectedNode.status).label}
                </span>
              </div>

              {/* Quick Stat Bar */}
              <div className="flex items-center gap-4 mt-3 text-xs">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <FiTruck className="h-3.5 w-3.5" />
                  <span className="text-white font-semibold">{selectedNode.totalRuns}</span> trips
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <FiActivity className="h-3.5 w-3.5" />
                  <span className="text-white font-semibold">{selectedNode.recentRuns.length}</span> recent
                </div>
                {selectedNode.currentJobId && (
                  <div className="flex items-center gap-1.5 text-amber-400">
                    <BusChip />
                    <span className="font-mono text-[10px]">{selectedNode.currentJobId.slice(0, 10)}…</span>
                  </div>
                )}
              </div>

              {/* Tabs */}
              <div className="flex gap-1 mt-3">
                {tabs.map(({ key, label, icon: Icon, emoji }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      activeTab === key
                        ? "bg-red-500/15 border border-red-500/30 text-white"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <span className="text-[11px]">{emoji}</span>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-5">
              {/* ===== ROUTES TAB ===== */}
              {activeTab === "routes" && (
                <div className="space-y-3">
                  {nodeRuns.length === 0 ? (
                    <div className="text-center py-10">
                      <span className="text-4xl block mb-3">🅿️</span>
                      <p className="text-sm text-slate-400">No dispatches yet</p>
                      <p className="text-xs text-slate-600 mt-1">This driver hasn&apos;t been assigned any routes</p>
                    </div>
                  ) : (
                    nodeRuns.map((run) => {
                      const trip = tripStatus(run.status);
                      return (
                        <div
                          key={run.id}
                          className={`rounded-xl border border-white/10 bg-white/[0.03] p-4 hover:bg-white/[0.06] transition-colors border-l-[3px] ${trip.border}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 min-w-0 flex-1">
                              <BusChip smoking={run.status === "FAILED"} />
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-white truncate">
                                  {run.request.todo.title}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={`text-[10px] font-bold ${trip.color}`}>
                                    {trip.label}
                                  </span>
                                  <span className="text-[10px] text-slate-600">•</span>
                                  <span className="text-[10px] text-slate-500 font-mono truncate">
                                    {run.branchName}
                                  </span>
                                </div>
                                {run.errorMessage && (
                                  <p className="mt-1.5 text-xs text-red-400/90 line-clamp-2 bg-red-500/5 rounded px-2 py-1">
                                    <FiAlertTriangle className="inline h-3 w-3 mr-1" />
                                    Damage Report: {run.errorMessage}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              {run.prUrl && (
                                <a
                                  href={run.prUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                                  title="Inspect Cargo (PR)"
                                >
                                  <FiGitPullRequest className="h-3 w-3" />
                                  PR
                                </a>
                              )}
                              {run.previewUrl && (
                                <a
                                  href={run.previewUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-colors"
                                  title="Preview Route"
                                >
                                  <FiExternalLink className="h-3 w-3" />
                                  Preview
                                </a>
                              )}
                              <button
                                onClick={() => {
                                  setSelectedRunId(run.id);
                                  setActiveTab("blackbox");
                                }}
                                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                                title="View Black Box"
                              >
                                <FiFileText className="h-3 w-3" />
                                Logs
                              </button>
                            </div>
                          </div>

                          {/* Trip Meta */}
                          <div className="flex items-center gap-3 mt-2.5 pl-12 text-[10px] text-slate-500">
                            <span className="flex items-center gap-1">
                              <FiClock className="h-3 w-3" />
                              {timeAgo(run.startedAt)}
                            </span>
                            <span>{run.logCount} logs</span>
                            <span className="uppercase font-medium text-slate-600">{run.request.priority}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* ===== BLACK BOX TAB ===== */}
              {activeTab === "blackbox" && (
                <div>
                  {!selectedRunId ? (
                    <div className="text-center py-10">
                      <span className="text-4xl block mb-3">📦</span>
                      <p className="text-sm text-slate-400">Select a route to read its black box</p>
                      <p className="text-xs text-slate-600 mt-1">Click &quot;Logs&quot; on any route card</p>
                    </div>
                  ) : (
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs text-slate-400">
                          📦 Black Box — Run <span className="font-mono text-slate-300">{selectedRunId.slice(0, 8)}…</span>
                        </p>
                        <button
                          onClick={() => fetchLogs(selectedRunId)}
                          className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                        >
                          <FiRefreshCw className="h-3 w-3" /> Refresh
                        </button>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-black/50 p-3 font-mono text-xs max-h-[500px] overflow-y-auto">
                        {logs.length === 0 ? (
                          <p className="text-slate-600">No telemetry recorded…</p>
                        ) : (
                          logs.map((log) => (
                            <div key={log.id} className="flex gap-2 py-0.5 hover:bg-white/5 px-1 rounded">
                              <span className="text-slate-600 flex-shrink-0">
                                {new Date(log.timestamp).toLocaleTimeString()}
                              </span>
                              <span
                                className={`flex-shrink-0 w-12 ${
                                  log.level === "error"
                                    ? "text-red-400"
                                    : log.level === "warn"
                                      ? "text-amber-400"
                                      : "text-slate-500"
                                }`}
                              >
                                [{log.level}]
                              </span>
                              <span
                                className={`${
                                  log.level === "error" ? "text-red-300" : "text-slate-300"
                                } break-all`}
                              >
                                {log.message}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ===== ID CARD TAB ===== */}
              {activeTab === "idcard" && (
                <div className="space-y-4">
                  {/* Certifications (Capabilities) */}
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                      <FiAward className="h-4 w-4 text-amber-400" />
                      Certifications
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedNode.capabilities && typeof selectedNode.capabilities === "object" ? (
                        Object.entries(selectedNode.capabilities).map(([key, val]) => (
                          <span
                            key={key}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${
                              val
                                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                                : "border-slate-500/30 bg-slate-500/10 text-slate-500 line-through"
                            }`}
                          >
                            {val ? "✅" : "❌"} {key}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500">No certifications on file</span>
                      )}
                    </div>
                  </div>

                  {/* Personnel File */}
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                      <FiUser className="h-4 w-4 text-blue-400" />
                      Personnel File
                    </h3>
                    <div className="space-y-2.5 text-xs">
                      {[
                        { label: "Employee ID", value: selectedNode.id },
                        { label: "Role", value: selectedNode.type },
                        { label: "Total Trips", value: String(selectedNode.totalRuns) },
                        { label: "Current Route", value: selectedNode.currentJobId ? selectedNode.currentJobId.slice(0, 12) + "…" : "None" },
                        { label: "Recruited", value: new Date(selectedNode.createdAt).toLocaleDateString() },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between items-center py-1 border-b border-white/5 last:border-0">
                          <span className="text-slate-500">{label}</span>
                          <span className="font-mono text-slate-300">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recovery Dispatch */}
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                      🔧 Recovery Dispatch
                    </h3>
                    <p className="text-xs text-slate-500 mb-3">
                      Find buses stuck in traffic and bring them back to the yard.
                    </p>
                    <button
                      onClick={handleRequeueStale}
                      disabled={requeuing}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-colors disabled:opacity-50"
                    >
                      <FiRefreshCw className={`h-3.5 w-3.5 ${requeuing ? "animate-spin" : ""}`} />
                      {requeuing ? "Recovering…" : "🚨 Recover Stalled Buses"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <span className="text-5xl block mb-4">🚌</span>
              <p className="text-lg font-bold text-white">Dispatch Yard</p>
              <p className="mt-1 text-sm text-slate-400">Select a crew member to inspect</p>
              <p className="mt-1 text-xs text-slate-600">
                View routes, black box data, and ID cards
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
