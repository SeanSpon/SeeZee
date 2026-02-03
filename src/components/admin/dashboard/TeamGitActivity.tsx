"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Github,
  GitCommit,
  GitPullRequest,
  Bug,
  Star,
  GitBranch,
  ExternalLink,
  RefreshCw,
  Loader2,
  Activity,
  Eye,
  Rocket,
  Zap,
  TrendingUp,
  Code,
} from "lucide-react";
import Link from "next/link";

interface GitHubUser {
  username: string;
  displayName: string;
  profileUrl: string;
  avatar?: string;
}

interface GitHubEvent {
  id: string;
  type: string;
  action: string;
  details: string;
  repo: string;
  repoUrl: string;
  actor: {
    username: string;
    avatar: string;
  };
  createdAt: string;
}

interface GitHubRepo {
  name: string;
  fullName: string;
  description: string | null;
  url: string;
  language: string | null;
  stars: number;
  forks: number;
  pushedAt: string;
  isPrivate: boolean;
}

interface UserActivity {
  username: string;
  events: GitHubEvent[];
  repos: GitHubRepo[];
  stats: {
    todayCommits: number;
    weekCommits: number;
    totalStars: number;
  };
}

const TEAM_MEMBERS: GitHubUser[] = [
  {
    username: "SeanSpon",
    displayName: "Sean",
    profileUrl: "https://github.com/SeanSpon",
  },
  {
    username: "zrobards",
    displayName: "Zach",
    profileUrl: "https://github.com/zrobards",
  },
];

export function TeamGitActivity() {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activities, setActivities] = useState<Map<string, UserActivity>>(new Map());
  const [selectedUser, setSelectedUser] = useState<string>("combined");
  const [viewMode, setViewMode] = useState<"feed" | "stats">("feed");
  const [error, setError] = useState<string | null>(null);

  const fetchTeamActivity = async () => {
    try {
      const results = await Promise.allSettled(
        TEAM_MEMBERS.map(async (member) => {
          const res = await fetch(`/api/integrations/github/activity?username=${member.username}&per_page=20`);
          if (!res.ok) throw new Error(`Failed to fetch activity for ${member.username}`);
          const data = await res.json();
          
          // Calculate stats
          const now = new Date();
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          
          const pushEvents = (data.events || []).filter((e: any) => e.type === "PushEvent");
          const todayCommits = pushEvents.filter((e: any) => new Date(e.createdAt) >= today).length;
          const weekCommits = pushEvents.filter((e: any) => new Date(e.createdAt) >= oneWeekAgo).length;
          const totalStars = (data.repos || []).reduce((sum: number, r: any) => sum + r.stars, 0);

          return {
            username: member.username,
            events: data.events || [],
            repos: data.repos || [],
            stats: {
              todayCommits,
              weekCommits,
              totalStars,
            },
          };
        })
      );

      const newActivities = new Map<string, UserActivity>();
      results.forEach((result) => {
        if (result.status === "fulfilled") {
          newActivities.set(result.value.username, result.value);
        }
      });

      setActivities(newActivities);
      setError(null);
    } catch (e) {
      console.error("[TeamGitActivity] Error:", e);
      setError("Failed to load team Git activity");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTeamActivity();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchTeamActivity();
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "PushEvent":
        return <GitCommit className="w-3.5 h-3.5 text-emerald-400" />;
      case "PullRequestEvent":
        return <GitPullRequest className="w-3.5 h-3.5 text-purple-400" />;
      case "IssuesEvent":
        return <Bug className="w-3.5 h-3.5 text-amber-400" />;
      case "PullRequestReviewEvent":
        return <Eye className="w-3.5 h-3.5 text-cyan-400" />;
      case "ReleaseEvent":
        return <Rocket className="w-3.5 h-3.5 text-pink-400" />;
      case "WatchEvent":
        return <Star className="w-3.5 h-3.5 text-yellow-400" />;
      case "ForkEvent":
        return <GitBranch className="w-3.5 h-3.5 text-blue-400" />;
      case "WorkflowRunEvent":
        return <Zap className="w-3.5 h-3.5 text-orange-400" />;
      default:
        return <Activity className="w-3.5 h-3.5 text-white/60" />;
    }
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return then.toLocaleDateString();
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
    };
    return colors[language] || "bg-white/40";
  };

  const getCombinedEvents = (): GitHubEvent[] => {
    const allEvents: GitHubEvent[] = [];
    activities.forEach((activity) => {
      allEvents.push(...activity.events);
    });
    // Sort by date descending
    return allEvents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const getFilteredEvents = (): GitHubEvent[] => {
    if (selectedUser === "combined") {
      return getCombinedEvents().slice(0, 15);
    }
    const userActivity = activities.get(selectedUser);
    return userActivity?.events.slice(0, 15) || [];
  };

  const getTotalStats = () => {
    let todayCommits = 0;
    let weekCommits = 0;
    let totalStars = 0;

    activities.forEach((activity) => {
      todayCommits += activity.stats.todayCommits;
      weekCommits += activity.stats.weekCommits;
      totalStars += activity.stats.totalStars;
    });

    return { todayCommits, weekCommits, totalStars };
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border border-white/[0.08] bg-slate-900/50 backdrop-blur-xl p-6">
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="w-5 h-5 text-white/40 animate-spin" />
          <span className="text-white/40 text-sm">Loading team Git activity...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-white/[0.08] bg-slate-900/50 backdrop-blur-xl p-6">
        <div className="flex items-center gap-3 text-rose-400">
          <Bug className="w-5 h-5" />
          <span className="text-sm">{error}</span>
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

  const totalStats = getTotalStats();
  const events = getFilteredEvents();

  return (
    <section className="rounded-xl border border-white/[0.08] bg-slate-900/50 backdrop-blur-xl overflow-hidden transition-all duration-300 hover:border-white/[0.12]">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/[0.08]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#ef4444]/10">
              <Github className="w-5 h-5 text-[#ef4444]" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Team GitHub Activity</h2>
              <p className="text-xs text-slate-500">Real-time development feed</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === "feed" ? "stats" : "feed")}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Toggle view"
            >
              {viewMode === "feed" ? (
                <TrendingUp className="w-4 h-4 text-white/40" />
              ) : (
                <Activity className="w-4 h-4 text-white/40" />
              )}
            </button>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 text-white/40 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* User Filter Tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedUser("combined")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              selectedUser === "combined"
                ? "bg-[#ef4444] text-white"
                : "bg-white/[0.05] text-white/60 hover:bg-white/[0.08] hover:text-white"
            }`}
          >
            All Team
          </button>
          {TEAM_MEMBERS.map((member) => {
            const userActivity = activities.get(member.username);
            const hasActivity = userActivity && userActivity.events.length > 0;
            
            return (
              <button
                key={member.username}
                onClick={() => setSelectedUser(member.username)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-2 ${
                  selectedUser === member.username
                    ? "bg-sky-500 text-white"
                    : "bg-white/[0.05] text-white/60 hover:bg-white/[0.08] hover:text-white"
                }`}
              >
                <span>{member.displayName}</span>
                {hasActivity && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats Overview */}
      {viewMode === "stats" && (
        <div className="p-5 grid grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-white/[0.03] border border-white/[0.06]">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded bg-emerald-500/10">
                <GitCommit className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Today</p>
            </div>
            <p className="text-2xl font-bold text-white">{totalStats.todayCommits}</p>
            <p className="text-xs text-slate-500 mt-1">commits</p>
          </div>
          <div className="p-4 rounded-lg bg-white/[0.03] border border-white/[0.06]">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded bg-sky-500/10">
                <TrendingUp className="w-4 h-4 text-sky-400" />
              </div>
              <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">This Week</p>
            </div>
            <p className="text-2xl font-bold text-white">{totalStats.weekCommits}</p>
            <p className="text-xs text-slate-500 mt-1">commits</p>
          </div>
          <div className="p-4 rounded-lg bg-white/[0.03] border border-white/[0.06]">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded bg-yellow-500/10">
                <Star className="w-4 h-4 text-yellow-400" />
              </div>
              <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Stars</p>
            </div>
            <p className="text-2xl font-bold text-white">{totalStats.totalStars}</p>
            <p className="text-xs text-slate-500 mt-1">total</p>
          </div>
        </div>
      )}

      {/* Activity Feed */}
      {viewMode === "feed" && (
        <div className="divide-y divide-white/[0.05] max-h-[500px] overflow-y-auto">
          {events.length === 0 ? (
            <div className="p-8 text-center text-white/40 text-sm">
              No recent activity
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {events.map((event, idx) => {
                const member = TEAM_MEMBERS.find((m) => m.username === event.actor.username);
                const displayName = member?.displayName || event.actor.username;
                
                return (
                  <motion.div
                    key={`${event.id}-${idx}`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-start gap-3 px-5 py-3 hover:bg-white/[0.03] transition-colors group"
                  >
                    {/* Avatar/Icon */}
                    <div className="w-8 h-8 rounded-lg bg-white/[0.08] flex items-center justify-center flex-shrink-0 group-hover:bg-white/[0.12] transition-colors">
                      {getActivityIcon(event.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-white">{displayName}</span>
                        <span className="text-xs text-white/40">{event.action}</span>
                        <span className="text-xs text-white/30 font-mono bg-white/[0.05] px-1.5 py-0.5 rounded truncate max-w-[150px]">
                          {event.repo.split("/")[1] || event.repo}
                        </span>
                      </div>
                      {event.details && (
                        <p className="text-sm text-white/60 truncate">{event.details}</p>
                      )}
                      <p className="text-xs text-white/40 mt-1">{formatTimeAgo(event.createdAt)}</p>
                    </div>

                    {/* External Link */}
                    <a
                      href={event.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 hover:bg-white/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                      title="View on GitHub"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-white/40" />
                    </a>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      )}

      {/* Footer with GitHub Links */}
      <div className="px-5 py-3 border-t border-white/[0.08] bg-white/[0.02]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {TEAM_MEMBERS.map((member) => (
              <a
                key={member.username}
                href={member.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs text-white/50 hover:text-white transition-colors group"
              >
                <Code className="w-3.5 h-3.5" />
                <span className="group-hover:text-sky-400 transition-colors">{member.displayName}</span>
                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            ))}
          </div>
          <Link
            href="/admin/git"
            className="text-xs text-sky-400 hover:text-sky-300 transition-colors font-medium"
          >
            View Full Git Dashboard →
          </Link>
        </div>
      </div>
    </section>
  );
}

export default TeamGitActivity;
