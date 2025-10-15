/**
 * Role definitions and helpers for SeeZee Admin v3.0
 */

export const ROLE = {
  CEO: "CEO",
  ADMIN: "ADMIN",
  STAFF: "STAFF",
  DESIGNER: "DESIGNER",
  DEV: "DEV",
  CLIENT: "CLIENT",
} as const;

export type Role = (typeof ROLE)[keyof typeof ROLE];

/**
 * Check if user has admin-like privileges (CEO or ADMIN)
 */
export function isAdminLike(role?: Role | null): boolean {
  return role === ROLE.CEO || role === ROLE.ADMIN;
}

/**
 * Check if user is CEO
 */
export function isCEO(role?: Role | null): boolean {
  return role === ROLE.CEO;
}

/**
 * Check if user is staff member (STAFF, DESIGNER, DEV)
 */
export function isStaff(role?: Role | null): boolean {
  return (
    role === ROLE.STAFF || role === ROLE.DESIGNER || role === ROLE.DEV
  );
}

/**
 * Get role display name with formatting
 */
export function getRoleDisplay(role?: Role | null): string {
  if (!role) return "Client";
  if (role === ROLE.CEO) return "Chief Executive";
  if (role === ROLE.ADMIN) return "Administrator";
  if (role === ROLE.STAFF) return "Staff Member";
  if (role === ROLE.DESIGNER) return "Designer";
  if (role === ROLE.DEV) return "Developer";
  return "Client";
}

/**
 * Get role accent color for UI
 */
export function getRoleAccent(role?: Role | null): string {
  if (role === ROLE.CEO) return "ring-yellow-500/30 shadow-yellow-500/10";
  if (role === ROLE.ADMIN) return "ring-violet-500/30 shadow-violet-500/10";
  if (isStaff(role)) return "ring-teal-500/30 shadow-teal-500/10";
  return "ring-blue-500/30 shadow-blue-500/10";
}

/**
 * Get role gradient for badges/pills
 */
export function getRoleGradient(role?: Role | null): string {
  if (role === ROLE.CEO)
    return "from-yellow-500 via-amber-500 to-orange-500";
  if (role === ROLE.ADMIN)
    return "from-violet-500 via-purple-500 to-fuchsia-500";
  if (isStaff(role))
    return "from-teal-500 via-cyan-500 to-blue-500";
  return "from-blue-500 via-indigo-500 to-purple-500";
}
