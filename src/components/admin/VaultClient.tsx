"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FiShield,
  FiPlus,
  FiTrash2,
  FiRefreshCw,
  FiX,
  FiLock,
  FiGlobe,
  FiFolder,
  FiGitBranch,
  FiKey,
  FiCopy,
} from "react-icons/fi";

// ==================
// Types
// ==================

interface VaultEntry {
  id: string;
  key: string;
  lastFour: string;
  scope: "GLOBAL" | "PROJECT" | "REPO";
  scopeRef: string | null;
  notes: string | null;
  createdBy: { name: string | null; email: string | null };
  createdAt: string;
  updatedAt: string;
}

// ==================
// Armory Helpers
// ==================

function clearanceLevel(scope: string) {
  switch (scope) {
    case "GLOBAL":
      return { label: "All Access", icon: FiGlobe, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30", stripe: "from-blue-500 to-blue-700" };
    case "PROJECT":
      return { label: "Division", icon: FiFolder, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/30", stripe: "from-purple-500 to-purple-700" };
    case "REPO":
      return { label: "Unit", icon: FiGitBranch, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30", stripe: "from-emerald-500 to-emerald-700" };
    default:
      return { label: scope, icon: FiGlobe, color: "text-slate-400", bg: "bg-slate-500/10 border-slate-500/30", stripe: "from-slate-500 to-slate-700" };
  }
}

// ==================
// Component
// ==================

export default function VaultClient() {
  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  // Add form state
  const [formKey, setFormKey] = useState("");
  const [formValue, setFormValue] = useState("");
  const [formScope, setFormScope] = useState<"GLOBAL" | "PROJECT" | "REPO">("GLOBAL");
  const [formScopeRef, setFormScopeRef] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchEntries = useCallback(async () => {
    try {
      const res = await fetch("/api/ceo/vault");
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setEntries(data.entries);
    } catch (err) {
      console.error("Failed to fetch vault:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleAdd = async () => {
    if (!formKey.trim() || !formValue.trim()) {
      setFormError("Key and value are required");
      return;
    }

    setSaving(true);
    setFormError("");
    try {
      const res = await fetch("/api/ceo/vault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: formKey,
          value: formValue,
          scope: formScope,
          scopeRef: formScopeRef || undefined,
          notes: formNotes || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setFormError(data.error || "Failed to save");
        return;
      }

      // Reset form
      setFormKey("");
      setFormValue("");
      setFormScope("GLOBAL");
      setFormScopeRef("");
      setFormNotes("");
      setShowAdd(false);
      fetchEntries();
    } catch {
      setFormError("Network error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Revoke this keycard? This cannot be undone.")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/ceo/vault/${id}`, { method: "DELETE" });
      if (res.ok) fetchEntries();
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeleting(null);
    }
  };

  const handleCopyRef = (key: string) => {
    navigator.clipboard.writeText(`{{vault:${key}}}`);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Actions Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span className="text-base">🔐</span>
          <span className="font-bold text-white">{entries.length}</span>
          <span>keycards on file</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchEntries()}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Refresh armory"
          >
            <FiRefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors border ${
              showAdd
                ? "bg-white/10 border-white/20 text-white"
                : "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
            }`}
          >
            {showAdd ? <FiX className="h-3.5 w-3.5" /> : <FiPlus className="h-3.5 w-3.5" />}
            {showAdd ? "Cancel" : "Issue Keycard"}
          </button>
        </div>
      </div>

      {/* Issue New Keycard Form */}
      {showAdd && (
        <div className="rounded-xl border border-red-500/20 bg-white/[0.03] backdrop-blur-sm p-5 relative overflow-hidden">
          {/* Top stripe */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-red-700" />
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <FiKey className="h-4 w-4 text-amber-400" />
            Issue New Keycard
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Keycard ID</label>
              <input
                type="text"
                value={formKey}
                onChange={(e) => setFormKey(e.target.value)}
                placeholder="e.g. STRIPE_SECRET_KEY"
                className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm text-white font-mono placeholder-slate-500 focus:border-red-500/40 focus:outline-none focus:ring-1 focus:ring-red-500/20"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Access Code (encrypted)</label>
              <input
                type="password"
                value={formValue}
                onChange={(e) => setFormValue(e.target.value)}
                placeholder="sk_live_..."
                className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm text-white font-mono placeholder-slate-500 focus:border-red-500/40 focus:outline-none focus:ring-1 focus:ring-red-500/20"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Clearance Level</label>
              <select
                value={formScope}
                onChange={(e) => setFormScope(e.target.value as "GLOBAL" | "PROJECT" | "REPO")}
                className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm text-white focus:border-red-500/40 focus:outline-none focus:ring-1 focus:ring-red-500/20"
              >
                <option value="GLOBAL">🌐 All Access (Global)</option>
                <option value="PROJECT">📁 Division (Project)</option>
                <option value="REPO">🔀 Unit (Repository)</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Assignment (optional)</label>
              <input
                type="text"
                value={formScopeRef}
                onChange={(e) => setFormScopeRef(e.target.value)}
                placeholder="Project ID or repo URL"
                className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-red-500/40 focus:outline-none focus:ring-1 focus:ring-red-500/20"
              />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Mission Notes (optional)</label>
              <input
                type="text"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="What is this keycard for?"
                className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-red-500/40 focus:outline-none focus:ring-1 focus:ring-red-500/20"
              />
            </div>
          </div>
          {formError && (
            <p className="text-xs text-red-400 mt-2">⚠️ {formError}</p>
          )}
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleAdd}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50"
            >
              <FiLock className="h-3.5 w-3.5" />
              {saving ? "Encoding…" : "🔒 Encrypt & Issue"}
            </button>
          </div>
        </div>
      )}

      {/* Keycard Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-red-500" />
          <span className="text-xs text-slate-500">Opening armory…</span>
        </div>
      ) : entries.length === 0 && !showAdd ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
          <span className="text-5xl block mb-4">🔐</span>
          <p className="text-sm font-semibold text-slate-300">Armory is empty</p>
          <p className="mt-1 text-xs text-slate-600">
            Issue keycards to give AI workers secure access to secrets
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {entries.map((entry) => {
            const clearance = clearanceLevel(entry.scope);
            const ClearanceIcon = clearance.icon;

            return (
              <div
                key={entry.id}
                className="rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm relative overflow-hidden group hover:bg-white/[0.06] transition-all"
              >
                {/* Clearance Stripe */}
                <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${clearance.stripe}`} />

                <div className="p-4">
                  {/* Key Header */}
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-white/5 border border-white/10 flex-shrink-0">
                      <FiKey className="h-4 w-4 text-amber-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-mono font-bold text-white truncate">{entry.key}</p>
                      <p className="text-xs font-mono text-slate-500 mt-0.5">
                        <FiLock className="inline h-3 w-3 mr-1" />
                        ••••••{entry.lastFour}
                      </p>
                    </div>
                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleCopyRef(entry.key)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                        title="Copy vault reference"
                      >
                        {copied === entry.key ? (
                          <span className="text-[10px] text-emerald-400 font-bold">✓</span>
                        ) : (
                          <FiCopy className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        disabled={deleting === entry.id}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                        title="Revoke keycard"
                      >
                        <FiTrash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${clearance.bg} ${clearance.color}`}>
                      <ClearanceIcon className="h-3 w-3" />
                      {clearance.label}
                    </span>
                    {entry.scopeRef && (
                      <span className="text-[10px] text-slate-600 font-mono truncate max-w-[140px]">
                        → {entry.scopeRef}
                      </span>
                    )}
                  </div>

                  {/* Notes */}
                  {entry.notes && (
                    <p className="mt-2 text-xs text-slate-500 line-clamp-1">
                      📝 {entry.notes}
                    </p>
                  )}

                  {/* Footer */}
                  <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-600">
                    <span>
                      Issued {new Date(entry.createdAt).toLocaleDateString()} by{" "}
                      {entry.createdBy.name || entry.createdBy.email}
                    </span>
                    <span className="font-mono">{entry.id.slice(0, 8)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
