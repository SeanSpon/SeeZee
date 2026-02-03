"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Globe,
  ExternalLink,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Link as LinkIcon,
  Settings,
  ChevronDown,
  ChevronUp,
  Rocket,
  GitBranch,
  GitCommit,
  AlertTriangle,
} from "lucide-react";

interface Deployment {
  id: string;
  url: string;
  state: string;
  target: string;
  createdAt: number;
  buildingAt?: number;
  ready?: number;
  alias?: string[];
  meta?: {
    branch?: string;
    commit?: string;
    message?: string;
    author?: string;
  };
}

interface VercelProject {
  id: string;
  name: string;
  framework: string | null;
  link: string;
  productionUrl: string | null;
  gitRepo: string | null;
}

interface VercelDeploymentsPanelProps {
  projectId: string;
  vercelUrl?: string | null;
  vercelProjectId?: string | null;
  onUrlUpdate?: (url: string | null) => void;
  isAdmin?: boolean;
  expanded?: boolean;
}

export function VercelDeploymentsPanel({
  projectId,
  vercelUrl,
  vercelProjectId,
  onUrlUpdate,
  isAdmin = false,
  expanded: initialExpanded = true,
}: VercelDeploymentsPanelProps) {
  const [expanded, setExpanded] = useState(initialExpanded);
  const [loading, setLoading] = useState(false);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [urlInput, setUrlInput] = useState(vercelUrl || "");
  const [saving, setSaving] = useState(false);
  const [vercelProjects, setVercelProjects] = useState<VercelProject[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  // Fetch deployments
  const fetchDeployments = async () => {
    if (!vercelProjectId && !vercelUrl) {
      setDeployments([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/vercel/deployments?projectId=${projectId}`);
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 501) {
          // Vercel not configured
          setError(data.error || "Vercel integration not configured");
          return;
        }
        throw new Error(data.error || "Failed to fetch deployments");
      }

      setDeployments(data.deployments || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch available Vercel projects
  const fetchVercelProjects = async () => {
    setLoadingProjects(true);
    setError(null);

    try {
      const res = await fetch("/api/integrations/vercel/projects");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch Vercel projects");
      }

      setVercelProjects(data.projects || []);
    } catch (e: any) {
      setError(e.message);
      setVercelProjects([]);
    } finally {
      setLoadingProjects(false);
    }
  };

  useEffect(() => {
    if (expanded && (vercelProjectId || vercelUrl)) {
      fetchDeployments();
    }
  }, [vercelProjectId, vercelUrl, projectId, expanded]);

  // Fetch Vercel projects when form is shown
  useEffect(() => {
    if (showLinkForm && vercelProjects.length === 0) {
      fetchVercelProjects();
    }
  }, [showLinkForm]);

  // Handle project selection from dropdown
  const handleProjectSelect = (projectId: string) => {
    setSelectedProjectId(projectId);
    const project = vercelProjects.find((p) => p.id === projectId);
    if (project) {
      setUrlInput(project.link || project.productionUrl || `https://${project.name}.vercel.app`);
    }
  };

  // Save Vercel URL
  const handleSaveUrl = async () => {
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/projects/${projectId}/vercel`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vercelUrl: urlInput || null }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update Vercel URL");
      }

      setShowLinkForm(false);
      onUrlUpdate?.(urlInput || null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const getStatusConfig = (state: string) => {
    switch (state.toUpperCase()) {
      case "READY":
        return {
          icon: CheckCircle,
          color: "text-emerald-400",
          bg: "bg-emerald-500/20",
          label: "Ready",
        };
      case "BUILDING":
        return {
          icon: Loader2,
          color: "text-amber-400",
          bg: "bg-amber-500/20",
          label: "Building",
          animate: true,
        };
      case "QUEUED":
        return {
          icon: Clock,
          color: "text-blue-400",
          bg: "bg-blue-500/20",
          label: "Queued",
        };
      case "ERROR":
      case "FAILED":
        return {
          icon: XCircle,
          color: "text-red-400",
          bg: "bg-red-500/20",
          label: "Failed",
        };
      case "CANCELED":
        return {
          icon: AlertTriangle,
          color: "text-slate-400",
          bg: "bg-slate-500/20",
          label: "Canceled",
        };
      default:
        return {
          icon: Clock,
          color: "text-white/60",
          bg: "bg-white/10",
          label: state,
        };
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center">
            <svg viewBox="0 0 76 65" className="w-4 h-4 text-white" fill="currentColor">
              <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
            </svg>
          </div>
          <div className="text-left">
            <h3 className="text-sm font-semibold text-white">Vercel Deployments</h3>
            {vercelUrl ? (
              <p className="text-xs text-white/50 truncate max-w-[200px]">{vercelUrl}</p>
            ) : (
              <p className="text-xs text-white/50">Not connected</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {vercelUrl && (
            <span className="px-2 py-0.5 text-[10px] font-medium bg-emerald-500/20 text-emerald-400 rounded-full">
              Connected
            </span>
          )}
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-white/40" />
          ) : (
            <ChevronDown className="w-4 h-4 text-white/40" />
          )}
        </div>
      </button>

      {/* Content */}
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="border-t border-white/10"
        >
          {/* Link Form */}
          {showLinkForm && isAdmin && (
            <div className="p-4 bg-white/5 border-b border-white/10 space-y-4">
              <div className="text-sm text-white/70 mb-3">
                Link this project to a Vercel deployment
              </div>

              {/* Loading State */}
              {loadingProjects && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 text-white/40 animate-spin mr-2" />
                  <span className="text-sm text-white/60">Loading Vercel projects...</span>
                </div>
              )}

              {/* Form Fields */}
              {!loadingProjects && (
                <>
                  {/* Vercel Project Dropdown */}
                  <div>
                    <label className="block text-xs font-medium text-white/70 uppercase tracking-wide mb-2">
                      Vercel Project
                    </label>
                    {vercelProjects.length > 0 ? (
                      <select
                        value={selectedProjectId}
                        onChange={(e) => handleProjectSelect(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:border-[#ef4444]/50 focus:ring-1 focus:ring-[#ef4444]/20 outline-none transition-all"
                      >
                        <option value="" className="bg-[#0a1128]">Select a Vercel project...</option>
                        {vercelProjects.map((project) => (
                          <option key={project.id} value={project.id} className="bg-[#0a1128]">
                            {project.name} {project.framework ? `(${project.framework})` : ""}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="px-3 py-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                        <p className="text-xs text-amber-400">
                          No Vercel projects found. Make sure VERCEL_TOKEN is configured.
                        </p>
                      </div>
                    )}
                    <p className="text-xs text-white/40 mt-1.5">
                      Select the Vercel project to link deployments from
                    </p>
                  </div>

                  {/* Deployment URL Input */}
                  <div>
                    <label className="block text-xs font-medium text-white/70 uppercase tracking-wide mb-2">
                      Deployment URL
                    </label>
                    <input
                      type="text"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://your-app.vercel.app"
                      className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/30 focus:border-[#ef4444]/50 focus:ring-1 focus:ring-[#ef4444]/20 outline-none transition-all"
                    />
                    <p className="text-xs text-white/40 mt-1.5">
                      The live URL where your app is deployed (auto-filled from project selection)
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={handleSaveUrl}
                      disabled={saving || !urlInput}
                      className="flex-1 px-4 py-2.5 bg-[#ef4444] hover:bg-[#dc2626] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <LinkIcon className="w-4 h-4" />
                          Save Connection
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setShowLinkForm(false);
                        setSelectedProjectId("");
                        setUrlInput(vercelUrl || "");
                      }}
                      className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-4 bg-amber-500/10 border-b border-amber-500/30 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <p className="text-sm text-amber-400">{error}</p>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="p-8 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-white/40 animate-spin" />
            </div>
          )}

          {/* No URL */}
          {!loading && !vercelUrl && !vercelProjectId && (
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                <Globe className="w-6 h-6 text-white/40" />
              </div>
              <p className="text-white/60 text-sm mb-4">No Vercel deployment linked</p>
              {isAdmin && !showLinkForm && (
                <button
                  onClick={() => setShowLinkForm(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors"
                >
                  <LinkIcon className="w-4 h-4" />
                  Link Deployment
                </button>
              )}
            </div>
          )}

          {/* Deployments List */}
          {!loading && (vercelUrl || vercelProjectId) && (
            <div className="p-4 space-y-4">
              {/* Live Site Link */}
              {vercelUrl && (
                <div className="flex items-center justify-between p-3 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-lg border border-emerald-500/20">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                      <Globe className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Live Site</p>
                      <p className="text-xs text-white/50 truncate max-w-[200px]">{vercelUrl}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={vercelUrl.startsWith("http") ? vercelUrl : `https://${vercelUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-white/60 hover:text-white transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    {isAdmin && (
                      <button
                        onClick={() => setShowLinkForm(true)}
                        className="p-2 text-white/60 hover:text-white transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Deployment History */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-semibold text-white/70 uppercase tracking-wide">
                    Deployment History
                  </h4>
                  <button
                    onClick={fetchDeployments}
                    className="p-1 text-white/40 hover:text-white transition-colors"
                    title="Refresh"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                </div>

                {deployments.length === 0 ? (
                  <p className="text-xs text-white/40 py-4 text-center">
                    {error ? "Unable to fetch deployments" : "No deployments found"}
                  </p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {deployments.map((deployment) => {
                      const status = getStatusConfig(deployment.state);
                      const StatusIcon = status.icon;
                      
                      return (
                        <div
                          key={deployment.id}
                          className="p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className={`w-6 h-6 rounded-full ${status.bg} flex items-center justify-center`}>
                                <StatusIcon 
                                  className={`w-3 h-3 ${status.color} ${status.animate ? 'animate-spin' : ''}`} 
                                />
                              </div>
                              <span className={`text-xs font-medium ${status.color}`}>
                                {status.label}
                              </span>
                              {deployment.target === "production" && (
                                <span className="px-1.5 py-0.5 text-[10px] font-medium bg-purple-500/20 text-purple-400 rounded">
                                  Production
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-white/40">
                              {formatDate(deployment.createdAt)}
                            </span>
                          </div>

                          {/* Git Info */}
                          {deployment.meta?.message && (
                            <p className="text-sm text-white truncate mb-2">
                              {deployment.meta.message}
                            </p>
                          )}

                          <div className="flex items-center gap-3 text-[10px] text-white/40">
                            {deployment.meta?.branch && (
                              <span className="flex items-center gap-1">
                                <GitBranch className="w-3 h-3" />
                                {deployment.meta.branch}
                              </span>
                            )}
                            {deployment.meta?.commit && (
                              <span className="flex items-center gap-1 font-mono">
                                <GitCommit className="w-3 h-3" />
                                {deployment.meta.commit}
                              </span>
                            )}
                            {deployment.meta?.author && (
                              <span>{deployment.meta.author}</span>
                            )}
                          </div>

                          {/* URL */}
                          {deployment.url && deployment.state === "READY" && (
                            <a
                              href={`https://${deployment.url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                            >
                              <ExternalLink className="w-3 h-3" />
                              {deployment.url}
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
