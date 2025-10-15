/**
 * XP and Gamification system for SeeZee Admin v3.0
 */

export interface UserXP {
  userId: string;
  totalXP: number;
  level: number;
  badges: Badge[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
}

/**
 * XP rewards for different actions
 */
export const XP_REWARDS = {
  TASK_COMPLETE: 5,
  TASK_COMPLETE_EARLY: 10,
  TRAINING_MODULE: 20,
  PROJECT_COMPLETE: 50,
  MAINTENANCE_RESOLVE: 15,
  PERFECT_WEEK: 100, // All tasks done on time
} as const;

/**
 * Calculate level from total XP
 * Level = floor(sqrt(XP / 100))
 */
export function calculateLevel(totalXP: number): number {
  return Math.floor(Math.sqrt(totalXP / 100));
}

/**
 * Calculate XP needed for next level
 */
export function xpForNextLevel(currentLevel: number): number {
  const nextLevel = currentLevel + 1;
  return Math.pow(nextLevel, 2) * 100;
}

/**
 * Calculate progress to next level (0-100)
 */
export function levelProgress(totalXP: number): number {
  const currentLevel = calculateLevel(totalXP);
  const currentLevelXP = Math.pow(currentLevel, 2) * 100;
  const nextLevelXP = xpForNextLevel(currentLevel);
  const xpInLevel = totalXP - currentLevelXP;
  const xpNeeded = nextLevelXP - currentLevelXP;
  return Math.floor((xpInLevel / xpNeeded) * 100);
}

/**
 * Award XP and check for badge unlocks
 * TODO: Wire to Prisma to persist
 */
export async function awardXP(
  userId: string,
  amount: number,
  reason: string
): Promise<{ newTotal: number; levelUp: boolean; newBadges: Badge[] }> {
  // TODO: Fetch user current XP from database
  const currentXP = 0;
  const currentLevel = calculateLevel(currentXP);
  
  const newTotal = currentXP + amount;
  const newLevel = calculateLevel(newTotal);
  const levelUp = newLevel > currentLevel;

  // TODO: Check badge conditions and award
  const newBadges: Badge[] = [];

  // TODO: Save to database
  console.log(`[XP] User ${userId} earned ${amount} XP for ${reason}`);

  return { newTotal, levelUp, newBadges };
}

/**
 * Mock badges for initial testing
 */
export const AVAILABLE_BADGES: Omit<Badge, "earnedAt">[] = [
  {
    id: "first-task",
    name: "Getting Started",
    description: "Complete your first task",
    icon: "🎯",
  },
  {
    id: "perfect-week",
    name: "Perfect Week",
    description: "Complete all tasks on time for a week",
    icon: "⭐",
  },
  {
    id: "learning-master",
    name: "Learning Master",
    description: "Complete 10 training modules",
    icon: "🎓",
  },
  {
    id: "speed-demon",
    name: "Speed Demon",
    description: "Complete 5 tasks early",
    icon: "⚡",
  },
  {
    id: "maintenance-hero",
    name: "Maintenance Hero",
    description: "Resolve 20 maintenance requests",
    icon: "🛠️",
  },
];
