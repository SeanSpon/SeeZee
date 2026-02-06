"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  FiCpu,
  FiKey,
  FiMessageSquare,
  FiSend,
  FiCheck,
  FiX,
  FiRefreshCw,
  FiGithub,
  FiCloud,
  FiTerminal,
  FiPlus,
  FiTrash2,
  FiEye,
  FiEyeOff,
  FiActivity,
  FiZap,
  FiCode,
} from "react-icons/fi";

// ─── Types ───────────────────────────────────────────────────────────
interface Integration {
  name: string;
  connected: boolean;
  keyPreview: string | null;
}

interface Integrations {
  claude: Integration;
  github: Integration;
  vercel: Integration;
  openai: Integration;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ManagedKey {
  id: string;
  label: string;
  provider: "claude" | "github" | "vercel" | "openai";
  key: string;
  isActive: boolean;
}

interface ConnectedBot {
  id: string;
  name: string;
  status: "online" | "offline" | "busy";
  currentTask: string | null;
  machine: string;
}

// ─── Provider Icons & Colors ─────────────────────────────────────────
const PROVIDER_META: Record<string, { icon: typeof FiCpu; color: string; label: string }> = {
  claude: { icon: FiCpu, color: "text-purple-400", label: "Claude (Anthropic)" },
  github: { icon: FiGithub, color: "text-white", label: "GitHub" },
  vercel: { icon: FiCloud, color: "text-cyan-400", label: "Vercel" },
  openai: { icon: FiZap, color: "text-green-400", label: "OpenAI" },
};

// ─── Component ───────────────────────────────────────────────────────
export function AIManagerClient() {
  // Integration status from server
  const [integrations, setIntegrations] = useState<Integrations | null>(null);
  const [loading, setLoading] = useState(true);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // API Key management
  const [managedKeys, setManagedKeys] = useState<ManagedKey[]>([]);
  const [showAddKey, setShowAddKey] = useState(false);
  const [newKeyLabel, setNewKeyLabel] = useState("");
  const [newKeyProvider, setNewKeyProvider] = useState<ManagedKey["provider"]>("claude");
  const [newKeyValue, setNewKeyValue] = useState("");
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());

  // Connected bots (demo data for now)
  const [bots, setBots] = useState<ConnectedBot[]>([
    { id: "1", name: "Clawd-Primary", status: "online", currentTask: null, machine: "Dev Workstation" },
    { id: "2", name: "Clawd-Builder", status: "offline", currentTask: null, machine: "Build Server" },
  ]);
  const [newTaskBotId, setNewTaskBotId] = useState<string | null>(null);
  const [newTaskText, setNewTaskText] = useState("");

  // Active tab
  const [activeTab, setActiveTab] = useState<"chat" | "keys" | "bots">("chat");

  // ─── Load integrations ─────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/admin/ai-manager")
      .then((res) => res.json())
      .then((data) => {
        setIntegrations(data.integrations);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // ─── Scroll chat to bottom ────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ─── Get active Claude key ────────────────────────────────────────
  const getActiveClaudeKey = useCallback(() => {
    const activeKey = managedKeys.find((k) => k.provider === "claude" && k.isActive);
    return activeKey?.key || "";
  }, [managedKeys]);

  // ─── Send message to Clawd ────────────────────────────────────────
  const sendMessage = useCallback(async () => {
    if (!input.trim() || sending) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/admin/ai-manager", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "chat",
          message: userMessage.content,
          apiKey: getActiveClaudeKey() || undefined,
        }),
      });

      const data = await res.json();

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.reply || data.error || "No response received.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Failed to connect. Check your API key and try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setSending(false);
    }
  }, [input, sending, getActiveClaudeKey]);

  // ─── Add managed key ──────────────────────────────────────────────
  const addKey = useCallback(() => {
    if (!newKeyLabel.trim() || !newKeyValue.trim()) return;
    const key: ManagedKey = {
      id: crypto.randomUUID(),
      label: newKeyLabel.trim(),
      provider: newKeyProvider,
      key: newKeyValue.trim(),
      isActive: !managedKeys.some((k) => k.provider === newKeyProvider),
    };
    setManagedKeys((prev) => [...prev, key]);
    setNewKeyLabel("");
    setNewKeyValue("");
    setShowAddKey(false);
  }, [newKeyLabel, newKeyProvider, newKeyValue, managedKeys]);

  // ─── Remove key ───────────────────────────────────────────────────
  const removeKey = useCallback((id: string) => {
    setManagedKeys((prev) => prev.filter((k) => k.id !== id));
    setRevealedKeys((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  // ─── Toggle active key ────────────────────────────────────────────
  const toggleActiveKey = useCallback((id: string, provider: string) => {
    setManagedKeys((prev) =>
      prev.map((k) => ({
        ...k,
        isActive: k.provider === provider ? k.id === id : k.isActive,
      }))
    );
  }, []);

  // ─── Toggle key visibility ────────────────────────────────────────
  const toggleReveal = useCallback((id: string) => {
    setRevealedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // ─── Assign task to bot ───────────────────────────────────────────
  const assignTask = useCallback(
    (botId: string) => {
      if (!newTaskText.trim()) return;
      setBots((prev) =>
        prev.map((b) =>
          b.id === botId ? { ...b, status: "busy" as const, currentTask: newTaskText.trim() } : b
        )
      );
      setNewTaskBotId(null);
      setNewTaskText("");
    },
    [newTaskText]
  );

  // ─── Status badge ─────────────────────────────────────────────────
  const StatusBadge = ({ status }: { status: string }) => {
    const colors: Record<string, string> = {
      online: "bg-green-500/20 text-green-400 border-green-500/30",
      offline: "bg-slate-500/20 text-slate-400 border-slate-500/30",
      busy: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    };
    return (
      <span className={`px-2 py-0.5 text-xs rounded-full border ${colors[status] || colors.offline}`}>
        {status}
      </span>
    );
  };

  // ─── Render ────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <FiCpu className="text-purple-400" />
            AI Manager
          </h1>
          <p className="text-slate-400 mt-1">
            Manage AI integrations, API keys, and connected Clawd bots
          </p>
        </div>
      </div>

      {/* Integration Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {integrations &&
          (Object.entries(integrations) as [string, Integration][]).map(([key, integration]) => {
            const meta = PROVIDER_META[key];
            const Icon = meta?.icon || FiCpu;
            return (
              <div
                key={key}
                className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-5 h-5 ${meta?.color || "text-white"}`} />
                  <span className="text-sm font-medium text-white">{integration.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      integration.connected ? "bg-green-400" : "bg-red-400"
                    }`}
                  />
                  <span className="text-xs text-slate-400">
                    {integration.connected ? "Connected" : "Not configured"}
                  </span>
                </div>
                {integration.keyPreview && (
                  <p className="text-xs text-slate-500 mt-1 font-mono">{integration.keyPreview}</p>
                )}
              </div>
            );
          })}
        {loading &&
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-white/10 bg-white/5 p-4 animate-pulse h-24"
            />
          ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 border-b border-white/10 pb-px">
        {[
          { id: "chat" as const, label: "Clawd Chat", icon: FiMessageSquare },
          { id: "keys" as const, label: "API Keys", icon: FiKey },
          { id: "bots" as const, label: "Connected Bots", icon: FiTerminal },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === tab.id
                ? "bg-white/10 text-white border-b-2 border-purple-400"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── Chat Tab ───────────────────────────────────────────── */}
      {activeTab === "chat" && (
        <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
          {/* Messages */}
          <div className="h-[500px] overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <FiCpu className="w-12 h-12 mb-3 text-purple-400/40" />
                <p className="text-lg font-medium">Chat with Clawd</p>
                <p className="text-sm mt-1">
                  Send a message to start a conversation with your AI assistant
                </p>
              </div>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-purple-600/30 border border-purple-500/20 text-white"
                      : "bg-white/5 border border-white/10 text-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {msg.role === "assistant" ? (
                      <FiCpu className="w-3.5 h-3.5 text-purple-400" />
                    ) : (
                      <FiCode className="w-3.5 h-3.5 text-blue-400" />
                    )}
                    <span className="text-xs text-slate-400">
                      {msg.role === "assistant" ? "Clawd" : "You"} ·{" "}
                      {msg.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <FiRefreshCw className="w-4 h-4 text-purple-400 animate-spin" />
                    <span className="text-sm text-slate-400">Clawd is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-white/10 p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                placeholder="Message Clawd..."
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/30"
                disabled={sending}
              />
              <button
                onClick={sendMessage}
                disabled={sending || !input.trim()}
                className="rounded-lg bg-purple-600 hover:bg-purple-500 disabled:bg-purple-600/30 disabled:cursor-not-allowed px-4 py-2.5 text-white transition-colors"
              >
                <FiSend className="w-4 h-4" />
              </button>
            </div>
            {!integrations?.claude.connected && !managedKeys.some((k) => k.provider === "claude") && (
              <p className="text-xs text-amber-400 mt-2">
                ⚠ No Claude API key configured. Add one in the API Keys tab to start chatting.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ─── API Keys Tab ───────────────────────────────────────── */}
      {activeTab === "keys" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">
              Manage interchangeable API keys for your AI integrations. The active key per provider is used for requests.
            </p>
            <button
              onClick={() => setShowAddKey(true)}
              className="flex items-center gap-2 rounded-lg bg-purple-600 hover:bg-purple-500 px-3 py-2 text-sm text-white transition-colors"
            >
              <FiPlus className="w-4 h-4" />
              Add Key
            </button>
          </div>

          {/* Add Key Form */}
          {showAddKey && (
            <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={newKeyLabel}
                  onChange={(e) => setNewKeyLabel(e.target.value)}
                  placeholder="Label (e.g., Production Key)"
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-purple-500/50 focus:outline-none"
                />
                <select
                  value={newKeyProvider}
                  onChange={(e) => setNewKeyProvider(e.target.value as ManagedKey["provider"])}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-purple-500/50 focus:outline-none"
                >
                  <option value="claude">Claude (Anthropic)</option>
                  <option value="github">GitHub</option>
                  <option value="vercel">Vercel</option>
                  <option value="openai">OpenAI</option>
                </select>
                <input
                  type="password"
                  value={newKeyValue}
                  onChange={(e) => setNewKeyValue(e.target.value)}
                  placeholder="API Key / Token"
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-purple-500/50 focus:outline-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={addKey}
                  disabled={!newKeyLabel.trim() || !newKeyValue.trim()}
                  className="flex items-center gap-1 rounded-lg bg-green-600 hover:bg-green-500 disabled:bg-green-600/30 px-3 py-1.5 text-sm text-white transition-colors"
                >
                  <FiCheck className="w-3.5 h-3.5" />
                  Save
                </button>
                <button
                  onClick={() => {
                    setShowAddKey(false);
                    setNewKeyLabel("");
                    setNewKeyValue("");
                  }}
                  className="flex items-center gap-1 rounded-lg bg-white/10 hover:bg-white/20 px-3 py-1.5 text-sm text-white transition-colors"
                >
                  <FiX className="w-3.5 h-3.5" />
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Keys List */}
          {managedKeys.length === 0 && !showAddKey ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
              <FiKey className="w-10 h-10 text-slate-500 mx-auto mb-3" />
              <p className="text-slate-400">No API keys added yet</p>
              <p className="text-xs text-slate-500 mt-1">
                Add API keys to connect your Clawd bots to external services
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {managedKeys.map((mk) => {
                const meta = PROVIDER_META[mk.provider];
                const Icon = meta?.icon || FiKey;
                return (
                  <div
                    key={mk.id}
                    className={`rounded-xl border p-4 flex items-center justify-between ${
                      mk.isActive
                        ? "border-purple-500/30 bg-purple-500/5"
                        : "border-white/10 bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${meta?.color || "text-white"}`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">{mk.label}</span>
                          {mk.isActive && (
                            <span className="px-1.5 py-0.5 text-[10px] rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">
                          {revealedKeys.has(mk.id)
                            ? mk.key
                            : `••••••••••••${mk.key.slice(-4)}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleReveal(mk.id)}
                        className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                        title={revealedKeys.has(mk.id) ? "Hide key" : "Show key"}
                      >
                        {revealedKeys.has(mk.id) ? (
                          <FiEyeOff className="w-4 h-4" />
                        ) : (
                          <FiEye className="w-4 h-4" />
                        )}
                      </button>
                      {!mk.isActive && (
                        <button
                          onClick={() => toggleActiveKey(mk.id, mk.provider)}
                          className="p-2 text-slate-400 hover:text-green-400 rounded-lg hover:bg-white/10 transition-colors"
                          title="Set as active"
                        >
                          <FiCheck className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => removeKey(mk.id)}
                        className="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-white/10 transition-colors"
                        title="Remove key"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── Connected Bots Tab ─────────────────────────────────── */}
      {activeTab === "bots" && (
        <div className="space-y-4">
          <p className="text-sm text-slate-400">
            Connected Clawd bots that can receive tasks and auto-generate code on their assigned machines.
          </p>

          <div className="space-y-3">
            {bots.map((bot) => (
              <div
                key={bot.id}
                className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        bot.status === "online"
                          ? "bg-green-500/10 border border-green-500/30"
                          : bot.status === "busy"
                          ? "bg-amber-500/10 border border-amber-500/30"
                          : "bg-slate-500/10 border border-slate-500/30"
                      }`}
                    >
                      <FiTerminal
                        className={`w-5 h-5 ${
                          bot.status === "online"
                            ? "text-green-400"
                            : bot.status === "busy"
                            ? "text-amber-400"
                            : "text-slate-400"
                        }`}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">{bot.name}</span>
                        <StatusBadge status={bot.status} />
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Machine: {bot.machine}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {bot.status === "online" && (
                      <button
                        onClick={() => setNewTaskBotId(bot.id)}
                        className="flex items-center gap-1 rounded-lg bg-purple-600 hover:bg-purple-500 px-3 py-1.5 text-xs text-white transition-colors"
                      >
                        <FiPlus className="w-3.5 h-3.5" />
                        Assign Task
                      </button>
                    )}
                  </div>
                </div>

                {bot.currentTask && (
                  <div className="mt-3 rounded-lg bg-amber-500/5 border border-amber-500/20 p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <FiActivity className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-xs font-medium text-amber-300">Current Task</span>
                    </div>
                    <p className="text-sm text-slate-300">{bot.currentTask}</p>
                  </div>
                )}

                {newTaskBotId === bot.id && (
                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      value={newTaskText}
                      onChange={(e) => setNewTaskText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && assignTask(bot.id)}
                      placeholder="Describe the task (e.g., Build a login page with OAuth)"
                      className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-purple-500/50 focus:outline-none"
                      autoFocus
                    />
                    <button
                      onClick={() => assignTask(bot.id)}
                      disabled={!newTaskText.trim()}
                      className="rounded-lg bg-green-600 hover:bg-green-500 disabled:bg-green-600/30 px-3 py-2 text-sm text-white transition-colors"
                    >
                      <FiCheck className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setNewTaskBotId(null);
                        setNewTaskText("");
                      }}
                      className="rounded-lg bg-white/10 hover:bg-white/20 px-3 py-2 text-sm text-white transition-colors"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Info card about connecting more bots */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <h3 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
              <FiZap className="w-4 h-4 text-purple-400" />
              How It Works
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>• Each Clawd bot connects to a machine with VS Code / Cursor installed</li>
              <li>• Assign coding tasks and the bot auto-generates code using its connected IDE</li>
              <li>• Bots can commit to Git, deploy to Vercel, and report back progress</li>
              <li>• Use the API key from the Keys tab to authenticate bot connections</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
