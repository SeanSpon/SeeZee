"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FiGitPullRequest,
  FiExternalLink,
  FiRefreshCw,
  FiAlertTriangle,
  FiClock,
  FiFilter,
  FiSend,
  FiX,
  FiRotateCcw,
} from "react-icons/fi";

// ==================
// Types
// ==================

interface InboxItem {
  id: string;
  status: "DONE" | "FAILED" | "NEEDS_ANSWER";
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
  todo: {
    id: string;
    title: string;
    description: string | null;
    priority: string;
  };
  request: {
    id: string;
    repoUrl: string;
    priority: string;
    todoId: string;
  };
}

interface InboxCounts {
  total: number;
  done: number;
  failed: number;
  needsAnswer: number;
}

// ==================
// Return Bay Helpers
// ==================

function bayStatus(status: string) {
  switch (status) {
    case "DONE":
      return {
        label: "Cargo Ready",
        emoji: "✅",
        color: "text-emerald-400",
        border: "border-l-emerald-500",
        bg: "bg-emerald-500/5",
        iconBg: "bg-emerald-500/15 border-emerald-500/30",
      };
    case "FAILED":
      return {
        label: "Broke Down",
        emoji: "🔥",
        color: "text-red-400",
        border: "border-l-red-500",
        bg: "bg-red-500/5",
        iconBg: "bg-red-500/15 border-red-500/30",
      };
    case "NEEDS_ANSWER":
      return {
        label: "Driver Asking HQ",
        emoji: "📢",
        color: "text-amber-400",
        border: "border-l-amber-500",
        bg: "bg-amber-500/5",
        iconBg: "bg-amber-500/15 border-amber-500/30",
      };
    default:
      return {
        label: status,
        emoji: "❓",
        color: "text-slate-400",
        border: "border-l-slate-500",
        bg: "bg-slate-500/5",
        iconBg: "bg-slate-500/15 border-slate-500/30",
      };
  }
}

function priorityTag(priority: string) {
  switch (priority) {
    case "URGENT": return "text-red-400 bg-red-500/10 border-red-500/20";
    case "HIGH": return "text-orange-400 bg-orange-500/10 border-orange-500/20";
    case "MEDIUM": return "text-blue-400 bg-blue-500/10 border-blue-500/20";
    default: return "text-slate-400 bg-slate-500/10 border-slate-500/20";
  }
}

function timeAgo(date: string | null) {
  if (!date) return "—";
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

// Mini bus chip (matches NodesClient)
function BusChip({ smoking = false }: { smoking?: boolean }) {
  return (
    <div className="h-5 w-9 relative flex-shrink-0">
      <div className="h-5 w-9 bg-gradient-to-b from-red-500 to-red-700 rounded-[4px] flex items-center justify-center border border-red-400/30">
        <span className="text-[7px] font-black text-white/90 tracking-wider">BRB</span>
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

export default function InboxClient() {
  const [items, setItems] = useState<InboxItem[]>([]);
  const [counts, setCounts] = useState<InboxCounts>({ total: 0, done: 0, failed: 0, needsAnswer: 0 });
  const [filter, setFilter] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<InboxItem | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState<string | null>(null);
  const [answering, setAnswering] = useState(false);

  const fetchInbox = useCallback(async () => {
    try {
      const res = await fetch(`/api/ceo/inbox?filter=${filter}`);
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setItems(data.inbox);
      setCounts(data.counts);
    } catch (err) {
      console.error("Failed to fetch inbox:", err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    setLoading(true);
    fetchInbox();
    const interval = setInterval(fetchInbox, 30000);
    return () => clearInterval(interval);
  }, [fetchInbox]);

  const handleRetry = async (item: InboxItem) => {
    setRetrying(item.id);
    try {
      const res = await fetch("/api/tasks/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          todoIds: [item.todo.id],
          repoUrl: item.request.repoUrl,
          priority: item.request.priority,
        }),
      });
      if (res.ok) {
        fetchInbox();
      }
    } catch (err) {
      console.error("Retry failed:", err);
    } finally {
      setRetrying(null);
    }
  };

  const handleAnswer = async (runId: string) => {
    if (!answerText.trim()) return;
    setAnswering(true);
    try {
      const res = await fetch(`/api/runs/${runId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: { response: answerText } }),
      });
      if (res.ok) {
        setAnswerText("");
        setSelectedItem(null);
        fetchInbox();
      }
    } catch (err) {
      console.error("Answer failed:", err);
    } finally {
      setAnswering(false);
    }
  };

  const filters = [
    { key: "all", label: "All Bays", count: counts.total, emoji: "🏗️" },
    { key: "done", label: "Cargo Ready", count: counts.done, emoji: "✅" },
    { key: "failed", label: "Wrecks", count: counts.failed, emoji: "🔥" },
    { key: "needs_answer", label: "Radio", count: counts.needsAnswer, emoji: "📢" },
  ];

  return (
    <div className="space-y-4">
      {/* Bay Selector Tabs */}
      <div className="flex items-center gap-2">
        <FiFilter className="h-4 w-4 text-slate-500" />
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
              filter === f.key
                ? "bg-red-500/15 text-white border-red-500/30"
                : "text-slate-400 border-transparent hover:text-white hover:bg-white/5"
            }`}
          >
            <span className="text-[11px]">{f.emoji}</span>
            {f.label}
            {f.count > 0 && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  filter === f.key ? "bg-red-500/30 text-red-300" : "bg-white/10 text-slate-400"
                }`}
              >
                {f.count}
              </span>
            )}
          </button>
        ))}
        <div className="flex-1" />
        <button
          onClick={() => fetchInbox()}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Refresh bays"
        >
          <FiRefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Bus Cards */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-red-500" />
          <span className="text-xs text-slate-500">Scanning return bays…</span>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
          <span className="text-5xl block mb-4">🅿️</span>
          <p className="text-sm font-semibold text-slate-300">Return bay is empty</p>
          <p className="mt-1 text-xs text-slate-600">
            Buses will pull in here when they finish their routes
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const bay = bayStatus(item.status);
            const isSelected = selectedItem?.id === item.id;

            return (
              <div
                key={item.id}
                className={`rounded-xl border bg-white/[0.03] backdrop-blur-sm transition-all border-l-[3px] ${bay.border} ${
                  isSelected ? "border-r-white/20 border-t-white/20 border-b-white/20 bg-white/[0.06]" : "border-r-white/10 border-t-white/10 border-b-white/10 hover:bg-white/[0.06]"
                }`}
              >
                {/* Main Bus Card */}
                <div className="px-5 py-4">
                  <div className="flex items-start gap-4">
                    {/* Bus Visual */}
                    <div className="mt-1 flex flex-col items-center gap-1">
                      <BusChip smoking={item.status === "FAILED"} />
                      <span className="text-[9px] text-slate-600 font-mono">
                        {item.node.name.slice(0, 6)}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      {/* Header Row */}
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${bay.iconBg} ${bay.color}`}>
                          {bay.emoji} {bay.label}
                        </span>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${priorityTag(item.request.priority)}`}>
                          {item.request.priority}
                        </span>
                      </div>

                      {/* Mission Title */}
                      <h3 className="text-sm font-bold text-white truncate">
                        {item.todo.title}
                      </h3>

                      {/* Route */}
                      <p className="text-[10px] text-slate-500 mt-0.5 font-mono">
                        Route: {item.branchName}
                      </p>

                      {/* Summary (Cargo Manifest) */}
                      {item.summary && (
                        <div className="mt-2 px-3 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                          <p className="text-[10px] text-emerald-500 font-bold mb-0.5">📋 Cargo Manifest</p>
                          <p className="text-xs text-slate-400 line-clamp-2">{item.summary}</p>
                        </div>
                      )}

                      {/* Error (Damage Report) */}
                      {item.errorMessage && (
                        <div className="mt-2 px-3 py-2 rounded-lg bg-red-500/5 border border-red-500/10">
                          <p className="text-[10px] text-red-400 font-bold mb-0.5">
                            <FiAlertTriangle className="inline h-3 w-3 mr-1" />
                            Damage Report
                          </p>
                          <p className="text-xs text-red-400/80 line-clamp-2">{item.errorMessage}</p>
                        </div>
                      )}

                      {/* Questions (Radio Message) */}
                      {item.status === "NEEDS_ANSWER" && item.questions && (
                        <div className="mt-2 px-3 py-2 rounded-lg bg-amber-500/5 border border-amber-500/10">
                          <p className="text-[10px] text-amber-400 font-bold mb-0.5">📻 Radio Message</p>
                          <pre className="text-xs text-amber-300/80 whitespace-pre-wrap">
                            {typeof item.questions === "string"
                              ? item.questions
                              : JSON.stringify(item.questions, null, 2)}
                          </pre>
                        </div>
                      )}

                      {/* Meta */}
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <FiClock className="h-3 w-3" />
                          {timeAgo(item.completedAt || item.startedAt)}
                        </span>
                        <span>🧑 {item.node.name}</span>
                        <span>{item.logCount} logs</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      {item.prUrl && (
                        <a
                          href={item.prUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                        >
                          <FiGitPullRequest className="h-3.5 w-3.5" />
                          Inspect Cargo
                        </a>
                      )}
                      {item.previewUrl && (
                        <a
                          href={item.previewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 transition-colors"
                        >
                          <FiExternalLink className="h-3.5 w-3.5" />
                          Test Drive
                        </a>
                      )}
                      {item.status === "FAILED" && (
                        <button
                          onClick={() => handleRetry(item)}
                          disabled={retrying === item.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                        >
                          <FiRotateCcw className={`h-3.5 w-3.5 ${retrying === item.id ? "animate-spin" : ""}`} />
                          Re-Dispatch
                        </button>
                      )}
                      {item.status === "NEEDS_ANSWER" && (
                        <button
                          onClick={() => setSelectedItem(isSelected ? null : item)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition-colors"
                        >
                          <FiSend className="h-3.5 w-3.5" />
                          Radio In
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Radio Panel (Answer) */}
                {isSelected && item.status === "NEEDS_ANSWER" && (
                  <div className="border-t border-amber-500/20 px-5 py-4 bg-amber-500/[0.03]">
                    <p className="text-[10px] text-amber-400 font-bold mb-2">📡 Radio Response to Driver</p>
                    <div className="flex gap-3">
                      <textarea
                        value={answerText}
                        onChange={(e) => setAnswerText(e.target.value)}
                        placeholder="Type your directions for the driver…"
                        rows={3}
                        className="flex-1 rounded-lg bg-black/30 border border-amber-500/20 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30 resize-none"
                      />
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleAnswer(item.id)}
                          disabled={answering || !answerText.trim()}
                          className="px-4 py-2 rounded-lg text-xs font-bold bg-amber-500/20 border border-amber-500/40 text-amber-400 hover:bg-amber-500/30 transition-colors disabled:opacity-50"
                        >
                          {answering ? "📡 Sending…" : "📡 Transmit"}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedItem(null);
                            setAnswerText("");
                          }}
                          className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <FiX className="h-3.5 w-3.5 mx-auto" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
