/**
 * GitHub API Integration
 * Fetches recent commits from project repositories
 */

import { prisma } from "@/lib/prisma";

interface GitHubCommit {
  sha: string;
  commit: {
    author: { name: string; date: string };
    message: string;
  };
}

/**
 * Get GitHub repo for a project
 * Uses project.githubRepo if set, otherwise falls back to env var
 */
export async function projectRepo(projectId: string): Promise<string | null> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  return (project as any)?.githubRepo || process.env.GITHUB_REPO_FALLBACK || null;
}

/**
 * Fetch recent commits from GitHub API
 */
export async function getRecentCommits(
  repo: string,
  count = 10
): Promise<GitHubCommit[]> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.warn("GITHUB_TOKEN not set, skipping commit fetch");
    return [];
  }

  try {
    const res = await fetch(
      `https://api.github.com/repos/${repo}/commits?per_page=${count}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    );

    if (!res.ok) {
      throw new Error(`GitHub API error: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Failed to fetch GitHub commits:", error);
    return [];
  }
}
