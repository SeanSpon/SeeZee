/**
 * SeeZee Studios - Centralized Pricing & Billing Configuration
 * 
 * This file contains all pricing, hours, and limits for the SeeZee service model.
 * Import from here instead of hardcoding values throughout the codebase.
 * 
 * Pricing model (matches seezeestudios.com/services):
 * - Development: $75/hour flat rate
 * - Maintenance Quarterly: $2,000/quarter (30 hours included)
 * - Maintenance Annual: $6,800/year (120 hours included, 15% savings)
 */

// =============================================================================
// DEVELOPMENT RATE
// =============================================================================

export const DEV_RATE = {
  hourlyRate: 7500,               // $75/hour in cents
  rushMultiplier: 1.5,            // 1.5x for rush delivery (1 week)
} as const;

// =============================================================================
// MAINTENANCE PLANS - Hour-based support plans
// These are the actual plans sold on seezeestudios.com/services
// =============================================================================

export const MAINTENANCE_PLANS = {
  QUARTERLY: {
    id: 'QUARTERLY',
    name: 'Quarterly Maintenance',
    shortName: 'Quarterly',
    description: 'Keep your website running smoothly with priority support, security updates, and unlimited change requests.',
    price: 200000,                // $2,000 per quarter in cents
    monthlyPrice: 66667,          // ~$667/month in cents (for legacy compatibility)
    billingPeriod: 'quarterly' as const,
    effectiveMonthlyPrice: 66667, // ~$667/month in cents
    effectiveHourlyRate: 6667,    // ~$67/hour in cents
    hoursIncluded: 30,            // 30 hours per quarter
    hoursPerMonth: 10,            // ~10 hours/month
    supportHoursIncluded: 10,     // For compatibility with existing code
    changeRequestsIncluded: -1,   // Unlimited change requests
    features: [
      'Priority 24hr response time',
      'Security updates & backups',
      'Unlimited change requests',
      'Emergency same-day fixes',
    ],
    stripePriceId: process.env.STRIPE_PRICE_QUARTERLY,
  },
  ANNUAL: {
    id: 'ANNUAL',
    name: 'Annual Maintenance',
    shortName: 'Annual',
    description: 'Everything in Quarterly plus strategy reviews and performance monitoring. Save 15%.',
    price: 680000,                // $6,800 per year in cents
    monthlyPrice: 56667,          // ~$567/month in cents (for legacy compatibility)
    billingPeriod: 'annual' as const,
    effectiveMonthlyPrice: 56667, // ~$567/month in cents
    effectiveHourlyRate: 5667,    // ~$57/hour in cents
    savings: 120000,              // Save $1,200 vs 4x quarterly
    savingsPercent: 0.15,
    hoursIncluded: 120,           // 120 hours per year
    hoursPerMonth: 10,
    supportHoursIncluded: 10,     // For compatibility with existing code
    changeRequestsIncluded: -1,   // Unlimited change requests
    features: [
      'Everything in Quarterly',
      'Quarterly strategy reviews',
      'Performance monitoring',
      '$57/hour effective rate',
    ],
    stripePriceId: process.env.STRIPE_PRICE_ANNUAL,
  },
} as const;

// Export NONPROFIT_TIERS with full backwards compatibility
// All legacy tiers (ESSENTIALS, DIRECTOR, COO) map to QUARTERLY plan
export const NONPROFIT_TIERS = {
  ...MAINTENANCE_PLANS,
  ESSENTIALS: {
    id: 'QUARTERLY',
    name: 'Quarterly Maintenance',
    shortName: 'Quarterly',
    description: 'Keep your website running smoothly with priority support, security updates, and unlimited change requests.',
    price: 200000,
    monthlyPrice: 66667,
    billingPeriod: 'quarterly' as const,
    effectiveMonthlyPrice: 66667,
    effectiveHourlyRate: 6667,
    hoursIncluded: 30,
    hoursPerMonth: 10,
    supportHoursIncluded: 10,
    changeRequestsIncluded: -1,
    features: [
      'Priority 24hr response time',
      'Security updates & backups',
      'Unlimited change requests',
      'Emergency same-day fixes',
    ],
    stripePriceId: process.env.STRIPE_PRICE_QUARTERLY,
  },
  DIRECTOR: {
    id: 'QUARTERLY',
    name: 'Quarterly Maintenance',
    shortName: 'Quarterly',
    description: 'Keep your website running smoothly with priority support, security updates, and unlimited change requests.',
    price: 200000,
    monthlyPrice: 66667,
    billingPeriod: 'quarterly' as const,
    effectiveMonthlyPrice: 66667,
    effectiveHourlyRate: 6667,
    hoursIncluded: 30,
    hoursPerMonth: 10,
    supportHoursIncluded: 10,
    changeRequestsIncluded: -1,
    features: [
      'Priority 24hr response time',
      'Security updates & backups',
      'Unlimited change requests',
      'Emergency same-day fixes',
    ],
    stripePriceId: process.env.STRIPE_PRICE_QUARTERLY,
  },
  COO: {
    id: 'QUARTERLY',
    name: 'Quarterly Maintenance',
    shortName: 'Quarterly',
    description: 'Keep your website running smoothly with priority support, security updates, and unlimited change requests.',
    price: 200000,
    monthlyPrice: 66667,
    billingPeriod: 'quarterly' as const,
    effectiveMonthlyPrice: 66667,
    effectiveHourlyRate: 6667,
    hoursIncluded: 30,
    hoursPerMonth: 10,
    supportHoursIncluded: 10,
    changeRequestsIncluded: -1,
    features: [
      'Priority 24hr response time',
      'Security updates & backups',
      'Unlimited change requests',
      'Emergency same-day fixes',
    ],
    stripePriceId: process.env.STRIPE_PRICE_QUARTERLY,
  },
} as const;

export type MaintenancePlanId = keyof typeof MAINTENANCE_PLANS;
export type MaintenancePlanConfig = typeof MAINTENANCE_PLANS[MaintenancePlanId];

// =============================================================================
// LEGACY TIER MAPPING
// The database stores tier as a string (ESSENTIALS, DIRECTOR, COO, QUARTERLY, ANNUAL)
// This maps all values to current pricing. All legacy tiers now map to the new
// QUARTERLY/ANNUAL plans for consistency.
// =============================================================================

export const LEGACY_TIER_MAP: Record<string, { monthlyPrice: number; hoursIncluded: number; name: string }> = {
  // Legacy nonprofit tiers - map to QUARTERLY plan
  ESSENTIALS: { monthlyPrice: 66667, hoursIncluded: 10, name: 'Quarterly Plan' },
  DIRECTOR:   { monthlyPrice: 66667, hoursIncluded: 10, name: 'Quarterly Plan' },
  COO:        { monthlyPrice: 66667, hoursIncluded: 10, name: 'Quarterly Plan' },
  // Current plans
  QUARTERLY:  { monthlyPrice: 66667, hoursIncluded: 10, name: 'Quarterly' },
  ANNUAL:     { monthlyPrice: 56667, hoursIncluded: 10, name: 'Annual' },
};


// =============================================================================
// HOUR PACKS - Purchasable hour bundles
// =============================================================================

export const HOUR_PACKS = {
  SMALL: {
    id: 'SMALL',
    name: 'Quick Boost',
    hours: 5,
    cost: 35000,                  // $350 in cents
    pricePerHour: 7000,           // $70/hour
    expiryDays: 60,
    neverExpires: false,
    popular: false,
    savings: 0,
  },
  MEDIUM: {
    id: 'MEDIUM',
    name: 'Power Pack',
    hours: 10,
    cost: 65000,                  // $650 in cents
    pricePerHour: 6500,           // $65/hour
    expiryDays: 90,
    neverExpires: false,
    popular: true,
    savings: 5000,
  },
  LARGE: {
    id: 'LARGE',
    name: 'Mega Pack',
    hours: 20,
    cost: 120000,                 // $1,200 in cents
    pricePerHour: 6000,           // $60/hour
    expiryDays: 120,
    neverExpires: false,
    popular: false,
    savings: 20000,
  },
  PREMIUM: {
    id: 'PREMIUM',
    name: 'Never Expire Pack',
    hours: 10,
    cost: 85000,                  // $850 in cents
    pricePerHour: 8500,           // $85/hour (premium for no expiry)
    expiryDays: 0,
    neverExpires: true,
    popular: false,
    savings: 0,
  },
} as const;

export type HourPackId = keyof typeof HOUR_PACKS;
export type HourPack = typeof HOUR_PACKS[HourPackId];

// =============================================================================
// ON-DEMAND / OVERAGE SETTINGS
// =============================================================================

export const ON_DEMAND_SETTINGS = {
  hourlyRate: 7500,               // $75/hour in cents (same as dev rate)
  defaultDailyLimit: 3,
  urgentRequestsPerWeek: 2,
  defaultDailySpendCap: 50000,    // $500/day
  defaultMonthlySpendCap: 200000, // $2,000/month
} as const;

// =============================================================================
// URGENCY FEES
// =============================================================================

export const URGENCY_FEES = {
  LOW: { fee: 0, days: '3-5 days', label: 'Low Priority' },
  NORMAL: { fee: 0, days: '2-3 days', label: 'Normal' },
  HIGH: { fee: 0, days: '1 day', label: 'High Priority' },
  URGENT: { fee: 5000, days: 'Same day', label: 'Urgent (+$50)' },
  EMERGENCY: { fee: 10000, days: 'Immediate', label: 'Emergency (+$100)' },
} as const;

// =============================================================================
// GRACE PERIOD SETTINGS
// =============================================================================

export const GRACE_PERIOD = {
  finishCurrentRequest: true,
  firstTimeOverageAllowed: true,
  maxFirstTimeOverage: 1.0,
  paymentGraceDays: {
    warning1: 1,
    warning2: 3,
    suspend: 7,
    cancel: 14,
  },
} as const;

// =============================================================================
// HOUR EXTENSION OPTIONS (for when clients run out of hours)
// =============================================================================

export const EXTENSION_OPTIONS = {
  SMALL: {
    id: 'SMALL',
    hours: 5,
    price: 37500, // $375 in cents
    description: 'Quick 5-hour boost',
  },
  MEDIUM: {
    id: 'MEDIUM',
    hours: 10,
    price: 70000, // $700 in cents
    description: '10 hours for ongoing work',
  },
  LARGE: {
    id: 'LARGE',
    hours: 20,
    price: 130000, // $1,300 in cents
    description: '20 hours for major projects',
  },
  EXTEND_30_DAYS: {
    id: 'EXTEND_30_DAYS',
    cost: 5000, // $50 in cents to extend expiry by 30 days
    description: 'Extend pack expiry by 30 days',
  },
  CONVERT_TO_NEVER_EXPIRE: {
    id: 'CONVERT_TO_NEVER_EXPIRE',
    costPerHour: 2000, // $20 per hour in cents to convert to never-expire
    description: 'Convert hours to never expire',
  },
} as const;

// =============================================================================
// WARNING THRESHOLDS
// =============================================================================

export const WARNING_THRESHOLDS = {
  AT_80_PERCENT: 0.8,
  AT_2_HOURS: 2,
  EXPIRY_WARNING_DAYS: [60, 30, 14, 7, 3],
} as const;

// =============================================================================
// PROJECT TYPE ESTIMATES (matches seezeestudios.com/services pricing)
// =============================================================================

export const PROJECT_ESTIMATES = {
  MARKETING_WEBSITE: {
    name: 'Marketing Website',
    minHours: 40,
    maxHours: 80,
    minPrice: 300000,
    maxPrice: 600000,
  },
  ECOMMERCE: {
    name: 'E-commerce Store',
    minHours: 80,
    maxHours: 150,
    minPrice: 600000,
    maxPrice: 1200000,
  },
  WEB_APP: {
    name: 'Web Application',
    minHours: 100,
    maxHours: 200,
    minPrice: 800000,
    maxPrice: 2000000,
  },
  LANDING_PAGE: {
    name: 'Landing Page',
    minHours: 15,
    maxHours: 30,
    minPrice: 120000,
    maxPrice: 240000,
  },
} as const;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get tier config by ID (supports legacy tier names)
 * Returns legacy tier mapping data with full compatibility fields
 */
export function getTier(tierId: string): { 
  id: string;
  monthlyPrice: number; 
  hoursIncluded: number; 
  name: string;
  supportHoursIncluded: number;
  changeRequestsIncluded: number;
  rolloverExpiryDays: number;
} | null {
  const tier = LEGACY_TIER_MAP[tierId];
  if (!tier) return null;
  
  return {
    id: tierId,
    ...tier,
    supportHoursIncluded: tier.hoursIncluded,
    changeRequestsIncluded: -1, // All plans now have unlimited change requests
    rolloverExpiryDays: 90, // Default 90 days for rollover hours
  };
}

/**
 * Get hour pack by ID
 */
export function getHourPack(packId: string): HourPack | null {
  const pack = HOUR_PACKS[packId as HourPackId];
  return pack || null;
}

/**
 * Check if tier has unlimited hours
 */
export function hasUnlimitedHours(tierId: string): boolean {
  const tier = getTier(tierId);
  return tier?.hoursIncluded === -1;
}

/**
 * Check if tier has unlimited subscriptions
 * Note: Legacy tiers don't have subscription limits, returns false
 */
export function hasUnlimitedSubscriptions(tierId: string): boolean {
  // Legacy tier system doesn't track subscription limits
  return false;
}

/**
 * Get the monthly price for a tier (from DB or config)
 */
export function getTierMonthlyPrice(tierId: string, dbMonthlyPrice?: number): number {
  if (dbMonthlyPrice && dbMonthlyPrice > 0) return dbMonthlyPrice;
  const legacy = LEGACY_TIER_MAP[tierId];
  if (legacy) return legacy.monthlyPrice;
  return 0;
}

/**
 * Format price for display (cents to dollars)
 */
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

/**
 * Format hours for display
 */
export function formatHours(hours: number): string {
  if (hours === -1) return 'Unlimited';
  if (hours === 0) return '0 hours';
  if (hours === 1) return '1 hour';
  return `${hours} hours`;
}
