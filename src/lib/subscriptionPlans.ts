/**
 * Subscription Plans Configuration
 * Quarterly and Annual maintenance/support plans for SeeZee projects
 */

export type SubscriptionPlanType = 'quarterly' | 'annual';

export interface SubscriptionPlan {
  id: SubscriptionPlanType;
  name: string;
  displayName: string;
  description: string;
  price: number; // in cents
  billingCycle: 'quarterly' | 'annual';
  changeRequestsAllowed: number;
  features: string[];
  stripePriceId?: string;
  popular?: boolean;
}

/**
 * All available subscription plans
 */
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'quarterly',
    name: 'Quarterly Maintenance',
    displayName: 'Quarterly Maintenance Plan',
    description: 'Comprehensive maintenance and support for your website - billed quarterly',
    price: 200000, // $2,000 per quarter
    billingCycle: 'quarterly',
    changeRequestsAllowed: -1, // Unlimited change requests
    features: [
      'Managed hosting & SSL certificate',
      'Security & plugin updates',
      'Daily automated backups',
      'Priority support (24hr response)',
      '30 support hours per quarter',
      'Monthly analytics & performance reports',
      'Emergency fixes (same-day)',
      'Unlimited change requests',
      'Strategy consultation calls',
      'Performance monitoring & optimization',
    ],
    // Note: stripePriceId should be configured in Stripe Dashboard as:
    // Product: "Quarterly Maintenance Plan"
    // Price: $2,000.00 USD every 3 months
    // If not set, the price will be created automatically on first subscription
    stripePriceId: process.env.STRIPE_PRICE_QUARTERLY || undefined,
    popular: true,
  },
  {
    id: 'annual',
    name: 'Annual Maintenance',
    displayName: 'Annual Maintenance Plan',
    description: 'Save with our annual plan - comprehensive maintenance and support for your website',
    price: 680000, // $6,800 per year (15% discount from $8,000)
    billingCycle: 'annual',
    changeRequestsAllowed: -1, // Unlimited change requests
    features: [
      'Everything in Quarterly Plan',
      'Managed hosting & SSL certificate',
      'Security & plugin updates',
      'Daily automated backups',
      'Priority support (24hr response)',
      '120 support hours per year',
      'Monthly analytics & performance reports',
      'Emergency fixes (same-day)',
      'Unlimited change requests',
      'Quarterly strategy reviews',
      'Performance monitoring & optimization',
      'Save 15% vs quarterly billing',
    ],
    // Note: stripePriceId should be configured in Stripe Dashboard as:
    // Product: "Annual Maintenance Plan"
    // Price: $6,800.00 USD every 12 months
    // If not set, the price will be created automatically on first subscription
    stripePriceId: process.env.STRIPE_PRICE_ANNUAL || undefined,
    popular: false,
  },
];

/**
 * Get plan by ID
 */
export function getSubscriptionPlan(id: SubscriptionPlanType): SubscriptionPlan | undefined {
  return SUBSCRIPTION_PLANS.find((plan) => plan.id === id);
}

/**
 * Get plan by name (for database lookups)
 */
export function getSubscriptionPlanByName(name: string): SubscriptionPlan | undefined {
  return SUBSCRIPTION_PLANS.find((plan) => plan.name === name);
}

/**
 * Format price for display
 */
export function formatSubscriptionPrice(cents: number, billingCycle: 'quarterly' | 'annual'): string {
  const dollars = cents / 100;
  const period = billingCycle === 'quarterly' ? 'quarter' : 'year';
  return `$${dollars.toFixed(2)} per ${period}`;
}

/**
 * Get the default plan (quarterly)
 */
export function getDefaultPlan(): SubscriptionPlan {
  return SUBSCRIPTION_PLANS[0];
}



