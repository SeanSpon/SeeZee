/**
 * Tests for UI utility functions
 * Run with: npx ts-node --compiler-options '{"module":"CommonJS"}' src/lib/__tests__/ui.test.ts
 */

import { centsToDollars, formatCents, formatCurrency, formatCompactCurrency } from '../ui';

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

// Tests
console.log('\n=== UI Utility Tests ===\n');

// centsToDollars tests
test('centsToDollars converts 100 cents to 1 dollar', () => {
  assertEqual(centsToDollars(100), 1);
});

test('centsToDollars converts 200200000 cents to 2002000 dollars', () => {
  assertEqual(centsToDollars(200200000), 2002000);
});

test('centsToDollars converts 0 cents to 0 dollars', () => {
  assertEqual(centsToDollars(0), 0);
});

test('centsToDollars handles fractional cents', () => {
  assertEqual(centsToDollars(250), 2.5);
});

test('centsToDollars handles negative amounts', () => {
  assertEqual(centsToDollars(-500), -5);
});

// formatCents tests
test('formatCents formats 100 cents as $1.00', () => {
  assertEqual(formatCents(100), '$1.00');
});

test('formatCents formats 200200000 cents as $2,002,000.00', () => {
  assertEqual(formatCents(200200000), '$2,002,000.00');
});

test('formatCents formats 0 cents as $0.00', () => {
  assertEqual(formatCents(0), '$0.00');
});

// formatCurrency tests (expects dollars)
test('formatCurrency formats 1 dollar as $1', () => {
  assertEqual(formatCurrency(1), '$1');
});

test('formatCurrency formats 2002000 dollars as $2,002,000', () => {
  assertEqual(formatCurrency(2002000), '$2,002,000');
});

test('formatCurrency formats 20020 dollars as $20,020', () => {
  assertEqual(formatCurrency(20020), '$20,020');
});

// formatCompactCurrency tests
test('formatCompactCurrency formats 1000 as $1K', () => {
  assertEqual(formatCompactCurrency(1000), '$1K');
});

test('formatCompactCurrency formats 1000000 as $1.0M', () => {
  assertEqual(formatCompactCurrency(1000000), '$1.0M');
});

test('formatCompactCurrency formats 500 as $500', () => {
  assertEqual(formatCompactCurrency(500), '$500');
});

// Invoice revenue calculation simulation
test('Invoice revenue with cents-to-dollars conversion gives correct total', () => {
  // Simulate invoices stored in cents
  const invoices = [
    { total: 100000, status: 'PAID' },   // $1,000
    { total: 50000, status: 'PAID' },    // $500
    { total: 25000, status: 'SENT' },    // $250 (not paid)
  ];
  
  const paidInvoices = invoices.filter(inv => inv.status === 'PAID');
  const totalRevenueCents = paidInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalRevenueDollars = centsToDollars(totalRevenueCents);
  
  assertEqual(totalRevenueDollars, 1500, 'Total revenue should be $1,500');
});

test('Without cents conversion, revenue would be incorrect (demonstration)', () => {
  const invoices = [
    { total: 200200000, status: 'PAID' }, // $2,002,000 in cents (should be $20,020 in dollars)
  ];
  
  // INCORRECT: treating cents as dollars
  const incorrectTotal = invoices.reduce((sum, inv) => sum + inv.total, 0);
  
  // CORRECT: converting cents to dollars
  const correctTotal = centsToDollars(invoices.reduce((sum, inv) => sum + inv.total, 0));
  
  assertEqual(incorrectTotal, 200200000, 'Without conversion, we get huge number');
  assertEqual(correctTotal, 2002000, 'With conversion, we get correct dollar amount');
});

console.log('\n=== All tests completed ===\n');
