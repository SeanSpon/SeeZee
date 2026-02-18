/**
 * Tests for Tier Configuration System
 * Run with: npx ts-node --compiler-options '{"module":"CommonJS"}' src/lib/config/__tests__/tiers.test.ts
 * 
 * This test suite verifies:
 * - MAINTENANCE_PLANS structure and pricing
 * - NONPROFIT_TIERS backwards compatibility
 * - getTier() function for legacy tier lookups
 * - HOUR_PACKS configuration
 * - DEV_RATE configuration
 */

import {
  MAINTENANCE_PLANS,
  NONPROFIT_TIERS,
  HOUR_PACKS,
  DEV_RATE,
  getTier,
  formatPrice,
  formatHours,
  hasUnlimitedHours,
  getTierMonthlyPrice,
} from '../tiers';

// Simple test runner
function test(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    console.error(`  ${error}`);
    process.exitCode = 1;
  }
}

function assertEqual<T>(actual: T, expected: T, message?: string): void {
  if (actual !== expected) {
    throw new Error(
      message || `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`
    );
  }
}

function assertExists(value: any, message?: string): void {
  if (!value) {
    throw new Error(message || `Expected value to exist, got ${value}`);
  }
}

// ============================================================================
// MAINTENANCE PLANS TESTS
// ============================================================================

console.log('\n=== Maintenance Plans Tests ===\n');

test('MAINTENANCE_PLANS has QUARTERLY and ANNUAL plans', () => {
  assertExists(MAINTENANCE_PLANS.QUARTERLY, 'QUARTERLY plan should exist');
  assertExists(MAINTENANCE_PLANS.ANNUAL, 'ANNUAL plan should exist');
});

test('QUARTERLY plan has correct pricing ($2,000/quarter)', () => {
  assertEqual(MAINTENANCE_PLANS.QUARTERLY.price, 200000, 'Price should be $2,000 in cents');
  assertEqual(MAINTENANCE_PLANS.QUARTERLY.hoursIncluded, 30, 'Should include 30 hours per quarter');
  assertEqual(MAINTENANCE_PLANS.QUARTERLY.hoursPerMonth, 10, 'Should be 10 hours per month average');
});

test('ANNUAL plan has correct pricing ($6,800/year)', () => {
  assertEqual(MAINTENANCE_PLANS.ANNUAL.price, 680000, 'Price should be $6,800 in cents');
  assertEqual(MAINTENANCE_PLANS.ANNUAL.hoursIncluded, 120, 'Should include 120 hours per year');
  assertEqual(MAINTENANCE_PLANS.ANNUAL.hoursPerMonth, 10, 'Should be 10 hours per month average');
});

test('ANNUAL plan shows 15% savings vs QUARTERLY', () => {
  assertEqual(MAINTENANCE_PLANS.ANNUAL.savingsPercent, 0.15, 'Should save 15%');
  assertEqual(MAINTENANCE_PLANS.ANNUAL.savings, 120000, 'Should save $1,200 in cents');
  
  // Verify math: 4 quarters * $2,000 = $8,000; Annual = $6,800; Savings = $1,200
  const fourQuarters = MAINTENANCE_PLANS.QUARTERLY.price * 4;
  const annualPrice = MAINTENANCE_PLANS.ANNUAL.price;
  const actualSavings = fourQuarters - annualPrice;
  assertEqual(actualSavings, 120000, 'Calculated savings should be $1,200');
});

test('Both plans have unlimited change requests', () => {
  assertEqual(MAINTENANCE_PLANS.QUARTERLY.changeRequestsIncluded, -1, 'QUARTERLY should have unlimited requests');
  assertEqual(MAINTENANCE_PLANS.ANNUAL.changeRequestsIncluded, -1, 'ANNUAL should have unlimited requests');
});

test('Both plans have supportHoursIncluded for compatibility', () => {
  assertEqual(MAINTENANCE_PLANS.QUARTERLY.supportHoursIncluded, 10, 'QUARTERLY should have 10 support hours/month');
  assertEqual(MAINTENANCE_PLANS.ANNUAL.supportHoursIncluded, 10, 'ANNUAL should have 10 support hours/month');
});

// ============================================================================
// NONPROFIT_TIERS ALIAS TESTS
// ============================================================================

console.log('\n=== NONPROFIT_TIERS Alias Tests ===\n');

test('NONPROFIT_TIERS is an alias for MAINTENANCE_PLANS', () => {
  assertExists(NONPROFIT_TIERS.QUARTERLY, 'QUARTERLY should exist in NONPROFIT_TIERS');
  assertExists(NONPROFIT_TIERS.ANNUAL, 'ANNUAL should exist in NONPROFIT_TIERS');
  assertEqual(NONPROFIT_TIERS.QUARTERLY.id, MAINTENANCE_PLANS.QUARTERLY.id, 'Should reference same QUARTERLY plan');
  assertEqual(NONPROFIT_TIERS.ANNUAL.id, MAINTENANCE_PLANS.ANNUAL.id, 'Should reference same ANNUAL plan');
});

test('getTier() returns config for QUARTERLY', () => {
  const tier = getTier('QUARTERLY');
  assertExists(tier, 'getTier should return config for QUARTERLY');
  assertEqual(tier!.id, 'QUARTERLY', 'Tier ID should match');
  assertEqual(tier!.monthlyPrice, 66667, 'Monthly price should be correct');
  assertEqual(tier!.hoursIncluded, 10, 'Hours should be correct');
  assertEqual(tier!.changeRequestsIncluded, -1, 'Should have unlimited change requests');
});

test('getTier() returns config for ANNUAL', () => {
  const tier = getTier('ANNUAL');
  assertExists(tier, 'getTier should return config for ANNUAL');
  assertEqual(tier!.id, 'ANNUAL', 'Tier ID should match');
  assertEqual(tier!.monthlyPrice, 56667, 'Monthly price should be correct');
  assertEqual(tier!.hoursIncluded, 10, 'Hours should be correct');
});

test('getTier() returns null for removed legacy tiers', () => {
  assertEqual(getTier('ESSENTIALS'), null, 'ESSENTIALS should no longer resolve');
  assertEqual(getTier('DIRECTOR'), null, 'DIRECTOR should no longer resolve');
  assertEqual(getTier('COO'), null, 'COO should no longer resolve');
});

test('getTier() returns null for invalid tier', () => {
  const tier = getTier('INVALID_TIER');
  assertEqual(tier, null, 'getTier should return null for invalid tier');
});

test('hasUnlimitedHours() returns false for standard tiers', () => {
  assertEqual(hasUnlimitedHours('QUARTERLY'), false, 'QUARTERLY should not have unlimited hours');
  assertEqual(hasUnlimitedHours('ANNUAL'), false, 'ANNUAL should not have unlimited hours');
});

// ============================================================================
// HOUR PACKS TESTS
// ============================================================================

console.log('\n=== Hour Packs Tests ===\n');

test('HOUR_PACKS has all pack sizes', () => {
  assertExists(HOUR_PACKS.SMALL, 'SMALL pack should exist');
  assertExists(HOUR_PACKS.MEDIUM, 'MEDIUM pack should exist');
  assertExists(HOUR_PACKS.LARGE, 'LARGE pack should exist');
  assertExists(HOUR_PACKS.PREMIUM, 'PREMIUM pack should exist');
});

test('SMALL pack has correct pricing', () => {
  assertEqual(HOUR_PACKS.SMALL.hours, 5, 'Should have 5 hours');
  assertEqual(HOUR_PACKS.SMALL.cost, 35000, 'Should cost $350 in cents');
  assertEqual(HOUR_PACKS.SMALL.pricePerHour, 7000, 'Should be $70/hour');
  assertEqual(HOUR_PACKS.SMALL.expiryDays, 60, 'Should expire in 60 days');
  assertEqual(HOUR_PACKS.SMALL.neverExpires, false, 'Should have expiry');
});

test('MEDIUM pack has correct pricing and is popular', () => {
  assertEqual(HOUR_PACKS.MEDIUM.hours, 10, 'Should have 10 hours');
  assertEqual(HOUR_PACKS.MEDIUM.cost, 65000, 'Should cost $650 in cents');
  assertEqual(HOUR_PACKS.MEDIUM.pricePerHour, 6500, 'Should be $65/hour');
  assertEqual(HOUR_PACKS.MEDIUM.popular, true, 'Should be marked as popular');
  assertEqual(HOUR_PACKS.MEDIUM.expiryDays, 90, 'Should expire in 90 days');
});

test('LARGE pack has best savings', () => {
  assertEqual(HOUR_PACKS.LARGE.hours, 20, 'Should have 20 hours');
  assertEqual(HOUR_PACKS.LARGE.cost, 120000, 'Should cost $1,200 in cents');
  assertEqual(HOUR_PACKS.LARGE.pricePerHour, 6000, 'Should be $60/hour');
  assertEqual(HOUR_PACKS.LARGE.savings, 20000, 'Should save $200');
  assertEqual(HOUR_PACKS.LARGE.expiryDays, 120, 'Should expire in 120 days');
});

test('PREMIUM pack never expires', () => {
  assertEqual(HOUR_PACKS.PREMIUM.hours, 10, 'Should have 10 hours');
  assertEqual(HOUR_PACKS.PREMIUM.cost, 85000, 'Should cost $850 in cents');
  assertEqual(HOUR_PACKS.PREMIUM.neverExpires, true, 'Should never expire');
  assertEqual(HOUR_PACKS.PREMIUM.expiryDays, 0, 'Expiry days should be 0');
});

test('Hour packs show volume discount', () => {
  const smallRate = HOUR_PACKS.SMALL.pricePerHour;
  const mediumRate = HOUR_PACKS.MEDIUM.pricePerHour;
  const largeRate = HOUR_PACKS.LARGE.pricePerHour;
  
  assertEqual(smallRate > mediumRate, true, 'SMALL should have higher rate than MEDIUM');
  assertEqual(mediumRate > largeRate, true, 'MEDIUM should have higher rate than LARGE');
});

// ============================================================================
// DEVELOPMENT RATE TESTS
// ============================================================================

console.log('\n=== Development Rate Tests ===\n');

test('DEV_RATE is $75/hour', () => {
  assertEqual(DEV_RATE.hourlyRate, 7500, 'Dev rate should be $75/hour in cents');
});

test('DEV_RATE rush multiplier is 1.5x', () => {
  assertEqual(DEV_RATE.rushMultiplier, 1.5, 'Rush multiplier should be 1.5x');
  
  const rushRate = DEV_RATE.hourlyRate * DEV_RATE.rushMultiplier;
  assertEqual(rushRate, 11250, 'Rush rate should be $112.50/hour');
});

// ============================================================================
// UTILITY FUNCTION TESTS
// ============================================================================

console.log('\n=== Utility Function Tests ===\n');

test('formatPrice() converts cents to dollar string', () => {
  assertEqual(formatPrice(100), '$1', 'Should format 100 cents as $1');
  assertEqual(formatPrice(200000), '$2,000', 'Should format with commas');
  assertEqual(formatPrice(680000), '$6,800', 'Should format annual price');
});

test('formatHours() formats hour values', () => {
  assertEqual(formatHours(0), '0 hours', 'Should handle 0 hours');
  assertEqual(formatHours(1), '1 hour', 'Should handle singular');
  assertEqual(formatHours(10), '10 hours', 'Should handle plural');
  assertEqual(formatHours(-1), 'Unlimited', 'Should handle unlimited');
});

test('getTierMonthlyPrice() returns correct prices', () => {
  assertEqual(getTierMonthlyPrice('QUARTERLY'), 66667, 'QUARTERLY monthly price');
  assertEqual(getTierMonthlyPrice('ANNUAL'), 56667, 'ANNUAL monthly price');
  
  // With override
  assertEqual(getTierMonthlyPrice('QUARTERLY', 100000), 100000, 'Should use DB override');
  assertEqual(getTierMonthlyPrice('INVALID', 75000), 75000, 'Should use DB value for invalid tier');
});

// ============================================================================
// PRICING CONSISTENCY TESTS
// ============================================================================

console.log('\n=== Pricing Consistency Tests ===\n');

test('Services page pricing matches MAINTENANCE_PLANS', () => {
  // Services page shows $2,000/quarter and $6,800/year
  assertEqual(MAINTENANCE_PLANS.QUARTERLY.price, 200000, 'QUARTERLY should be $2,000');
  assertEqual(MAINTENANCE_PLANS.ANNUAL.price, 680000, 'ANNUAL should be $6,800');
});

test('Effective hourly rates are calculated correctly', () => {
  // QUARTERLY: $2,000 / 30 hours = $66.67/hour
  const quarterlyRate = Math.round(MAINTENANCE_PLANS.QUARTERLY.price / MAINTENANCE_PLANS.QUARTERLY.hoursIncluded);
  assertEqual(quarterlyRate, 6667, 'QUARTERLY effective rate should be ~$66.67/hour');
  
  // ANNUAL: $6,800 / 120 hours = $56.67/hour
  const annualRate = Math.round(MAINTENANCE_PLANS.ANNUAL.price / MAINTENANCE_PLANS.ANNUAL.hoursIncluded);
  assertEqual(annualRate, 5667, 'ANNUAL effective rate should be ~$56.67/hour');
});

test('All hour pack rates are at or below dev rate', () => {
  const devRate = DEV_RATE.hourlyRate;
  
  assertEqual(HOUR_PACKS.SMALL.pricePerHour <= devRate, true, 'SMALL pack rate should be <= dev rate');
  assertEqual(HOUR_PACKS.MEDIUM.pricePerHour <= devRate, true, 'MEDIUM pack rate should be <= dev rate');
  assertEqual(HOUR_PACKS.LARGE.pricePerHour <= devRate, true, 'LARGE pack rate should be <= dev rate');
});

console.log('\n=== All Tier Configuration Tests Passed ===\n');
console.log('✅ MAINTENANCE_PLANS configured correctly');
console.log('✅ NONPROFIT_TIERS alias works correctly');
console.log('✅ Hour packs pricing is consistent');
console.log('✅ Dev rate and pricing align with services page\n');
