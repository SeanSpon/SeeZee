"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

/**
 * Git Context - Admin-wide Git state management
 * Provides real-time Git status and activity across the admin dashboard
 */

export interface GitActivity {
  id: string;
  type: "push" | "pr" | "issue" | "review" | "release" | "fork" | "star" | "workflow";
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

export interface GitRepo {
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

export interface GitPullRequest {
  id: number;
  number: number;
  title: string;
  state: "open" | "closed" | "merged";
  draft: boolean;
  author: {
    login: string;
    avatar: string;
  };
  createdAt: string;
  url: string;
  repo: string;
  headBranch: string;
  baseBranch: string;
}

export interface GitIssue {
  id: number;
  number: number;
  title: string;
  state: "open" | "closed";
  author: {
    login: string;
    avatar: string;
  };
  labels: Array<{ name: string; color: string }>;
  createdAt: string;
  url: string;
  repo: string;
}

export interface GitWorkflowRun {
  id: number;
  name: string;
  status: string;
  conclusion: string | null;
  url: string;
  branch: string;
  repo: string;
  createdAt: string;
}

export interface GitStats {
  commitsToday: number;
  commitsThisWeek: number;
  openPRs: number;
  openIssues: number;
  activeRepos: number;
  lastActivity: string | null;
}

export interface GitConfig {
  configured: boolean;
  username: string;
  rateLimit?: {
    limit: number;
    remaining: number;
    reset: string;
  };
}

interface GitContextValue {
  // State
  isLoading: boolean;
  isConfigured: boolean;
  config: GitConfig | null;
  activities: GitActivity[];
  repos: GitRepo[];
  pullRequests: GitPullRequest[];
  issues: GitIssue[];
  workflows: GitWorkflowRun[];
  stats: GitStats;
  error: string | null;

  // Actions
  refresh: () => Promise<void>;
  fetchRepoActivity: (owner: string, repo: string) => Promise<void>;
  fetchRepoPRs: (owner: string, repo: string) => Promise<GitPullRequest[]>;
  fetchRepoIssues: (owner: string, repo: string) => Promise<GitIssue[]>;
  fetchRepoWorkflows: (owner: string, repo: string) => Promise<GitWorkflowRun[]>;
}

const GitContext = createContext<GitContextValue | null>(null);

export function useGit() {
  const context = useContext(GitContext);
  if (!context) {
    throw new Error("useGit must be used within a GitProvider");
  }
  return context;
}

// Hook for optional use (doesn't throw)
export function useGitOptional() {
  return useContext(GitContext);
}

interface GitProviderProps {
  children: ReactNode;
}

export function GitProvider({ children }: GitProviderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [config, setConfig] = useState<GitConfig | null>(null);
  const [activities, setActivities] = useState<GitActivity[]>([]);
  const [repos, setRepos] = useState<GitRepo[]>([]);
  const [pullRequests, setPullRequests] = useState<GitPullRequest[]>([]);
  const [issues, setIssues] = useState<GitIssue[]>([]);
  const [workflows, setWorkflows] = useState<GitWorkflowRun[]>([]);
  const [stats, setStats] = useState<GitStats>({
    commitsToday: 0,
    commitsThisWeek: 0,
    openPRs: 0,
    openIssues: 0,
    activeRepos: 0,
    lastActivity: null,
  });
  const [error, setError] = useState<string | null>(null);

  // Fetch main Git data
  const fetchGitData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch activity and repos from our API
      const [activityRes, prsRes, issuesRes, workflowsRes] = await Promise.all([
        fetch("/api/integrations/github/activity"),
        fetch("/api/admin/git/pull-requests").catch(() => ({ ok: false })),
        fetch("/api/admin/git/issues").catch(() => ({ ok: false })),
        fetch("/api/admin/git/workflows").catch(() => ({ ok: false })),
      ]);

      if (activityRes.ok) {
        const activityData = await activityRes.json();
        setActivities(activityData.events || []);
        setRepos(activityData.repos || []);
        setConfig({
          configured: activityData.configured || false,
          username: activityData.username || "SeanSpon",
          rateLimit: activityData.rateLimit,
        });

        // Calculate stats from activity
        const today = new Date().toDateString();
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const pushEvents = (activityData.events || []).filter(
          (e: GitActivity) => e.type === "push"
        );
        const commitsToday = pushEvents.filter(
          (e: GitActivity) => new Date(e.createdAt).toDateString() === today
        ).length;
        const commitsThisWeek = pushEvents.filter(
          (e: GitActivity) => new Date(e.createdAt) >= oneWeekAgo
        ).length;

        setStats((prev) => ({
          ...prev,
          commitsToday,
          commitsThisWeek,
          activeRepos: (activityData.repos || []).length,
          lastActivity: activityData.events?.[0]?.createdAt || null,
        }));
      }

      // Process PRs
      if ("ok" in prsRes && prsRes.ok) {
        const prsData = await (prsRes as Response).json();
        setPullRequests(prsData.pullRequests || []);
        setStats((prev) => ({
          ...prev,
          openPRs: (prsData.pullRequests || []).filter((pr: GitPullRequest) => pr.state === "open").length,
        }));
      }

      // Process Issues  
      if ("ok" in issuesRes && issuesRes.ok) {
        const issuesData = await (issuesRes as Response).json();
        setIssues(issuesData.issues || []);
        setStats((prev) => ({
          ...prev,
          openIssues: (issuesData.issues || []).filter((i: GitIssue) => i.state === "open").length,
        }));
      }

      // Process Workflows
      if ("ok" in workflowsRes && workflowsRes.ok) {
        const workflowsData = await (workflowsRes as Response).json();
        setWorkflows(workflowsData.workflows || []);
      }
    } catch (e) {
      console.error("[GitProvider] Failed to fetch Git data:", e);
      setError("Failed to fetch Git data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch data on mount
  useEffect(() => {
    fetchGitData();
  }, [fetchGitData]);

  // Fetch repo-specific activity
  const fetchRepoActivity = useCallback(async (owner: string, repo: string) => {
    try {
      const res = await fetch(`/api/admin/git/repo-activity?owner=${owner}&repo=${repo}`);
      if (res.ok) {
        const data = await res.json();
        // Merge with existing activities
        setActivities((prev) => {
          const newActivities = data.activities || [];
          const existingIds = new Set(prev.map((a) => a.id));
          const unique = newActivities.filter((a: GitActivity) => !existingIds.has(a.id));
          return [...unique, ...prev].slice(0, 100);
        });
      }
    } catch (e) {
      console.error(`[GitProvider] Failed to fetch activity for ${owner}/${repo}:`, e);
    }
  }, []);

  // Fetch PRs for a specific repo
  const fetchRepoPRs = useCallback(async (owner: string, repo: string): Promise<GitPullRequest[]> => {
    try {
      const res = await fetch(`/api/admin/git/pull-requests?owner=${owner}&repo=${repo}`);
      if (res.ok) {
        const data = await res.json();
        return data.pullRequests || [];
      }
    } catch (e) {
      console.error(`[GitProvider] Failed to fetch PRs for ${owner}/${repo}:`, e);
    }
    return [];
  }, []);

  // Fetch Issues for a specific repo
  const fetchRepoIssues = useCallback(async (owner: string, repo: string): Promise<GitIssue[]> => {
    try {
      const res = await fetch(`/api/admin/git/issues?owner=${owner}&repo=${repo}`);
      if (res.ok) {
        const data = await res.json();
        return data.issues || [];
      }
    } catch (e) {
      console.error(`[GitProvider] Failed to fetch issues for ${owner}/${repo}:`, e);
    }
    return [];
  }, []);

  // Fetch Workflows for a specific repo
  const fetchRepoWorkflows = useCallback(async (owner: string, repo: string): Promise<GitWorkflowRun[]> => {
    try {
      const res = await fetch(`/api/admin/git/workflows?owner=${owner}&repo=${repo}`);
      if (res.ok) {
        const data = await res.json();
        return data.workflows || [];
      }
    } catch (e) {
      console.error(`[GitProvider] Failed to fetch workflows for ${owner}/${repo}:`, e);
    }
    return [];
  }, []);

  const value: GitContextValue = {
    isLoading,
    isConfigured: config?.configured || false,
    config,
    activities,
    repos,
    pullRequests,
    issues,
    workflows,
    stats,
    error,
    refresh: fetchGitData,
    fetchRepoActivity,
    fetchRepoPRs,
    fetchRepoIssues,
    fetchRepoWorkflows,
  };

  return <GitContext.Provider value={value}>{children}</GitContext.Provider>;
}
