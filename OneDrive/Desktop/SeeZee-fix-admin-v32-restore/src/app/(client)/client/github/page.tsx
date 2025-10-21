"use client";

import { useEffect, useState } from "react";
import { GitBranch, GitCommit, GitPullRequest, ExternalLink } from "lucide-react";

interface GitHubRepo {
  id: string;
  name: string;
  url: string;
  lastCommit?: {
    message: string;
    author: string;
    date: string;
  };
}

export default function ClientGitHubPage() {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch GitHub repos
    fetch("/api/client/github")
      .then((res) => res.json())
      .then((data) => {
        setRepos(data.repos || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-white">GitHub Activity</h2>
          <p className="text-slate-400 mt-1">View recent commits and development activity</p>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-xl p-12 text-center">
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (repos.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-white">GitHub Activity</h2>
          <p className="text-slate-400 mt-1">View recent commits and development activity</p>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-xl p-12 text-center">
          <GitBranch className="w-12 h-12 mx-auto mb-4 text-slate-600" />
          <p className="text-slate-400">No repositories linked yet</p>
          <p className="text-slate-500 text-sm mt-2">
            Repositories will appear here once development starts
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">GitHub Activity</h2>
        <p className="text-slate-400 mt-1">View recent commits and development activity</p>
      </div>

      <div className="space-y-4">
        {repos.map((repo) => (
          <div
            key={repo.id}
            className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-xl p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <GitBranch className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{repo.name}</h3>
                  <p className="text-sm text-slate-400">Repository</p>
                </div>
              </div>
              <a
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium transition-all flex items-center gap-2"
              >
                View on GitHub
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            {repo.lastCommit && (
              <div className="flex items-start gap-3 p-4 bg-slate-900/50 rounded-lg">
                <GitCommit className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium line-clamp-2">
                    {repo.lastCommit.message}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                    <span>{repo.lastCommit.author}</span>
                    <span></span>
                    <span>{new Date(repo.lastCommit.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
