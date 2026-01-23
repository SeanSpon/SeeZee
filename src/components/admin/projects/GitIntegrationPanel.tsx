"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Github,
  GitBranch,
  GitCommit,
  GitPullRequest,
  ExternalLink,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  Link as LinkIcon,
  Unlink,
  Settings,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface Commit {
  sha: string;
  message: string;
  author: string;
  date: string;
  url: string;
}

interface RepositoryInfo {
  url: string;
  fullUrl: string;
  owner: string;
  repo: string;
  description?: string;
  language?: string;
  stars?: number;
  forks?: number;
  lastCommit?: {
    sha: string;
    message: string;
    author: string;
    date: string;
    url: string;
  };
  error?: string;
}

interface GitIntegrationPanelProps {
  projectId: string;
  githubRepo?: string | null;
  onRepoUpdate?: (repo: string | null) => void;
  isAdmin?: boolean;
  expanded?: boolean;
}

export function GitIntegrationPanel({
  projectId,
  githubRepo,
  onRepoUpdate,
  isAdmin = false,
  expanded: initialExpanded = true,
}: GitIntegrationPanelProps) {
  const [expanded, setExpanded] = useState(initialExpanded);
  const [loading, setLoading] = useState(false);
  const [commitsLoading, setCommitsLoading] = useState(false);
  const [repositoryInfo, setRepositoryInfo] = useState<RepositoryInfo | null>(null);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [repoInput, setRepoInput] = useState(githubRepo || "");
  const [saving, setSaving] = useState(false);

  // Fetch repository info
  const fetchRepositoryInfo = async () => {
    if (!githubRepo) {
      setRepositoryInfo(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/projects/${projectId}/repository`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch repository info");
      }

      setRepositoryInfo(data.repository);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch recent commits
  const fetchCommits = async () => {
    if (!repositoryInfo?.owner || !repositoryInfo?.repo) return;

    setCommitsLoading(true);

    try {
      const res = await fetch(
        `https://api.github.com/repos/${repositoryInfo.owner}/${repositoryInfo.repo}/commits?per_page=10`,
        {
          headers: {
            Accept: "application/vnd.github.v3+json",
          },
        }
      );

      if (!res.ok) {
        console.error("Failed to fetch commits");
        return;
      }

      const data = await res.json();
      const formattedCommits: Commit[] = data.map((commit: any) => ({
        sha: commit.sha.substring(0, 7),
        message: commit.commit.message.split("\n")[0],
        author: commit.commit.author.name,
        date: commit.commit.author.date,
        url: commit.html_url,
      }));

      setCommits(formattedCommits);
    } catch (e) {
      console.error("Failed to fetch commits:", e);
    } finally {
      setCommitsLoading(false);
    }
  };

  useEffect(() => {
    fetchRepositoryInfo();
  }, [githubRepo, projectId]);

  useEffect(() => {
    if (repositoryInfo && !repositoryInfo.error) {
      fetchCommits();
    }
  }, [repositoryInfo]);

  // Save repository link
  const handleSaveRepo = async () => {
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/projects/${projectId}/repository`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ githubRepo: repoInput || null }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update repository");
      }

      setShowLinkForm(false);
      onRepoUpdate?.(repoInput || null);
      fetchRepositoryInfo();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
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
          <div className="w-8 h-8 rounded-lg bg-[#333]/50 flex items-center justify-center">
            <Github className="w-4 h-4 text-white" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-semibold text-white">GitHub Integration</h3>
            {githubRepo && repositoryInfo && !repositoryInfo.error ? (
              <p className="text-xs text-white/50">
                {repositoryInfo.owner}/{repositoryInfo.repo}
              </p>
            ) : (
              <p className="text-xs text-white/50">
                {githubRepo ? "Repository linked" : "Not connected"}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {githubRepo && (
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
            <div className="p-4 bg-white/5 border-b border-white/10">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={repoInput}
                  onChange={(e) => setRepoInput(e.target.value)}
                  placeholder="owner/repo or https://github.com/owner/repo"
                  className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/30 focus:border-[#ef4444]/50 outline-none"
                />
                <button
                  onClick={handleSaveRepo}
                  disabled={saving}
                  className="px-4 py-2 bg-[#ef4444] hover:bg-[#dc2626] disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                </button>
                <button
                  onClick={() => setShowLinkForm(false)}
                  className="px-3 py-2 text-white/60 hover:text-white text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-500/10 border-b border-red-500/30 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="p-8 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-white/40 animate-spin" />
            </div>
          )}

          {/* No Repo */}
          {!loading && !githubRepo && (
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                <Github className="w-6 h-6 text-white/40" />
              </div>
              <p className="text-white/60 text-sm mb-4">No repository connected</p>
              {isAdmin && !showLinkForm && (
                <button
                  onClick={() => setShowLinkForm(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors"
                >
                  <LinkIcon className="w-4 h-4" />
                  Link Repository
                </button>
              )}
            </div>
          )}

          {/* Repository Info */}
          {!loading && repositoryInfo && !repositoryInfo.error && (
            <div className="p-4 space-y-4">
              {/* Repo Stats */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {repositoryInfo.language && (
                    <span className="text-xs text-white/60">
                      <span className="inline-block w-2 h-2 rounded-full bg-yellow-400 mr-1.5" />
                      {repositoryInfo.language}
                    </span>
                  )}
                  {typeof repositoryInfo.stars === "number" && (
                    <span className="text-xs text-white/60">
                      ⭐ {repositoryInfo.stars}
                    </span>
                  )}
                  {typeof repositoryInfo.forks === "number" && (
                    <span className="text-xs text-white/60">
                      <GitBranch className="inline w-3 h-3 mr-1" />
                      {repositoryInfo.forks}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={fetchRepositoryInfo}
                    className="p-1.5 text-white/40 hover:text-white transition-colors"
                    title="Refresh"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => setShowLinkForm(true)}
                      className="p-1.5 text-white/40 hover:text-white transition-colors"
                      title="Edit"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  )}
                  <a
                    href={repositoryInfo.fullUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-white/40 hover:text-white transition-colors"
                    title="Open on GitHub"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {repositoryInfo.description && (
                <p className="text-xs text-white/50">{repositoryInfo.description}</p>
              )}

              {/* Commits */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-semibold text-white/70 uppercase tracking-wide">
                    Recent Commits
                  </h4>
                  {commitsLoading && (
                    <Loader2 className="w-3 h-3 text-white/40 animate-spin" />
                  )}
                </div>

                {commits.length === 0 && !commitsLoading ? (
                  <p className="text-xs text-white/40 py-4 text-center">No commits found</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {commits.map((commit) => (
                      <a
                        key={commit.sha}
                        href={commit.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start gap-3 p-2 -mx-2 rounded-lg hover:bg-white/5 transition-colors group"
                      >
                        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <GitCommit className="w-3 h-3 text-white/60" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate group-hover:text-[#ef4444] transition-colors">
                            {commit.message}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-mono text-white/40 bg-white/5 px-1.5 py-0.5 rounded">
                              {commit.sha}
                            </span>
                            <span className="text-[10px] text-white/40">
                              {commit.author}
                            </span>
                            <span className="text-[10px] text-white/30">
                              {formatDate(commit.date)}
                            </span>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Repo Error */}
          {!loading && repositoryInfo?.error && (
            <div className="p-4">
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <p className="text-sm text-amber-400">{repositoryInfo.error}</p>
              </div>
              {isAdmin && (
                <button
                  onClick={() => setShowLinkForm(true)}
                  className="mt-3 text-sm text-[#ef4444] hover:underline"
                >
                  Update repository URL
                </button>
              )}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
