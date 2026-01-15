/**
 * SWR Hooks for Client Dashboard
 * Real-time data fetching with automatic revalidation
 */

"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Request {
  id: string;
  projectId: string;
  title: string;
  details: string;
  state: string;
  source: "MANUAL" | "AI";
  createdAt: string;
  updatedAt: string;
}

interface ProjectSummary {
  summary: string;
  suggestions?: Array<{
    title: string;
    details: string;
  }>;
  repo?: string;
  commitCount?: number;
}

/**
 * Fetch all requests for a project
 */
export function useProjectRequests(projectId: string) {
  const { data, error, isLoading, mutate } = useSWR<{ requests: Request[] }>(
    projectId ? `/api/client/projects/${projectId}/requests` : null,
    fetcher,
    {
      refreshInterval: 30000, // Auto-refresh every 30s
      revalidateOnFocus: true,
    }
  );

  return {
    requests: data?.requests || [],
    isLoading,
    isError: error,
    mutate,
  };
}

/**
 * Fetch AI-generated summary and suggestions for a project
 */
export function useProjectSummary(projectId: string) {
  const { data, error, isLoading, mutate } = useSWR<ProjectSummary>(
    projectId ? `/api/client/projects/${projectId}/summary` : null,
    fetcher,
    {
      revalidateOnFocus: false, // Don't auto-fetch on focus (expensive AI call)
      revalidateOnReconnect: false,
    }
  );

  return {
    summary: data,
    isLoading,
    isError: error,
    refetch: mutate, // Manual trigger for "Analyze latest Git" button
  };
}

/**
 * Helper to create a new request
 */
export async function createRequest(
  projectId: string,
  data: { title: string; details: string; source: "MANUAL" | "AI" }
) {
  const res = await fetch(`/api/client/projects/${projectId}/requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to create request");
  }

  return res.json();
}
