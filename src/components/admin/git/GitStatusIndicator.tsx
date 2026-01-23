"use client";

import { useState, useEffect } from "react";
import {
  Github,
  GitBranch,
  GitCommit,
  GitPullRequest,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Loader2,
  Clock,
  Activity,
  Bug,
} from "lucide-react";
import { parseRepoUrl } from "@/lib/git/github-service";

interface GitStatusIndicatorProps {
  githubRepo: string | null | undefined;
  projectId?: string;
  compact?: boolean;
  showCommits?: boolean;
  showPRs?: boolean;
  className?: string;
}

interface GitStatus {
  connected: boolean;
  loading: boolean;
  error: string | null;
  lastCommit?: {
    sha: string;
    message: string;
    author: string;
    date: string;
    url: string;
  };
  stats?: {
    commitsThisWeek: number;
    openPRs: number;
    openIssues: number;
  };
  repoInfo?: {
    owner: string;
    repo: string;
    url: string;
    defaultBranch: string;
  };
}

export function GitStatusIndicator({
  githubRepo,
  projectId,
  compact = true,
  showCommits = true,
  showPRs = false,
  className = "",
}: GitStatusIndicatorProps) {
  const [status, setStatus] = useState<GitStatus>({
    connected: false,
    loading: true,
    error: null,
  });

  useEffect(() => {
    async function fetchStatus() {
      if (!githubRepo) {
        setStatus({ connected: false, loading: false, error: null });
        return;
      }

      const parsed = parseRepoUrl(githubRepo);
      if (!parsed) {
        setStatus({ connected: false, loading: false, error: "Invalid repo URL" });
        return;
      }

      try {
        // Fetch git info from our API
        const endpoint = projectId
          ? `/api/admin/projects/${projectId}/git`
          : `/api/admin/git/stats`;
        
        const res = await fetch(endpoint);
        if (!res.ok) {
          throw new Error("Failed to fetch Git status");
        }

        const data = await res.json();
        
        setStatus({
          connected: true,
          loading: false,
          error: null,
          lastCommit: data.commits?.[0] || data.stats?.lastCommit,
          stats: {
            commitsThisWeek: data.stats?.commitsThisWeek || 0,
            openPRs: data.stats?.openPRs || 0,
            openIssues: data.stats?.openIssues || 0,
          },
          repoInfo: {
            owner: parsed.owner,
            repo: parsed.repo,
            url: `https://github.com/${parsed.owner}/${parsed.repo}`,
            defaultBranch: data.repository?.defaultBranch || "main",
          },
        });
      } catch (e) {
        console.error("[GitStatusIndicator] Error:", e);
        // Still show as connected if we have a valid repo URL
        setStatus({
          connected: true,
          loading: false,
          error: null,
          repoInfo: {
            owner: parsed.owner,
            repo: parsed.repo,
            url: `https://github.com/${parsed.owner}/${parsed.repo}`,
            defaultBranch: "main",
          },
        });
      }
    }

    fetchStatus();
  }, [githubRepo, projectId]);

  // Loading state
  if (status.loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Loader2 className="w-3.5 h-3.5 text-white/40 animate-spin" />
        {!compact && <span className="text-xs text-white/40">Loading...</span>}
      </div>
    );
  }

  // Not connected state
  if (!status.connected || !githubRepo) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="w-2 h-2 rounded-full bg-white/20" />
        {!compact && <span className="text-xs text-white/40">No repo</span>}
      </div>
    );
  }

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    return `${diffDays}d`;
  };

  // Compact mode - just show status dot
  if (compact) {
    return (
      <a
        href={status.repoInfo?.url || "#"}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex items-center gap-2 hover:opacity-80 transition-opacity ${className}`}
        title={`${status.repoInfo?.owner}/${status.repoInfo?.repo}`}
      >
        <Github className="w-3.5 h-3.5 text-white/60" />
        <div className="w-2 h-2 rounded-full bg-emerald-400" />
        {status.lastCommit && (
          <span className="text-xs text-white/40 font-mono">
            {status.lastCommit.sha.substring(0, 7)}
          </span>
        )}
      </a>
    );
  }

  // Full mode - show more details
  return (
    <div className={`space-y-2 ${className}`}>
      {/* Repo link */}
      <a
        href={status.repoInfo?.url || "#"}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors group"
      >
        <Github className="w-4 h-4" />
        <span className="truncate">
          {status.repoInfo?.owner}/{status.repoInfo?.repo}
        </span>
        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
      </a>

      {/* Stats */}
      {status.stats && (
        <div className="flex items-center gap-4 text-xs text-white/40">
          {showCommits && (
            <span className="flex items-center gap-1">
              <GitCommit className="w-3 h-3" />
              {status.stats.commitsThisWeek} this week
            </span>
          )}
          {showPRs && status.stats.openPRs > 0 && (
            <span className="flex items-center gap-1 text-purple-400">
              <GitPullRequest className="w-3 h-3" />
              {status.stats.openPRs} open
            </span>
          )}
          {status.stats.openIssues > 0 && (
            <span className="flex items-center gap-1 text-amber-400">
              <Bug className="w-3 h-3" />
              {status.stats.openIssues}
            </span>
          )}
        </div>
      )}

      {/* Last commit */}
      {status.lastCommit && (
        <a
          href={status.lastCommit.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-2 p-2 -mx-2 rounded-lg hover:bg-white/5 transition-colors group"
        >
          <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
            <GitCommit className="w-3 h-3 text-white/60" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-white truncate group-hover:text-[#ef4444] transition-colors">
              {status.lastCommit.message}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] text-white/30 font-mono">
                {status.lastCommit.sha.substring(0, 7)}
              </span>
              <span className="text-[10px] text-white/30">
                {status.lastCommit.author}
              </span>
              <span className="text-[10px] text-white/30">
                {formatTimeAgo(status.lastCommit.date)} ago
              </span>
            </div>
          </div>
        </a>
      )}
    </div>
  );
}

// Badge variant for project cards
export function GitBadge({
  githubRepo,
  className = "",
}: {
  githubRepo: string | null | undefined;
  className?: string;
}) {
  if (!githubRepo) {
    return null;
  }

  const parsed = parseRepoUrl(githubRepo);
  if (!parsed) return null;

  return (
    <a
      href={`https://github.com/${parsed.owner}/${parsed.repo}`}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1.5 px-2 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-xs text-white/70 hover:text-white transition-all ${className}`}
    >
      <Github className="w-3 h-3" />
      <span className="truncate max-w-[120px]">{parsed.repo}</span>
      <ExternalLink className="w-2.5 h-2.5 opacity-60" />
    </a>
  );
}

export default GitStatusIndicator;
