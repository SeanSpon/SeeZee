"use client";

import { useState, useEffect } from "react";
import { Github, ExternalLink, Loader2, Lock } from "lucide-react";

interface GitHubRepo {
  id: number;
  name: string;
  fullName: string;
  url: string;
  description: string | null;
  language: string | null;
  isPrivate: boolean;
  defaultBranch: string;
}

interface GitHubRepoSelectorProps {
  value?: string;
  onChange: (repoFullName: string, repoUrl: string) => void;
  label?: string;
  placeholder?: string;
}

export function GitHubRepoSelector({
  value,
  onChange,
  label = "GitHub Repository",
  placeholder = "Select a GitHub repository...",
}: GitHubRepoSelectorProps) {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRepos() {
      try {
        const res = await fetch("/api/integrations/github/repos");
        const data = await res.json();

        if (data.error) {
          setError(data.error);
        } else {
          setRepos(data.repos || []);
        }
      } catch (err) {
        setError("Failed to load GitHub repositories");
      } finally {
        setLoading(false);
      }
    }

    fetchRepos();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const repoFullName = e.target.value;
    const repo = repos.find((r) => r.fullName === repoFullName);
    if (repo) {
      onChange(repo.fullName, repo.url);
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-white/70">
          {label}
        </label>
        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white/40">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading GitHub repositories...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-white/70">
          {label}
        </label>
        <div className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      </div>
    );
  }

  if (repos.length === 0) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-white/70">
          {label}
        </label>
        <div className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-sm">
          No GitHub repositories found. Add GITHUB_TOKEN to your environment.
        </div>
      </div>
    );
  }

  const selectedRepo = repos.find((r) => r.fullName === value);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-white/70">
        {label}
      </label>
      <div className="relative">
        <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
        <select
          value={value || ""}
          onChange={handleChange}
          className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white appearance-none cursor-pointer hover:border-white/20 focus:border-[#ef4444]/50 outline-none transition-colors"
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {repos.map((repo) => (
            <option key={repo.id} value={repo.fullName}>
              {repo.isPrivate && "🔒 "}
              {repo.name}
              {repo.language ? ` (${repo.language})` : ""}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg
            className="w-4 h-4 text-white/40"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
      {selectedRepo && (
        <div className="space-y-1">
          {selectedRepo.description && (
            <p className="text-xs text-white/40">{selectedRepo.description}</p>
          )}
          <a
            href={selectedRepo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-[#ef4444] hover:text-white transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            View on GitHub
          </a>
        </div>
      )}
    </div>
  );
}
