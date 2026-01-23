"use client";

import { useState, useEffect } from "react";
import {
  Github,
  Settings,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Loader2,
  Key,
  User,
  Building2,
  Zap,
  Shield,
  Link as LinkIcon,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface GitConfig {
  configured: boolean;
  username: string;
  organization?: string;
  rateLimit?: {
    limit: number;
    remaining: number;
    reset: string;
    percentUsed: number;
  };
}

interface GitConfigPanelProps {
  className?: string;
  showDetails?: boolean;
}

export function GitConfigPanel({ className = "", showDetails = true }: GitConfigPanelProps) {
  const [config, setConfig] = useState<GitConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/admin/git/stats");
      if (res.ok) {
        const data = await res.json();
        setConfig({
          configured: data.configured,
          username: data.username,
          organization: data.organization,
          rateLimit: data.rateLimit,
        });
      }
    } catch (e) {
      console.error("[GitConfigPanel] Error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const copyEnvExample = () => {
    navigator.clipboard.writeText("GITHUB_TOKEN=ghp_your_token_here");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className={`bg-white/5 rounded-xl border border-white/10 p-6 ${className}`}>
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-white/40 animate-spin" />
          <span className="text-white/40">Loading Git configuration...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white/5 rounded-xl border border-white/10 overflow-hidden ${className}`}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#333]/50 flex items-center justify-center">
            <Github className="w-6 h-6 text-white" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-semibold text-white">GitHub Integration</h3>
            <p className="text-sm text-white/50">
              {config?.configured
                ? `Connected as @${config.username}`
                : "Not configured - Add GITHUB_TOKEN to enable"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {config?.configured ? (
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-full flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" />
              Connected
            </span>
          ) : (
            <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-xs font-medium rounded-full flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              Setup Required
            </span>
          )}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-white/40" />
          ) : (
            <ChevronDown className="w-5 h-5 text-white/40" />
          )}
        </div>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="px-6 pb-6 pt-2 border-t border-white/10">
          {config?.configured ? (
            <div className="space-y-6">
              {/* Status Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-white/40" />
                    <span className="text-xs text-white/50 uppercase tracking-wide">Username</span>
                  </div>
                  <p className="text-lg font-semibold text-white">@{config.username}</p>
                </div>

                {config.organization && (
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="w-4 h-4 text-white/40" />
                      <span className="text-xs text-white/50 uppercase tracking-wide">Organization</span>
                    </div>
                    <p className="text-lg font-semibold text-white">{config.organization}</p>
                  </div>
                )}

                {config.rateLimit && (
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-white/40" />
                      <span className="text-xs text-white/50 uppercase tracking-wide">API Rate Limit</span>
                    </div>
                    <p className={`text-lg font-semibold ${
                      config.rateLimit.percentUsed > 80 ? "text-amber-400" : "text-white"
                    }`}>
                      {config.rateLimit.remaining}/{config.rateLimit.limit}
                    </p>
                    <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          config.rateLimit.percentUsed > 80 ? "bg-amber-400" : "bg-emerald-400"
                        }`}
                        style={{ width: `${100 - config.rateLimit.percentUsed}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Features List */}
              {showDetails && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-white/70 uppercase tracking-wide">
                    Enabled Features
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { icon: Github, label: "Repository Access", enabled: true },
                      { icon: Zap, label: "Activity Feed", enabled: true },
                      { icon: Shield, label: "Branch Protection", enabled: true },
                      { icon: LinkIcon, label: "Webhook Support", enabled: true },
                    ].map((feature) => (
                      <div
                        key={feature.label}
                        className="flex items-center gap-2 p-3 bg-white/5 rounded-lg border border-white/10"
                      >
                        <feature.icon className={`w-4 h-4 ${feature.enabled ? "text-emerald-400" : "text-white/30"}`} />
                        <span className={`text-sm ${feature.enabled ? "text-white" : "text-white/40"}`}>
                          {feature.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Links */}
              <div className="flex flex-wrap gap-3">
                <a
                  href={`https://github.com/${config.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors"
                >
                  <Github className="w-4 h-4" />
                  View Profile
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href={`https://github.com/${config.username}?tab=repositories`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors"
                >
                  Repositories
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href="https://github.com/settings/tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors"
                >
                  <Key className="w-4 h-4" />
                  Manage Tokens
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ) : (
            /* Not Configured State */
            <div className="space-y-6">
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-amber-400 mb-1">
                      GitHub Token Required
                    </h4>
                    <p className="text-sm text-amber-400/80">
                      Add a GitHub Personal Access Token to enable full Git integration including
                      activity feeds, PR tracking, and CI/CD status.
                    </p>
                  </div>
                </div>
              </div>

              {/* Setup Instructions */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-white/70 uppercase tracking-wide">
                  Setup Instructions
                </h4>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#ef4444]/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-[#ef4444]">
                      1
                    </div>
                    <div>
                      <p className="text-sm text-white">Create a Personal Access Token</p>
                      <a
                        href="https://github.com/settings/tokens/new?description=SeeZee%20Admin&scopes=repo,read:user,read:org"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-[#ef4444] hover:underline mt-1"
                      >
                        Create token on GitHub
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#ef4444]/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-[#ef4444]">
                      2
                    </div>
                    <div>
                      <p className="text-sm text-white">Add to your environment variables</p>
                      <div className="mt-2 flex items-center gap-2">
                        <code className="flex-1 px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-xs text-white/80 font-mono">
                          GITHUB_TOKEN=ghp_your_token_here
                        </code>
                        <button
                          onClick={copyEnvExample}
                          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                          title="Copy"
                        >
                          {copied ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Copy className="w-4 h-4 text-white/60" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#ef4444]/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-[#ef4444]">
                      3
                    </div>
                    <div>
                      <p className="text-sm text-white">Restart your development server</p>
                      <p className="text-xs text-white/50 mt-1">
                        The Git integration will automatically connect once the token is set.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Required Scopes */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-white/70 uppercase tracking-wide">
                  Required Token Scopes
                </h4>
                <div className="flex flex-wrap gap-2">
                  {["repo", "read:user", "read:org", "workflow"].map((scope) => (
                    <span
                      key={scope}
                      className="px-2.5 py-1 bg-white/10 text-white/70 text-xs font-mono rounded-lg"
                    >
                      {scope}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default GitConfigPanel;
