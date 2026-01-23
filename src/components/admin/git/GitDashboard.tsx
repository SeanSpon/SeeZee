"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Github,
  GitBranch,
  GitCommit,
  GitPullRequest,
  GitMerge,
  AlertCircle,
  CheckCircle,
  Clock,
  ExternalLink,
  RefreshCw,
  Loader2,
  Activity,
  TrendingUp,
  Users,
  Star,
  Eye,
  Code,
  XCircle,
  Play,
  Pause,
  ChevronRight,
  Bug,
  Tag,
  Rocket,
  Zap,
} from "lucide-react";

interface GitActivity {
  id: string;
  type: string;
  action: string;
  description: string;
  repo: string;
  repoUrl: string;
  actor: {
    login: string;
    avatar: string;
  };
  createdAt: string;
  url: string;
}

interface GitRepo {
  name: string;
  fullName: string;
  description: string | null;
  url: string;
  language: string | null;
  stars: number;
  forks: number;
  pushedAt: string;
  isPrivate: boolean;
  openIssues: number;
}

interface GitStats {
  commitsToday: number;
  commitsThisWeek: number;
  commitsThisMonth: number;
  prsThisWeek: number;
  issuesThisWeek: number;
  activeRepos: number;
  totalStars: number;
  totalForks: number;
  lastActivity: string | null;
}

interface RateLimit {
  limit: number;
  remaining: number;
  reset: string;
  percentUsed: number;
}

interface GitDashboardProps {
  compact?: boolean;
  showStats?: boolean;
  showActivity?: boolean;
  showRepos?: boolean;
  maxItems?: number;
  className?: string;
}

export function GitDashboard({
  compact = false,
  showStats = true,
  showActivity = true,
  showRepos = true,
  maxItems = 10,
  className = "",
}: GitDashboardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [configured, setConfigured] = useState(false);
  const [stats, setStats] = useState<GitStats | null>(null);
  const [activity, setActivity] = useState<GitActivity[]>([]);
  const [repos, setRepos] = useState<GitRepo[]>([]);
  const [rateLimit, setRateLimit] = useState<RateLimit | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"activity" | "repos" | "prs">("activity");

  const fetchData = async () => {
    try {
      const res = await fetch("/api/admin/git/stats");
      if (!res.ok) throw new Error("Failed to fetch Git stats");

      const data = await res.json();
      setConfigured(data.configured);
      setStats(data.stats);
      setActivity(data.recentActivity || []);
      setRepos(data.repoActivity || []);
      setRateLimit(data.rateLimit);
      setError(null);
    } catch (e) {
      console.error("[GitDashboard] Error:", e);
      setError("Failed to load Git data");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return then.toLocaleDateString();
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "push":
        return <GitCommit className="w-4 h-4 text-emerald-400" />;
      case "pr":
        return <GitPullRequest className="w-4 h-4 text-purple-400" />;
      case "issue":
        return <Bug className="w-4 h-4 text-amber-400" />;
      case "review":
        return <Eye className="w-4 h-4 text-cyan-400" />;
      case "release":
        return <Rocket className="w-4 h-4 text-pink-400" />;
      case "star":
        return <Star className="w-4 h-4 text-yellow-400" />;
      case "fork":
        return <GitBranch className="w-4 h-4 text-blue-400" />;
      case "workflow":
        return <Zap className="w-4 h-4 text-orange-400" />;
      default:
        return <Activity className="w-4 h-4 text-white/60" />;
    }
  };

  const getLanguageColor = (language: string | null): string => {
    if (!language) return "bg-gray-400";
    const colors: Record<string, string> = {
      TypeScript: "bg-blue-400",
      JavaScript: "bg-yellow-400",
      Python: "bg-green-500",
      Rust: "bg-orange-400",
      Go: "bg-cyan-400",
      Java: "bg-red-400",
      Ruby: "bg-red-500",
      PHP: "bg-purple-400",
      CSS: "bg-pink-400",
      HTML: "bg-orange-500",
      Swift: "bg-orange-400",
      Kotlin: "bg-purple-500",
      "C#": "bg-green-600",
      "C++": "bg-pink-500",
      C: "bg-gray-400",
    };
    return colors[language] || "bg-white/40";
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`bg-white/5 rounded-xl border border-white/10 p-8 ${className}`}>
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="w-5 h-5 text-white/40 animate-spin" />
          <span className="text-white/40">Loading Git data...</span>
        </div>
      </div>
    );
  }

  // Not configured state
  if (!configured) {
    return (
      <div className={`bg-white/5 rounded-xl border border-white/10 p-6 ${className}`}>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">GitHub Not Connected</h3>
            <p className="text-white/60 text-sm mb-4">
              Add your <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs">GITHUB_TOKEN</code> to enable full Git integration.
            </p>
            <a
              href="https://github.com/settings/tokens/new"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#ef4444] hover:bg-[#dc2626] text-white text-sm font-medium rounded-lg transition-colors"
            >
              Create Token
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`bg-white/5 rounded-xl border border-white/10 p-6 ${className}`}>
        <div className="flex items-center gap-3 text-red-400">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
          <button
            onClick={handleRefresh}
            className="ml-auto p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Compact mode
  if (compact) {
    return (
      <div className={`bg-white/5 rounded-xl border border-white/10 overflow-hidden ${className}`}>
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Github className="w-4 h-4 text-white" />
            <h3 className="text-sm font-semibold text-white">Git Activity</h3>
          </div>
          <div className="flex items-center gap-2">
            {stats && (
              <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                {stats.commitsToday} commits today
              </span>
            )}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-white/40 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
        <div className="divide-y divide-white/5 max-h-64 overflow-y-auto">
          {activity.slice(0, 5).map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors"
            >
              {getActivityIcon(item.type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{item.description}</p>
                <p className="text-xs text-white/40">{item.repo.split("/")[1]}</p>
              </div>
              <span className="text-xs text-white/30 flex-shrink-0">{formatTimeAgo(item.createdAt)}</span>
            </a>
          ))}
        </div>
      </div>
    );
  }

  // Full dashboard
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with stats */}
      {showStats && stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={GitCommit}
            label="Commits Today"
            value={stats.commitsToday}
            trend={stats.commitsThisWeek > 0 ? `${stats.commitsThisWeek} this week` : undefined}
            color="text-emerald-400"
            bgColor="bg-emerald-400/10"
          />
          <StatCard
            icon={GitPullRequest}
            label="PRs This Week"
            value={stats.prsThisWeek}
            color="text-purple-400"
            bgColor="bg-purple-400/10"
          />
          <StatCard
            icon={Bug}
            label="Issues This Week"
            value={stats.issuesThisWeek}
            color="text-amber-400"
            bgColor="bg-amber-400/10"
          />
          <StatCard
            icon={Star}
            label="Total Stars"
            value={stats.totalStars}
            trend={`${stats.activeRepos} repos`}
            color="text-yellow-400"
            bgColor="bg-yellow-400/10"
          />
        </div>
      )}

      {/* Rate Limit Indicator */}
      {rateLimit && (
        <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-lg border border-white/10">
          <Zap className="w-4 h-4 text-white/40" />
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-white/60">API Rate Limit</span>
              <span className={`${rateLimit.percentUsed > 80 ? "text-amber-400" : "text-white/40"}`}>
                {rateLimit.remaining}/{rateLimit.limit} remaining
              </span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  rateLimit.percentUsed > 80 ? "bg-amber-400" : "bg-emerald-400"
                }`}
                style={{ width: `${100 - rateLimit.percentUsed}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
        <div className="flex items-center border-b border-white/10">
          <button
            onClick={() => setActiveTab("activity")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "activity"
                ? "text-white border-b-2 border-[#ef4444] bg-white/5"
                : "text-white/50 hover:text-white hover:bg-white/5"
            }`}
          >
            <Activity className="w-4 h-4 inline-block mr-2" />
            Activity
          </button>
          <button
            onClick={() => setActiveTab("repos")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "repos"
                ? "text-white border-b-2 border-[#ef4444] bg-white/5"
                : "text-white/50 hover:text-white hover:bg-white/5"
            }`}
          >
            <Code className="w-4 h-4 inline-block mr-2" />
            Repositories
          </button>
          <div className="px-4 py-3 flex items-center gap-2 border-l border-white/10">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 text-white/40 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>
            <a
              href="https://github.com/SeanSpon"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              title="View on GitHub"
            >
              <ExternalLink className="w-4 h-4 text-white/40" />
            </a>
          </div>
        </div>

        {/* Activity Tab */}
        {activeTab === "activity" && showActivity && (
          <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto">
            {activity.length === 0 ? (
              <div className="p-8 text-center text-white/40">
                No recent activity
              </div>
            ) : (
              activity.slice(0, maxItems).map((item) => (
                <motion.a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-start gap-4 px-4 py-3 hover:bg-white/5 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                    {getActivityIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-[#ef4444]">{item.action}</span>
                      <span className="text-xs text-white/30 font-mono bg-white/5 px-1.5 py-0.5 rounded">
                        {item.repo.split("/")[1]}
                      </span>
                    </div>
                    <p className="text-sm text-white group-hover:text-white/80 truncate">
                      {item.description}
                    </p>
                    <p className="text-xs text-white/40 mt-1">{formatTimeAgo(item.createdAt)}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-white/20 group-hover:text-white/60 flex-shrink-0 mt-1" />
                </motion.a>
              ))
            )}
          </div>
        )}

        {/* Repos Tab */}
        {activeTab === "repos" && showRepos && (
          <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto">
            {repos.length === 0 ? (
              <div className="p-8 text-center text-white/40">
                No repositories found
              </div>
            ) : (
              repos.slice(0, maxItems).map((repo) => (
                <a
                  key={repo.fullName}
                  href={repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 px-4 py-3 hover:bg-white/5 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Github className="w-5 h-5 text-white/60" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-white group-hover:text-[#ef4444] transition-colors">
                        {repo.name}
                      </h4>
                      {repo.isPrivate && (
                        <span className="px-1.5 py-0.5 text-[10px] bg-amber-400/20 text-amber-400 rounded">
                          Private
                        </span>
                      )}
                    </div>
                    {repo.description && (
                      <p className="text-xs text-white/50 line-clamp-1 mb-2">{repo.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-white/40">
                      {repo.language && (
                        <span className="flex items-center gap-1">
                          <span className={`w-2 h-2 rounded-full ${getLanguageColor(repo.language)}`} />
                          {repo.language}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        {repo.stars}
                      </span>
                      <span className="flex items-center gap-1">
                        <GitBranch className="w-3 h-3" />
                        {repo.forks}
                      </span>
                      {repo.openIssues > 0 && (
                        <span className="flex items-center gap-1 text-amber-400">
                          <Bug className="w-3 h-3" />
                          {repo.openIssues}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-white/30">Updated</p>
                    <p className="text-xs text-white/50">{formatTimeAgo(repo.pushedAt)}</p>
                  </div>
                </a>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  color,
  bgColor,
}: {
  icon: any;
  label: string;
  value: number;
  trend?: string;
  color: string;
  bgColor: string;
}) {
  return (
    <div className="bg-white/5 rounded-xl border border-white/10 p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg ${bgColor} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <div>
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-xs text-white/50">{label}</p>
          {trend && <p className="text-xs text-white/30">{trend}</p>}
        </div>
      </div>
    </div>
  );
}

export default GitDashboard;
