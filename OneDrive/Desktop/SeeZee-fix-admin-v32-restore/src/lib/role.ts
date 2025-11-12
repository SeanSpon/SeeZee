/**
 * Role definitions and helpers for SeeZee Admin v3.0
 * Updated roles: CEO, CFO, FRONTEND, BACKEND, OUTREACH, CLIENT
 */

export const ROLE = {
  CEO: "CEO",
  CFO: "CFO",
  FRONTEND: "FRONTEND",
  BACKEND: "BACKEND",
  OUTREACH: "OUTREACH",
  CLIENT: "CLIENT",
} as const;

export type Role = (typeof ROLE)[keyof typeof ROLE];

/**
 * Check if user has admin-like privileges (CEO or CFO)
 */
export function isAdminLike(role?: Role | null): boolean {
  return role === ROLE.CEO || role === ROLE.CFO;
}

/**
 * Check if user is CEO
 */
export function isCEO(role?: Role | null): boolean {
  return role === ROLE.CEO;
}

/**
 * Check if user is CFO
 */
export function isCFO(role?: Role | null): boolean {
  return role === ROLE.CFO;
}

/**
 * Check if user is staff member (FRONTEND, BACKEND, OUTREACH)
 */
export function isStaff(role?: Role | null): boolean {
  return (
    role === ROLE.FRONTEND || role === ROLE.BACKEND || role === ROLE.OUTREACH
  );
}

/**
 * Check if user is a developer (FRONTEND or BACKEND)
 */
export function isDeveloper(role?: Role | null): boolean {
  return role === ROLE.FRONTEND || role === ROLE.BACKEND;
}

/**
 * Get role display name with formatting
 */
export function getRoleDisplay(role?: Role | null): string {
  if (!role) return "Client";
  if (role === ROLE.CEO) return "Chief Executive";
  if (role === ROLE.CFO) return "Chief Financial Officer";
  if (role === ROLE.FRONTEND) return "Frontend Developer";
  if (role === ROLE.BACKEND) return "Backend Developer";
  if (role === ROLE.OUTREACH) return "Outreach Specialist";
  return "Client";
}

/**
 * Get role accent color for UI
 */
export function getRoleAccent(role?: Role | null): string {
  if (role === ROLE.CEO) return "ring-yellow-500/30 shadow-yellow-500/10";
  if (role === ROLE.CFO) return "ring-violet-500/30 shadow-violet-500/10";
  if (role === ROLE.FRONTEND) return "ring-pink-500/30 shadow-pink-500/10";
  if (role === ROLE.BACKEND) return "ring-blue-500/30 shadow-blue-500/10";
  if (role === ROLE.OUTREACH) return "ring-green-500/30 shadow-green-500/10";
  return "ring-gray-500/30 shadow-gray-500/10";
}

/**
 * Get role gradient for badges/pills
 */
export function getRoleGradient(role?: Role | null): string {
  if (role === ROLE.CEO)
    return "from-yellow-500 via-amber-500 to-orange-500";
  if (role === ROLE.CFO)
    return "from-violet-500 via-purple-500 to-fuchsia-500";
  if (role === ROLE.FRONTEND)
    return "from-pink-500 via-rose-500 to-red-500";
  if (role === ROLE.BACKEND)
    return "from-blue-500 via-indigo-500 to-purple-500";
  if (role === ROLE.OUTREACH)
    return "from-green-500 via-emerald-500 to-teal-500";
  return "from-gray-500 via-slate-500 to-zinc-500";
}
