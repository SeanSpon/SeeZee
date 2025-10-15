/**
 * Pricing calculation logic for SeeZee project estimates
 * Based on project types, features, timeline, and content needs
 */

export interface QuestionnaireInput {
  projectTypes: string[];
  needsEcommerce?: boolean;
  needsAuth?: boolean;
  integrations?: string[];
  contentStatus?: string;
  deadline?: string | Date;
  [key: string]: any;
}

export interface PricingResult {
  estimate: number;    // Total estimate in cents
  deposit: number;     // Required deposit in cents
  breakdown: {
    base: number;
    addons: number;
    rush: number;
    total: number;
  };
}

/**
 * Check if a deadline is considered "rush" (< 3 weeks from now)
 */
function isRush(deadline?: string | Date): boolean {
  if (!deadline) return false;
  
  const deadlineDate = typeof deadline === 'string' ? new Date(deadline) : deadline;
  const threeWeeksFromNow = new Date();
  threeWeeksFromNow.setDate(threeWeeksFromNow.getDate() + 21);
  
  return deadlineDate < threeWeeksFromNow;
}

/**
 * Compute project pricing based on questionnaire responses
 * 
 * Base pricing:
 * - Website: $2,000
 * - App: $4,000
 * 
 * Add-ons:
 * - AI Integration: +$800
 * - Branding: +$400
 * - E-commerce: +$1,000
 * - Content creation: +$500
 * - Stripe integration: included with e-commerce
 * - Rush fee (<3 weeks): +15%
 * 
 * Deposit: 25% of estimate or $250 minimum
 */
export function computePrice(input: QuestionnaireInput): PricingResult {
  let base = 0;
  let addons = 0;

  // Base type (pick primary)
  if (input.projectTypes.includes('Website')) {
    base += 200000; // $2,000 in cents
  } else if (input.projectTypes.includes('App')) {
    base += 400000; // $4,000 in cents
  }

  // Add-ons
  if (input.projectTypes.includes('AI Integration') || input.projectTypes.includes('AI_DATA')) {
    addons += 80000; // $800
  }
  
  if (input.projectTypes.includes('Branding') || input.projectTypes.includes('BRANDING')) {
    addons += 40000; // $400
  }
  
  if (input.needsEcommerce || input.projectTypes.includes('ECOMMERCE')) {
    addons += 100000; // $1,000
  }
  
  if (input.contentStatus === 'need creation') {
    addons += 50000; // $500
  }

  // Stripe integration is included in e-commerce, no additional charge
  
  // Calculate subtotal before rush fee
  const subtotal = base + addons;
  
  // Rush fee
  let rushFee = 0;
  if (isRush(input.deadline)) {
    rushFee = Math.round(subtotal * 0.15); // 15% rush fee
  }
  
  const total = subtotal + rushFee;
  
  // Deposit: 25% or $250 minimum
  const deposit = Math.max(25000, Math.round(total * 0.25));

  return {
    estimate: total,
    deposit,
    breakdown: {
      base,
      addons,
      rush: rushFee,
      total
    }
  };
}

/**
 * Format price in cents to display string (e.g., "$2,500.00")
 */
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

/**
 * Get pricing breakdown as human-readable text
 */
export function getPricingBreakdown(result: PricingResult): string[] {
  const lines: string[] = [];
  
  if (result.breakdown.base > 0) {
    lines.push(`Base project: ${formatPrice(result.breakdown.base)}`);
  }
  
  if (result.breakdown.addons > 0) {
    lines.push(`Add-ons & features: ${formatPrice(result.breakdown.addons)}`);
  }
  
  if (result.breakdown.rush > 0) {
    lines.push(`Rush fee (15%): ${formatPrice(result.breakdown.rush)}`);
  }
  
  lines.push(`Total estimate: ${formatPrice(result.breakdown.total)}`);
  lines.push(`Required deposit (25%): ${formatPrice(result.deposit)}`);
  
  return lines;
}
