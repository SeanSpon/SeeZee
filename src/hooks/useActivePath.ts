import { usePathname } from "next/navigation";

/**
 * Returns the current pathname without trailing slash
 * Useful for consistent active state detection
 */
export function useActivePath() {
  const pathname = usePathname();
  return pathname?.endsWith("/") ? pathname.slice(0, -1) : pathname;
}
