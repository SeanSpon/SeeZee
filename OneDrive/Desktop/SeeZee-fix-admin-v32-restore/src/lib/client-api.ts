/**
 * Client-side API utilities for the client dashboard
 */

export async function fetchJson<T>(
  url: string,
  init?: RequestInit
): Promise<T> {
  const r = await fetch(url, { cache: "no-store", ...init });
  if (!r.ok) {
    const text = await r.text();
    throw new Error(`HTTP ${r.status}: ${text}`);
  }
  return r.json();
}

export function normalizeItems<T = any>(json: any): T[] {
  if (Array.isArray(json)) return json;
  if (json?.items && Array.isArray(json.items)) return json.items;
  return [];
}
