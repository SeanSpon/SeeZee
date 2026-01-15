/**
 * Package-Based Pricing Calculator
 * Enforces $6,000 ceiling and includes required maintenance
 */

import {
  getPackage,
  getFeature,
  PRICE_CEILING,
  RUSH_MULTIPLIER,
  DEPOSIT_PERCENT,
  MIN_DEPOSIT,
  MAINTENANCE,
  type PackageTier,
} from './packages';
import type { Totals } from './store';

// Re-export for convenience
export { getPackage, getFeature, PRICE_CEILING, RUSH_MULTIPLIER, DEPOSIT_PERCENT, MIN_DEPOSIT, MAINTENANCE };

export interface CalculateTotalsParams {
  package: PackageTier | null;
  selectedFeatures: string[];
  rush?: boolean;
}

/**
 * Calculate totals based on package and selected features
 * Enforces price ceiling and includes required maintenance
 */
export function calculateTotals(params: CalculateTotalsParams): Totals {
  const { package: packageId, selectedFeatures, rush = false } = params;

  // Default totals
  if (!packageId) {
    return {
      packageBase: 0,
      addons: 0,
      maintenance: MAINTENANCE.monthlyPrice,
      rush: 0,
      subtotal: 0,
      deposit: 0,
      total: 0,
      monthly: MAINTENANCE.monthlyPrice,
      recurring: true,
    };
  }

  // Get package definition
  const pkg = getPackage(packageId);

  // Calculate add-ons cost (features not included in package)
  let addonsCost = 0;
  const addons: string[] = [];

  for (const featureId of selectedFeatures) {
    // Skip if it's included in the base package
    if (pkg.baseIncludedFeatures.includes(featureId)) {
      continue;
    }

    const feature = getFeature(featureId);
    if (feature) {
      addonsCost += feature.price;
      addons.push(featureId);
    }
  }

  // Enforce maximum add-ons cost for this package
  if (addonsCost > pkg.maxAddonsCost) {
    addonsCost = pkg.maxAddonsCost;
  }

  // Calculate subtotal (before rush)
  let subtotal = pkg.basePrice + addonsCost;

  // Add rush fee (15%)
  const rushFee = rush ? Math.round(subtotal * (RUSH_MULTIPLIER - 1)) : 0;
  subtotal += rushFee;

  // Enforce price ceiling
  if (subtotal > PRICE_CEILING) {
    subtotal = PRICE_CEILING;
  }

  // Calculate deposit (25% or $250 minimum)
  const deposit = Math.max(
    Math.round(subtotal * DEPOSIT_PERCENT),
    MIN_DEPOSIT
  );

  return {
    packageBase: pkg.basePrice,
    addons: addonsCost,
    maintenance: MAINTENANCE.monthlyPrice,
    rush: rushFee,
    subtotal,
    deposit,
    total: subtotal,
    monthly: MAINTENANCE.monthlyPrice,
    recurring: true, // Maintenance is always required
  };
}

/**
 * Check if adding a feature would exceed the price ceiling
 */
export function wouldExceedCeiling(
  currentTotals: Totals,
  featureId: string
): boolean {
  const feature = getFeature(featureId);
  if (!feature) return false;

  const newTotal = currentTotals.subtotal + feature.price;
  return newTotal > PRICE_CEILING;
}

/**
 * Check if adding a feature would exceed the package's max add-ons cost
 */
export function wouldExceedPackageLimit(
  packageId: PackageTier,
  currentAddons: number,
  featureId: string
): boolean {
  const pkg = getPackage(packageId);
  const feature = getFeature(featureId);
  if (!feature) return false;

  // If feature is included in base package, it doesn't count toward add-ons
  if (pkg.baseIncludedFeatures.includes(featureId)) {
    return false;
  }

  const newAddonsCost = currentAddons + feature.price;
  return newAddonsCost > pkg.maxAddonsCost;
}

/**
 * Format price in cents to USD string
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
 * Get remaining budget for add-ons
 */
export function getRemainingBudget(
  packageId: PackageTier,
  currentAddons: number
): number {
  const pkg = getPackage(packageId);
  return Math.max(0, pkg.maxAddonsCost - currentAddons);
}

/**
 * Get percentage of package limit used
 */
export function getPackageLimitPercentage(
  packageId: PackageTier,
  currentAddons: number
): number {
  const pkg = getPackage(packageId);
  if (pkg.maxAddonsCost === 0) return 100;
  return Math.min(100, (currentAddons / pkg.maxAddonsCost) * 100);
}
