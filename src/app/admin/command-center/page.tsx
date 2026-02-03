"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Command,
  Mail,
  Github,
  Globe,
  CreditCard,
  Database,
  Code,
  Terminal,
  ExternalLink,
  RefreshCw,
  Plus,
  Settings,
  Users,
  Inbox,
  Send,
  Archive,
  Star,
  Search,
  Filter,
  ChevronRight,
  Activity,
  GitBranch,
  GitCommit,
  GitPullRequest,
  Clock,
  CheckCircle,
  AlertCircle,
  Zap,
  Shield,
  Key,
  Layers,
  Cloud,
  Server,
  Cpu,
  HardDrive,
  Wifi,
  Lock,
  Sparkles,
  BarChart3,
  DollarSign,
  TrendingUp,
  Building2,
  FileText,
  Bookmark,
  MousePointer,
  Rocket,
  Package,
  Bug,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useGitOptional } from "@/lib/git/git-context";

// Quick Link Type
interface QuickLink {
  name: string;
  url: string;
  icon: LucideIcon;
  color: string;
  description: string;
  shortcut?: string;
}

interface QuickLinksConfig {
  development: QuickLink[];
  business: QuickLink[];
  infrastructure: QuickLink[];
  tools: QuickLink[];
}

// Quick Links Configuration
const QUICK_LINKS: QuickLinksConfig = {
  development: [
    {
      name: "GitHub",
      url: "https://github.com/SeanSpon",
      icon: Github,
      color: "from-gray-600 to-gray-800",
      description: "Repositories & Code",
      shortcut: "⌘G",
    },
    {
      name: "Vercel",
      url: "https://vercel.com/zach-robards-projects",
      icon: Globe,
      color: "from-black to-gray-800",
      description: "Deployments & Hosting",
      shortcut: "⌘V",
    },
    {
      name: "Cursor",
      url: "cursor://",
      icon: Code,
      color: "from-purple-600 to-purple-800",
      description: "AI-Powered IDE",
      shortcut: "⌘C",
    },
    {
      name: "VS Code",
      url: "vscode://",
      icon: Terminal,
      color: "from-blue-600 to-blue-800",
      description: "Code Editor",
      shortcut: "⌘E",
    },
  ],
  business: [
    {
      name: "Stripe",
      url: "https://dashboard.stripe.com",
      icon: CreditCard,
      color: "from-indigo-600 to-purple-600",
      description: "Payments & Billing",
      shortcut: "⌘S",
    },
    {
      name: "Relay",
      url: "https://relay.com",
      icon: Building2,
      color: "from-green-600 to-emerald-600",
      description: "Business Banking",
      shortcut: "⌘R",
    },
    {
      name: "Google Admin",
      url: "https://admin.google.com",
      icon: Shield,
      color: "from-red-500 to-orange-500",
      description: "Workspace Management",
      shortcut: "⌘A",
    },
    {
      name: "Google Workspace",
      url: "https://workspace.google.com",
      icon: Layers,
      color: "from-blue-500 to-cyan-500",
      description: "Email & Apps",
      shortcut: "⌘W",
    },
  ],
  infrastructure: [
    {
      name: "Cloudflare",
      url: "https://dash.cloudflare.com",
      icon: Cloud,
      color: "from-orange-500 to-amber-500",
      description: "DNS & Security",
    },
    {
      name: "Railway",
      url: "https://railway.app",
      icon: Server,
      color: "from-purple-500 to-pink-500",
      description: "Database Hosting",
    },
    {
      name: "Supabase",
      url: "https://supabase.com/dashboard",
      icon: Database,
      color: "from-emerald-500 to-green-600",
      description: "Database & Auth",
    },
    {
      name: "OpenAI",
      url: "https://platform.openai.com",
      icon: Sparkles,
      color: "from-teal-500 to-cyan-500",
      description: "AI APIs",
    },
  ],
  tools: [
    {
      name: "Figma",
      url: "https://figma.com",
      icon: MousePointer,
      color: "from-pink-500 to-rose-500",
      description: "Design Tool",
    },
    {
      name: "Notion",
      url: "https://notion.so",
      icon: FileText,
      color: "from-gray-700 to-gray-900",
      description: "Documentation",
    },
    {
      name: "Linear",
      url: "https://linear.app",
      icon: Zap,
      color: "from-indigo-500 to-violet-600",
      description: "Project Management",
    },
    {
      name: "Resend",
      url: "https://resend.com",
      icon: Send,
      color: "from-slate-600 to-slate-800",
      description: "Email API",
    },
  ],
};

interface GitEvent {
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
}

interface Deployment {
  id: string;
  name: string;
  url: string;
  inspectorUrl: string;
  state: string;
  target: string;
  createdAt: number;
  buildingAt: number;
  ready: number;
  source: string;
  meta: {
    branch: string;
    commit: string;
    message: string;
    author: string;
    repo: string;
  };
}

interface EmailAccount {
  email: string;
  name: string;
  role: string;
  primary: boolean;
  status: string;
  aliases: string[];
  createdAt: string;
}

interface ServiceStatus {
  name: string;
  status: "operational" | "degraded" | "down";
  responseTime?: number;
}

export default function CommandCenterPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [gitEvents, setGitEvents] = useState<GitEvent[]>([]);
  const [gitRepos, setGitRepos] = useState<GitRepo[]>([]);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [emailAccounts, setEmailAccounts] = useState<EmailAccount[]>([]);
  const [vercelWebhookActive, setVercelWebhookActive] = useState(false);
  const [services, setServices] = useState<ServiceStatus[]>([
    { name: "Vercel", status: "operational" },
    { name: "GitHub", status: "operational" },
    { name: "Stripe", status: "operational" },
    { name: "OpenAI", status: "operational" },
    { name: "Google Workspace", status: "operational" },
    { name: "Resend", status: "operational" },
  ]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    commitsToday: 0,
    activeDeployments: 0,
    unreadEmails: 0,
    mrr: "$0",
    openPRs: 0,
    openIssues: 0,
  });

  // Use the global Git context for shared state across admin
  const gitContext = useGitOptional();

  // Sync Git context data with local state when available
  useEffect(() => {
    if (gitContext && !gitContext.isLoading) {
      // Map Git context activities to local GitEvent format
      const mappedEvents: GitEvent[] = gitContext.activities.map(a => ({
        id: a.id,
        type: a.type === "push" ? "PushEvent" : a.type === "pr" ? "PullRequestEvent" : a.type,
        action: a.action,
        details: a.description,
        repo: a.repo,
        repoUrl: a.repoUrl,
        actor: {
          username: a.actor.login,
          avatar: a.actor.avatar,
        },
        createdAt: a.createdAt,
      }));
      setGitEvents(mappedEvents);
      
      // Map Git context repos
      const mappedRepos: GitRepo[] = gitContext.repos.map(r => ({
        name: r.name,
        fullName: r.fullName,
        description: r.description,
        url: r.url,
        language: r.language,
        stars: r.stars,
        forks: r.forks,
        pushedAt: r.pushedAt,
        isPrivate: r.isPrivate,
      }));
      setGitRepos(mappedRepos);
      
      // Update stats from context
      setStats(prev => ({
        ...prev,
        commitsToday: gitContext.stats.commitsToday,
        openPRs: gitContext.stats.openPRs,
        openIssues: gitContext.stats.openIssues,
      }));
      
      // Update GitHub service status
      if (!gitContext.isConfigured) {
        setServices(prev => prev.map(s => 
          s.name === "GitHub" ? { ...s, status: "degraded" as const } : s
        ));
      } else {
        setServices(prev => prev.map(s => 
          s.name === "GitHub" ? { ...s, status: "operational" as const } : s
        ));
      }
    }
  }, [gitContext?.activities, gitContext?.repos, gitContext?.stats, gitContext?.isLoading, gitContext?.isConfigured]);

  // Fetch all data (non-Git data is still fetched locally)
  useEffect(() => {
    async function fetchAllData() {
      setLoading(true);
      
      // Fallback: Fetch GitHub activity if context not available
      if (!gitContext) {
        try {
          const gitRes = await fetch("/api/integrations/github/activity");
          if (gitRes.ok) {
            const gitData = await gitRes.json();
            setGitEvents(gitData.events || []);
            setGitRepos(gitData.repos || []);
            
            const today = new Date().toDateString();
            const todayCommits = (gitData.events || []).filter(
              (e: GitEvent) => 
                e.type === "PushEvent" && 
                new Date(e.createdAt).toDateString() === today
            ).length;
            setStats(prev => ({ ...prev, commitsToday: todayCommits }));
            
            if (!gitData.configured) {
              setServices(prev => prev.map(s => 
                s.name === "GitHub" ? { ...s, status: "degraded" as const } : s
              ));
            }
          }
        } catch (e) {
          console.error("Failed to fetch GitHub data:", e);
          setServices(prev => prev.map(s => 
            s.name === "GitHub" ? { ...s, status: "down" as const } : s
          ));
        }
      }

      try {
        // Fetch Vercel deployments
        const vercelRes = await fetch("/api/integrations/vercel/deployments");
        if (vercelRes.ok) {
          const vercelData = await vercelRes.json();
          setDeployments(vercelData.deployments || []);
          
          // Check if webhooks are configured
          setVercelWebhookActive(vercelData.webhookConfigured || false);
          
          // Count active deployments
          const activeCount = (vercelData.deployments || []).filter(
            (d: Deployment) => d.state === "READY"
          ).length;
          setStats(prev => ({ ...prev, activeDeployments: activeCount }));
          
          // Update Vercel service status
          if (vercelData.error) {
            setServices(prev => prev.map(s => 
              s.name === "Vercel" ? { ...s, status: "degraded" as const } : s
            ));
          } else if (vercelData.deployments && vercelData.deployments.length > 0) {
            // Show connected if we have deployments (from webhook OR API)
            setServices(prev => prev.map(s => 
              s.name === "Vercel" ? { ...s, status: "operational" as const } : s
            ));
          } else {
            // No deployments but no error - show degraded
            setServices(prev => prev.map(s => 
              s.name === "Vercel" ? { ...s, status: "degraded" as const } : s
            ));
          }
        }
      } catch (e) {
        console.error("Failed to fetch Vercel data:", e);
        setServices(prev => prev.map(s => 
          s.name === "Vercel" ? { ...s, status: "down" as const } : s
        ));
      }

      try {
        // Fetch Google Workspace data
        const workspaceRes = await fetch("/api/integrations/google/workspace");
        if (workspaceRes.ok) {
          const workspaceData = await workspaceRes.json();
          setEmailAccounts(workspaceData.users || []);
        }
      } catch (e) {
        console.error("Failed to fetch Google Workspace data:", e);
      }

      try {
        // Fetch Stripe metrics
        const stripeRes = await fetch("/api/integrations/stripe/metrics");
        if (stripeRes.ok) {
          const stripeData = await stripeRes.json();
          if (stripeData.metrics) {
            setStats(prev => ({ ...prev, mrr: stripeData.metrics.mrr }));
          }
          // Update Stripe service status
          if (!stripeData.configured) {
            setServices(prev => prev.map(s => 
              s.name === "Stripe" ? { ...s, status: "degraded" as const } : s
            ));
          }
        }
      } catch (e) {
        console.error("Failed to fetch Stripe data:", e);
        setServices(prev => prev.map(s => 
          s.name === "Stripe" ? { ...s, status: "down" as const } : s
        ));
      }

      setLoading(false);
    }

    fetchAllData();
  }, []); // Run once on mount, don't depend on gitContext

  const filteredLinks = (Object.entries(QUICK_LINKS) as [keyof QuickLinksConfig, QuickLink[]][]).reduce((acc, [category, links]) => {
    const filtered = links.filter(
      (link) =>
        link.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[category] = filtered;
    }
    return acc;
  }, {} as Partial<QuickLinksConfig>);

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getLanguageColor = (language: string): string => {
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#ef4444] inline-block mb-2">
              Mission Control
            </span>
            <h1 className="text-4xl font-heading font-bold gradient-text">
              Command Center
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools & links..."
                className="pl-10 pr-4 py-2 w-64 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/40 focus:border-[#ef4444]/50 outline-none"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] bg-white/10 text-white/40 rounded">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>
        <p className="text-white/60 max-w-2xl">
          Your all-in-one hub for managing development tools, emails, deployments, and business operations.
        </p>
      </header>

      {/* Quick Stats - Enhanced with Git API integration */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <QuickStat
          icon={GitCommit}
          label="Commits Today"
          value={String(stats.commitsToday)}
          color="text-emerald-400"
          bgColor="bg-emerald-500/20"
        />
        <QuickStat
          icon={GitPullRequest}
          label="Open PRs"
          value={String(stats.openPRs)}
          color="text-purple-400"
          bgColor="bg-purple-500/20"
        />
        <QuickStat
          icon={Bug}
          label="Open Issues"
          value={String(stats.openIssues)}
          color="text-amber-400"
          bgColor="bg-amber-500/20"
        />
        <QuickStat
          icon={Globe}
          label="Deployments"
          value={String(stats.activeDeployments)}
          color="text-cyan-400"
          bgColor="bg-cyan-500/20"
        />
        <QuickStat
          icon={Mail}
          label="Email Accounts"
          value={String(emailAccounts.length)}
          color="text-blue-400"
          bgColor="bg-blue-500/20"
        />
        <QuickStat
          icon={CreditCard}
          label="MRR"
          value={stats.mrr}
          color="text-pink-400"
          bgColor="bg-pink-500/20"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Links - Takes 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Development Tools */}
          <LinkSection
            title="Development"
            icon={Code}
            links={filteredLinks.development || []}
            color="text-purple-400"
          />

          {/* Business Tools */}
          <LinkSection
            title="Business & Finance"
            icon={Building2}
            links={filteredLinks.business || []}
            color="text-emerald-400"
          />

          {/* Infrastructure */}
          <LinkSection
            title="Infrastructure"
            icon={Server}
            links={filteredLinks.infrastructure || []}
            color="text-cyan-400"
          />

          {/* Other Tools */}
          <LinkSection
            title="Tools & Design"
            icon={Package}
            links={filteredLinks.tools || []}
            color="text-pink-400"
          />

          {/* Git Repositories Panel */}
          {gitRepos.length > 0 && (
            <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
              <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Github className="w-4 h-4 text-white" />
                  <h3 className="font-semibold text-white">Repositories</h3>
                </div>
                <a
                  href="https://github.com/SeanSpon?tab=repositories"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-white/40 hover:text-white flex items-center gap-1"
                >
                  View All
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                {gitRepos.slice(0, 6).map((repo) => (
                  <a
                    key={repo.fullName}
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {repo.isPrivate ? (
                          <Lock className="w-4 h-4 text-amber-400" />
                        ) : (
                          <GitBranch className="w-4 h-4 text-white/40" />
                        )}
                        <h4 className="font-semibold text-white group-hover:text-[#ef4444] transition-colors truncate">
                          {repo.name}
                        </h4>
                      </div>
                      <ExternalLink className="w-3 h-3 text-white/20 group-hover:text-white/60 flex-shrink-0" />
                    </div>
                    {repo.description && (
                      <p className="text-xs text-white/40 line-clamp-2 mb-2">
                        {repo.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-white/40">
                      {repo.language && (
                        <div className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${getLanguageColor(repo.language)}`} />
                          <span>{repo.language}</span>
                        </div>
                      )}
                      {repo.stars > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          <span>{repo.stars}</span>
                        </div>
                      )}
                      <span className="text-white/30">
                        Updated {formatTimeAgo(repo.pushedAt)}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Git Activity */}
          <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Github className="w-4 h-4 text-white" />
                <h3 className="font-semibold text-white">Git Activity</h3>
              </div>
              <a
                href="https://github.com/SeanSpon"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-white/40 hover:text-white flex items-center gap-1"
              >
                View All
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="divide-y divide-white/5 max-h-80 overflow-y-auto">
              {loading ? (
                <div className="px-4 py-6 text-center text-white/40 text-sm">
                  Loading Git activity...
                </div>
              ) : gitEvents.length === 0 ? (
                <div className="px-4 py-6 text-center">
                  <p className="text-white/40 text-sm mb-2">No recent Git activity</p>
                  <p className="text-white/30 text-xs">
                    Add <code className="bg-white/10 px-1 rounded">GITHUB_TOKEN</code> to your environment for full integration
                  </p>
                </div>
              ) : (
                gitEvents.slice(0, 10).map((event) => (
                  <a
                    key={event.id}
                    href={event.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-3 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center mt-0.5">
                        <GitCommit className="w-3 h-3 text-white/60" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white">
                          <span className="text-[#ef4444]">{event.action}</span>
                          {event.details && (
                            <span className="text-white/80 truncate block">
                              {event.details}
                            </span>
                          )}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-white/40">
                          <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded">
                            {event.repo.split("/")[1] || event.repo}
                          </span>
                          <span>{formatTimeAgo(event.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </a>
                ))
              )}
            </div>
            <div className="px-4 py-3 bg-white/5 border-t border-white/10">
              <a
                href="https://github.com/SeanSpon/SeeZee/commits"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#ef4444] hover:text-white flex items-center justify-center gap-2 transition-colors"
              >
                View Commit History
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Email Accounts */}
          <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400" />
                <h3 className="font-semibold text-white">Email Accounts</h3>
              </div>
              <a
                href="https://admin.google.com/ac/users"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-white/40 hover:text-white flex items-center gap-1"
              >
                Manage
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="divide-y divide-white/5 max-h-80 overflow-y-auto">
              {loading ? (
                <div className="px-4 py-6 text-center text-white/40 text-sm">
                  Loading email accounts...
                </div>
              ) : emailAccounts.length === 0 ? (
                <div className="px-4 py-6 text-center text-white/40 text-sm">
                  No email accounts configured
                </div>
              ) : (
                emailAccounts.map((account) => (
                  <a
                    key={account.email}
                    href={`https://mail.google.com/mail/u/?authuser=${account.email}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors group"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      account.primary ? "bg-[#ef4444]/20" : "bg-white/10"
                    }`}>
                      <span className={`text-sm font-bold ${
                        account.primary ? "text-[#ef4444]" : "text-white/60"
                      }`}>
                        {account.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate group-hover:text-[#ef4444] transition-colors">
                        {account.email}
                      </p>
                      <p className="text-xs text-white/40">{account.role}</p>
                      {account.aliases && account.aliases.length > 0 && (
                        <p className="text-xs text-white/30 truncate">
                          Aliases: {account.aliases.join(", ")}
                        </p>
                      )}
                    </div>
                    {account.primary && (
                      <Star className="w-4 h-4 text-amber-400" />
                    )}
                  </a>
                ))
              )}
            </div>
            <div className="px-4 py-3 bg-white/5 border-t border-white/10">
              <a
                href="https://admin.google.com/ac/users"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-400 hover:text-white flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create New Email
              </a>
            </div>
          </div>

          {/* Connected Services */}
          <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <h3 className="font-semibold text-white">Connected Services</h3>
              </div>
            </div>
            <div className="p-4 space-y-3">
              {services.map((service) => (
                <ServiceStatusDisplay
                  key={service.name}
                  name={service.name}
                  status={service.status}
                />
              ))}
            </div>
          </div>

          {/* Vercel Deployments */}
          <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-white" />
                <h3 className="font-semibold text-white">Deployments</h3>
                {vercelWebhookActive && (
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 rounded-full flex items-center gap-1">
                    <Zap className="w-2.5 h-2.5" />
                    LIVE
                  </span>
                )}
              </div>
              <a
                href="https://vercel.com/zach-robards-projects"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-white/40 hover:text-white flex items-center gap-1"
              >
                View All
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="divide-y divide-white/5 max-h-64 overflow-y-auto">
              {loading ? (
                <div className="px-4 py-6 text-center text-white/40 text-sm">
                  Loading deployments...
                </div>
              ) : deployments.length === 0 ? (
                <div className="px-4 py-6 text-center text-white/40 text-sm">
                  No recent deployments
                </div>
              ) : (
                deployments.slice(0, 5).map((deployment) => (
                  <a
                    key={deployment.id}
                    href={`https://${deployment.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-3 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-white font-medium truncate">
                        {deployment.name}
                      </span>
                      <DeploymentStatusBadge status={deployment.state} />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/40">
                      {deployment.meta?.branch && (
                        <span className="flex items-center gap-1">
                          <GitBranch className="w-3 h-3" />
                          {deployment.meta.branch}
                        </span>
                      )}
                      {deployment.meta?.commit && (
                        <span className="font-mono bg-white/10 px-1 rounded">
                          {deployment.meta.commit}
                        </span>
                      )}
                      <span>{formatTimeAgo(new Date(deployment.createdAt).toISOString())}</span>
                    </div>
                  </a>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl px-2 py-2 flex items-center gap-1 shadow-2xl">
          <QuickActionButton
            icon={Github}
            label="GitHub"
            href="https://github.com/SeanSpon"
          />
          <QuickActionButton
            icon={Globe}
            label="Vercel"
            href="https://vercel.com/zach-robards-projects"
          />
          <QuickActionButton
            icon={Mail}
            label="Gmail"
            href="https://mail.google.com"
          />
          <QuickActionButton
            icon={CreditCard}
            label="Stripe"
            href="https://dashboard.stripe.com"
          />
          <div className="w-px h-6 bg-white/10 mx-1" />
          <QuickActionButton
            icon={Code}
            label="Cursor"
            href="cursor://"
          />
          <QuickActionButton
            icon={Terminal}
            label="VS Code"
            href="vscode://"
          />
        </div>
      </div>
    </div>
  );
}

// Components

function QuickStat({
  icon: Icon,
  label,
  value,
  color,
  bgColor,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
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
        </div>
      </div>
    </div>
  );
}

function LinkSection({
  title,
  icon: Icon,
  links,
  color,
}: {
  title: string;
  icon: LucideIcon;
  links: QuickLink[];
  color: string;
}) {
  if (links.length === 0) return null;

  return (
    <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
      <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <h3 className="font-semibold text-white">{title}</h3>
      </div>
      <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        {links.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${link.color} flex items-center justify-center shadow-lg`}>
                <link.icon className="w-5 h-5 text-white" />
              </div>
              <ExternalLink className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors" />
            </div>
            <h4 className="font-semibold text-white group-hover:text-[#ef4444] transition-colors">
              {link.name}
            </h4>
            <p className="text-xs text-white/40 mt-1">{link.description}</p>
            {link.shortcut && (
              <kbd className="mt-2 inline-block px-1.5 py-0.5 text-[10px] bg-white/10 text-white/40 rounded">
                {link.shortcut}
              </kbd>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}

function ServiceStatusDisplay({ name, status }: { name: string; status: "operational" | "degraded" | "down" }) {
  const statusConfig = {
    operational: { text: "Connected", color: "text-emerald-400", dot: "bg-emerald-400" },
    degraded: { text: "Setup Required", color: "text-amber-400", dot: "bg-amber-400" },
    down: { text: "Error", color: "text-red-400", dot: "bg-red-400" },
  };
  
  const config = statusConfig[status];
  
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-white/70">{name}</span>
      <div className="flex items-center gap-2">
        <span className={`text-xs ${config.color}`}>
          {config.text}
        </span>
        <div className={`w-2 h-2 rounded-full ${config.dot} ${status === "operational" ? "" : "animate-pulse"}`} />
      </div>
    </div>
  );
}

function QuickActionButton({
  icon: Icon,
  label,
  href,
}: {
  icon: LucideIcon;
  label: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="p-2.5 rounded-xl hover:bg-white/10 transition-colors group"
      title={label}
    >
      <Icon className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
    </a>
  );
}

function DeploymentStatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { text: string; color: string; bg: string }> = {
    READY: { text: "Live", color: "text-emerald-400", bg: "bg-emerald-400/20" },
    BUILDING: { text: "Building", color: "text-amber-400", bg: "bg-amber-400/20" },
    QUEUED: { text: "Queued", color: "text-blue-400", bg: "bg-blue-400/20" },
    ERROR: { text: "Error", color: "text-red-400", bg: "bg-red-400/20" },
    CANCELED: { text: "Canceled", color: "text-gray-400", bg: "bg-gray-400/20" },
  };

  const config = statusConfig[status] || { text: status, color: "text-white/60", bg: "bg-white/10" };

  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${config.color} ${config.bg}`}>
      {config.text}
    </span>
  );
}
