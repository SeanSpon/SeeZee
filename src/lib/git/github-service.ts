/**
 * Enhanced GitHub API Service
 * Centralized GitHub API integration for the admin dashboard
 * Provides comprehensive Git functionality across the entire admin
 */

export interface GitHubCommit {
  sha: string;
  fullSha: string;
  message: string;
  fullMessage: string;
  author: {
    name: string;
    email: string;
    avatar?: string;
  };
  date: string;
  url: string;
  stats?: {
    additions: number;
    deletions: number;
    total: number;
  };
}

export interface GitHubBranch {
  name: string;
  protected: boolean;
  isDefault: boolean;
  commit: {
    sha: string;
    url: string;
  };
  aheadBy?: number;
  behindBy?: number;
}

export interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: "open" | "closed" | "merged";
  draft: boolean;
  author: {
    login: string;
    avatar: string;
  };
  createdAt: string;
  updatedAt: string;
  mergedAt: string | null;
  closedAt: string | null;
  url: string;
  headBranch: string;
  baseBranch: string;
  additions: number;
  deletions: number;
  changedFiles: number;
  reviewers: Array<{
    login: string;
    avatar: string;
    state: string;
  }>;
  labels: Array<{
    name: string;
    color: string;
  }>;
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: "open" | "closed";
  author: {
    login: string;
    avatar: string;
  };
  assignees: Array<{
    login: string;
    avatar: string;
  }>;
  labels: Array<{
    name: string;
    color: string;
  }>;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  url: string;
  commentsCount: number;
}

export interface GitHubRepository {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  private: boolean;
  fork: boolean;
  url: string;
  cloneUrl: string;
  sshUrl: string;
  language: string | null;
  stars: number;
  watchers: number;
  forks: number;
  openIssues: number;
  defaultBranch: string;
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
  size: number;
  topics: string[];
  hasWiki: boolean;
  hasIssues: boolean;
  hasProjects: boolean;
  archived: boolean;
  disabled: boolean;
  visibility: "public" | "private" | "internal";
}

export interface GitHubWorkflowRun {
  id: number;
  name: string;
  status: "queued" | "in_progress" | "completed" | "waiting";
  conclusion: "success" | "failure" | "cancelled" | "skipped" | "neutral" | "timed_out" | "action_required" | null;
  url: string;
  branch: string;
  commit: string;
  actor: {
    login: string;
    avatar: string;
  };
  createdAt: string;
  updatedAt: string;
  runStartedAt: string;
}

export interface GitHubActivity {
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
  metadata?: Record<string, any>;
}

export interface GitHubStats {
  totalCommits: number;
  commitsToday: number;
  commitsThisWeek: number;
  commitsThisMonth: number;
  openPRs: number;
  mergedPRsThisWeek: number;
  openIssues: number;
  closedIssuesThisWeek: number;
  activeContributors: number;
  lastActivity: string | null;
}

export interface GitHubConfig {
  token: string | null;
  username: string;
  organization?: string;
  configured: boolean;
  rateLimit?: {
    limit: number;
    remaining: number;
    reset: Date;
  };
}

const GITHUB_API_BASE = "https://api.github.com";

/**
 * Get GitHub API headers with optional token
 */
function getHeaders(token?: string | null): HeadersInit {
  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "SeeZee-Admin-Dashboard",
  };

  const apiToken = token || process.env.GITHUB_TOKEN;
  if (apiToken) {
    headers.Authorization = `Bearer ${apiToken}`;
  }

  return headers;
}

/**
 * Parse repository URL to extract owner and repo
 */
export function parseRepoUrl(repoUrl: string): { owner: string; repo: string } | null {
  if (!repoUrl) return null;

  // Remove .git suffix if present
  repoUrl = repoUrl.replace(/\.git$/, "");

  // Handle full URL
  const urlMatch = repoUrl.match(/github\.com[/:]([^/]+)\/([^/]+?)(?:\.git)?(?:\/|$)/);
  if (urlMatch) {
    return { owner: urlMatch[1], repo: urlMatch[2] };
  }

  // Handle owner/repo format
  if (repoUrl.includes("/") && !repoUrl.includes("://")) {
    const parts = repoUrl.split("/").filter(Boolean);
    if (parts.length >= 2) {
      return { owner: parts[0], repo: parts[1] };
    }
  }

  return null;
}

/**
 * Fetch repository information
 */
export async function fetchRepository(
  owner: string,
  repo: string,
  token?: string | null
): Promise<GitHubRepository | null> {
  try {
    const res = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, {
      headers: getHeaders(token),
      next: { revalidate: 60 },
    });

    if (!res.ok) return null;

    const data = await res.json();
    return {
      id: data.id,
      name: data.name,
      fullName: data.full_name,
      description: data.description,
      private: data.private,
      fork: data.fork,
      url: data.html_url,
      cloneUrl: data.clone_url,
      sshUrl: data.ssh_url,
      language: data.language,
      stars: data.stargazers_count,
      watchers: data.watchers_count,
      forks: data.forks_count,
      openIssues: data.open_issues_count,
      defaultBranch: data.default_branch,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      pushedAt: data.pushed_at,
      size: data.size,
      topics: data.topics || [],
      hasWiki: data.has_wiki,
      hasIssues: data.has_issues,
      hasProjects: data.has_projects,
      archived: data.archived,
      disabled: data.disabled,
      visibility: data.visibility,
    };
  } catch (error) {
    console.error(`[GitHub] Failed to fetch repository ${owner}/${repo}:`, error);
    return null;
  }
}

/**
 * Fetch recent commits for a repository
 */
export async function fetchCommits(
  owner: string,
  repo: string,
  options: {
    branch?: string;
    since?: string;
    until?: string;
    perPage?: number;
    author?: string;
  } = {},
  token?: string | null
): Promise<GitHubCommit[]> {
  try {
    const url = new URL(`${GITHUB_API_BASE}/repos/${owner}/${repo}/commits`);
    url.searchParams.set("per_page", String(options.perPage || 30));
    if (options.branch) url.searchParams.set("sha", options.branch);
    if (options.since) url.searchParams.set("since", options.since);
    if (options.until) url.searchParams.set("until", options.until);
    if (options.author) url.searchParams.set("author", options.author);

    const res = await fetch(url.toString(), {
      headers: getHeaders(token),
      next: { revalidate: 60 },
    });

    if (!res.ok) return [];

    const data = await res.json();
    return data.map((c: any) => ({
      sha: c.sha.substring(0, 7),
      fullSha: c.sha,
      message: c.commit.message.split("\n")[0],
      fullMessage: c.commit.message,
      author: {
        name: c.commit.author.name,
        email: c.commit.author.email,
        avatar: c.author?.avatar_url,
      },
      date: c.commit.author.date,
      url: c.html_url,
      stats: c.stats
        ? {
            additions: c.stats.additions,
            deletions: c.stats.deletions,
            total: c.stats.total,
          }
        : undefined,
    }));
  } catch (error) {
    console.error(`[GitHub] Failed to fetch commits for ${owner}/${repo}:`, error);
    return [];
  }
}

/**
 * Fetch branches for a repository
 */
export async function fetchBranches(
  owner: string,
  repo: string,
  token?: string | null
): Promise<GitHubBranch[]> {
  try {
    const [branchesRes, repoRes] = await Promise.all([
      fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/branches?per_page=100`, {
        headers: getHeaders(token),
        next: { revalidate: 120 },
      }),
      fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, {
        headers: getHeaders(token),
        next: { revalidate: 120 },
      }),
    ]);

    if (!branchesRes.ok) return [];

    const branches = await branchesRes.json();
    const repoData = repoRes.ok ? await repoRes.json() : null;
    const defaultBranch = repoData?.default_branch || "main";

    return branches.map((b: any) => ({
      name: b.name,
      protected: b.protected,
      isDefault: b.name === defaultBranch,
      commit: {
        sha: b.commit.sha.substring(0, 7),
        url: b.commit.url,
      },
    }));
  } catch (error) {
    console.error(`[GitHub] Failed to fetch branches for ${owner}/${repo}:`, error);
    return [];
  }
}

/**
 * Fetch pull requests for a repository
 */
export async function fetchPullRequests(
  owner: string,
  repo: string,
  options: {
    state?: "open" | "closed" | "all";
    perPage?: number;
    sort?: "created" | "updated" | "popularity" | "long-running";
    direction?: "asc" | "desc";
  } = {},
  token?: string | null
): Promise<GitHubPullRequest[]> {
  try {
    const url = new URL(`${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls`);
    url.searchParams.set("state", options.state || "all");
    url.searchParams.set("per_page", String(options.perPage || 20));
    url.searchParams.set("sort", options.sort || "updated");
    url.searchParams.set("direction", options.direction || "desc");

    const res = await fetch(url.toString(), {
      headers: getHeaders(token),
      next: { revalidate: 60 },
    });

    if (!res.ok) return [];

    const data = await res.json();
    return data.map((pr: any) => ({
      id: pr.id,
      number: pr.number,
      title: pr.title,
      body: pr.body,
      state: pr.merged_at ? "merged" : pr.state,
      draft: pr.draft,
      author: {
        login: pr.user.login,
        avatar: pr.user.avatar_url,
      },
      createdAt: pr.created_at,
      updatedAt: pr.updated_at,
      mergedAt: pr.merged_at,
      closedAt: pr.closed_at,
      url: pr.html_url,
      headBranch: pr.head.ref,
      baseBranch: pr.base.ref,
      additions: pr.additions || 0,
      deletions: pr.deletions || 0,
      changedFiles: pr.changed_files || 0,
      reviewers: (pr.requested_reviewers || []).map((r: any) => ({
        login: r.login,
        avatar: r.avatar_url,
        state: "pending",
      })),
      labels: (pr.labels || []).map((l: any) => ({
        name: l.name,
        color: l.color,
      })),
    }));
  } catch (error) {
    console.error(`[GitHub] Failed to fetch PRs for ${owner}/${repo}:`, error);
    return [];
  }
}

/**
 * Fetch issues for a repository
 */
export async function fetchIssues(
  owner: string,
  repo: string,
  options: {
    state?: "open" | "closed" | "all";
    perPage?: number;
    labels?: string;
    sort?: "created" | "updated" | "comments";
    direction?: "asc" | "desc";
  } = {},
  token?: string | null
): Promise<GitHubIssue[]> {
  try {
    const url = new URL(`${GITHUB_API_BASE}/repos/${owner}/${repo}/issues`);
    url.searchParams.set("state", options.state || "open");
    url.searchParams.set("per_page", String(options.perPage || 20));
    url.searchParams.set("sort", options.sort || "updated");
    url.searchParams.set("direction", options.direction || "desc");
    if (options.labels) url.searchParams.set("labels", options.labels);

    const res = await fetch(url.toString(), {
      headers: getHeaders(token),
      next: { revalidate: 60 },
    });

    if (!res.ok) return [];

    const data = await res.json();
    // Filter out pull requests (they also appear in issues endpoint)
    return data
      .filter((issue: any) => !issue.pull_request)
      .map((issue: any) => ({
        id: issue.id,
        number: issue.number,
        title: issue.title,
        body: issue.body,
        state: issue.state,
        author: {
          login: issue.user.login,
          avatar: issue.user.avatar_url,
        },
        assignees: (issue.assignees || []).map((a: any) => ({
          login: a.login,
          avatar: a.avatar_url,
        })),
        labels: (issue.labels || []).map((l: any) => ({
          name: l.name,
          color: l.color,
        })),
        createdAt: issue.created_at,
        updatedAt: issue.updated_at,
        closedAt: issue.closed_at,
        url: issue.html_url,
        commentsCount: issue.comments,
      }));
  } catch (error) {
    console.error(`[GitHub] Failed to fetch issues for ${owner}/${repo}:`, error);
    return [];
  }
}

/**
 * Fetch workflow runs for a repository
 */
export async function fetchWorkflowRuns(
  owner: string,
  repo: string,
  options: {
    perPage?: number;
    branch?: string;
    status?: "queued" | "in_progress" | "completed";
  } = {},
  token?: string | null
): Promise<GitHubWorkflowRun[]> {
  try {
    const url = new URL(`${GITHUB_API_BASE}/repos/${owner}/${repo}/actions/runs`);
    url.searchParams.set("per_page", String(options.perPage || 10));
    if (options.branch) url.searchParams.set("branch", options.branch);
    if (options.status) url.searchParams.set("status", options.status);

    const res = await fetch(url.toString(), {
      headers: getHeaders(token),
      next: { revalidate: 60 },
    });

    if (!res.ok) return [];

    const data = await res.json();
    return (data.workflow_runs || []).map((run: any) => ({
      id: run.id,
      name: run.name,
      status: run.status,
      conclusion: run.conclusion,
      url: run.html_url,
      branch: run.head_branch,
      commit: run.head_sha.substring(0, 7),
      actor: {
        login: run.actor.login,
        avatar: run.actor.avatar_url,
      },
      createdAt: run.created_at,
      updatedAt: run.updated_at,
      runStartedAt: run.run_started_at,
    }));
  } catch (error) {
    console.error(`[GitHub] Failed to fetch workflow runs for ${owner}/${repo}:`, error);
    return [];
  }
}

/**
 * Fetch user activity/events
 */
export async function fetchUserActivity(
  username: string,
  options: {
    perPage?: number;
  } = {},
  token?: string | null
): Promise<GitHubActivity[]> {
  try {
    const url = new URL(`${GITHUB_API_BASE}/users/${username}/events`);
    url.searchParams.set("per_page", String(options.perPage || 30));

    const res = await fetch(url.toString(), {
      headers: getHeaders(token),
      next: { revalidate: 60 },
    });

    if (!res.ok) return [];

    const events = await res.json();
    return events.map((event: any) => {
      let type: GitHubActivity["type"] = "push";
      let action = "";
      let description = "";
      let eventUrl = event.repo?.url ? `https://github.com/${event.repo.name}` : "";

      switch (event.type) {
        case "PushEvent":
          type = "push";
          const commits = event.payload?.commits || [];
          action = "pushed";
          description = commits.length > 0 
            ? (commits.length === 1 ? commits[0].message : `${commits.length} commits - ${commits[0].message}`)
            : `pushed to ${event.repo?.name?.split("/")[1] || event.repo?.name || "repo"}`;
          break;
        case "PullRequestEvent":
          type = "pr";
          action = event.payload?.action || "updated";
          description = event.payload?.pull_request?.title || "";
          eventUrl = event.payload?.pull_request?.html_url || eventUrl;
          break;
        case "IssuesEvent":
          type = "issue";
          action = event.payload?.action || "updated";
          description = event.payload?.issue?.title || "";
          eventUrl = event.payload?.issue?.html_url || eventUrl;
          break;
        case "PullRequestReviewEvent":
          type = "review";
          action = event.payload?.action || "reviewed";
          description = `PR #${event.payload?.pull_request?.number}`;
          eventUrl = event.payload?.review?.html_url || eventUrl;
          break;
        case "ReleaseEvent":
          type = "release";
          action = event.payload?.action || "published";
          description = event.payload?.release?.tag_name || "";
          eventUrl = event.payload?.release?.html_url || eventUrl;
          break;
        case "ForkEvent":
          type = "fork";
          action = "forked";
          description = event.payload?.forkee?.full_name || "";
          break;
        case "WatchEvent":
          type = "star";
          action = "starred";
          description = event.repo?.name || "";
          break;
        case "WorkflowRunEvent":
          type = "workflow";
          action = event.payload?.action || "triggered";
          description = event.payload?.workflow_run?.name || "";
          break;
        default:
          action = event.type.replace("Event", "").toLowerCase();
      }

      return {
        id: event.id,
        type,
        action,
        description,
        repo: event.repo?.name || "",
        repoUrl: `https://github.com/${event.repo?.name}`,
        actor: {
          login: event.actor?.login || "",
          avatar: event.actor?.avatar_url || "",
        },
        createdAt: event.created_at,
        url: eventUrl,
        metadata: event.payload,
      };
    });
  } catch (error) {
    console.error(`[GitHub] Failed to fetch activity for ${username}:`, error);
    return [];
  }
}

/**
 * Fetch user repositories
 */
export async function fetchUserRepositories(
  username: string,
  options: {
    perPage?: number;
    sort?: "created" | "updated" | "pushed" | "full_name";
    type?: "all" | "owner" | "member";
  } = {},
  token?: string | null
): Promise<GitHubRepository[]> {
  try {
    const url = new URL(`${GITHUB_API_BASE}/users/${username}/repos`);
    url.searchParams.set("per_page", String(options.perPage || 30));
    url.searchParams.set("sort", options.sort || "pushed");
    url.searchParams.set("type", options.type || "all");

    const res = await fetch(url.toString(), {
      headers: getHeaders(token),
      next: { revalidate: 120 },
    });

    if (!res.ok) return [];

    const data = await res.json();
    return data.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      private: repo.private,
      fork: repo.fork,
      url: repo.html_url,
      cloneUrl: repo.clone_url,
      sshUrl: repo.ssh_url,
      language: repo.language,
      stars: repo.stargazers_count,
      watchers: repo.watchers_count,
      forks: repo.forks_count,
      openIssues: repo.open_issues_count,
      defaultBranch: repo.default_branch,
      createdAt: repo.created_at,
      updatedAt: repo.updated_at,
      pushedAt: repo.pushed_at,
      size: repo.size,
      topics: repo.topics || [],
      hasWiki: repo.has_wiki,
      hasIssues: repo.has_issues,
      hasProjects: repo.has_projects,
      archived: repo.archived,
      disabled: repo.disabled,
      visibility: repo.visibility,
    }));
  } catch (error) {
    console.error(`[GitHub] Failed to fetch repos for ${username}:`, error);
    return [];
  }
}

/**
 * Get rate limit status
 */
export async function fetchRateLimit(token?: string | null): Promise<GitHubConfig["rateLimit"] | null> {
  try {
    const res = await fetch(`${GITHUB_API_BASE}/rate_limit`, {
      headers: getHeaders(token),
    });

    if (!res.ok) return null;

    const data = await res.json();
    return {
      limit: data.resources.core.limit,
      remaining: data.resources.core.remaining,
      reset: new Date(data.resources.core.reset * 1000),
    };
  } catch (error) {
    return null;
  }
}

/**
 * Calculate comprehensive stats for a repository
 */
export async function calculateRepositoryStats(
  owner: string,
  repo: string,
  token?: string | null
): Promise<GitHubStats> {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [commits, prs, issues] = await Promise.all([
    fetchCommits(owner, repo, { perPage: 100, since: oneMonthAgo.toISOString() }, token),
    fetchPullRequests(owner, repo, { state: "all", perPage: 50 }, token),
    fetchIssues(owner, repo, { state: "all", perPage: 50 }, token),
  ]);

  const commitsToday = commits.filter((c) => new Date(c.date) >= today).length;
  const commitsThisWeek = commits.filter((c) => new Date(c.date) >= oneWeekAgo).length;
  const openPRs = prs.filter((pr) => pr.state === "open").length;
  const mergedPRsThisWeek = prs.filter(
    (pr) => pr.state === "merged" && pr.mergedAt && new Date(pr.mergedAt) >= oneWeekAgo
  ).length;
  const openIssues = issues.filter((i) => i.state === "open").length;
  const closedIssuesThisWeek = issues.filter(
    (i) => i.state === "closed" && i.closedAt && new Date(i.closedAt) >= oneWeekAgo
  ).length;

  const uniqueAuthors = new Set(commits.map((c) => c.author.email));

  return {
    totalCommits: commits.length,
    commitsToday,
    commitsThisWeek,
    commitsThisMonth: commits.length,
    openPRs,
    mergedPRsThisWeek,
    openIssues,
    closedIssuesThisWeek,
    activeContributors: uniqueAuthors.size,
    lastActivity: commits[0]?.date || null,
  };
}

/**
 * Check if GitHub API is configured and working
 */
export async function checkGitHubConnection(): Promise<GitHubConfig> {
  const token = process.env.GITHUB_TOKEN || null;
  const username = process.env.GITHUB_USERNAME || "SeanSpon";
  const organization = process.env.GITHUB_ORG || undefined;

  const rateLimit = await fetchRateLimit(token);

  return {
    token,
    username,
    organization,
    configured: !!token,
    rateLimit: rateLimit || undefined,
  };
}
