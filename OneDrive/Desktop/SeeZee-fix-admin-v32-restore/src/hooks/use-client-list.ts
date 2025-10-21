"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchJson, normalizeItems } from "@/lib/client-api";

export function useClientList<T>(
  path: string,
  qs?: Record<string, string | undefined>
) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const search = new URLSearchParams(
    Object.entries(qs ?? {}).filter(([, v]) => v) as [string, string][]
  ).toString();

  const refresh = useCallback(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    fetchJson<any>(`${path}${search ? `?${search}` : ""}`)
      .then((j) => mounted && setItems(normalizeItems(j)))
      .catch((e) => mounted && setError(e.message))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [path, search]);

  useEffect(() => {
    const cleanup = refresh();
    return cleanup;
  }, [refresh]);

  return { items, loading, error, refresh };
}
