/**
 * Subscription Plans Configuration
 * Monthly and annual maintenance/support plans for SeeZee projects
 */

export type SubscriptionPlanType = 'standard-monthly' | 'premium-monthly' | 'standard-annual' | 'premium-annual';

export interface SubscriptionPlan {
  id: SubscriptionPlanType;
  name: string;
  displayName: string;
  description: string;
  price: number; // in cents
  billingCycle: 'monthly' | 'annual';
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
    id: 'standard-monthly',
    name: 'Standard Monthly',
    displayName: 'Standard Support',
    description: 'Essential maintenance and support for your website',
    price: 5000, // $50/month
    billingCycle: 'monthly',
    changeRequestsAllowed: 2,
    features: [
      'Managed hosting & SSL certificate',
      'Security & plugin updates',
      'Daily automated backups',
      'Email support (48hr response)',
      'Basic content updates (1hr/month)',
      'Performance monitoring',
      '2 change requests per month',
    ],
    stripePriceId: process.env.STRIPE_PRICE_STANDARD_MONTHLY,
  },
  {
    id: 'premium-monthly',
    name: 'Premium Monthly',
    displayName: 'Premium Support',
    description: 'Priority support with extended features and faster response',
    price: 9000, // $90/month
    billingCycle: 'monthly',
    changeRequestsAllowed: 5,
    features: [
      '✨ Everything in Standard Support',
      'Priority support (24hr response)',
      'Extended content updates (3hrs/month)',
      'Monthly analytics & SEO reports',
      'Emergency fixes (same-day)',
      'Strategy consultation calls',
      '5 change requests per month',
    ],
    stripePriceId: process.env.STRIPE_PRICE_PREMIUM_MONTHLY,
    popular: true,
  },
  {
    id: 'standard-annual',
    name: 'Standard Annual',
    displayName: 'Standard Support (Annual)',
    description: 'Essential maintenance with annual billing - save 15%',
    price: 51000, // $510/year (equivalent to $42.50/month - 15% discount)
    billingCycle: 'annual',
    changeRequestsAllowed: 2,
    features: [
      'Managed hosting & SSL certificate',
      'Security & plugin updates',
      'Daily automated backups',
      'Email support (48hr response)',
      'Basic content updates (1hr/month)',
      'Performance monitoring',
      '2 change requests per month',
      '💰 Save 15% with annual billing',
    ],
    stripePriceId: process.env.STRIPE_PRICE_STANDARD_ANNUAL,
  },
  {
    id: 'premium-annual',
    name: 'Premium Annual',
    displayName: 'Premium Support (Annual)',
    description: 'Priority support with annual billing - save 15%',
    price: 91800, // $918/year (equivalent to $76.50/month - 15% discount)
    billingCycle: 'annual',
    changeRequestsAllowed: 5,
    features: [
      '✨ Everything in Standard Support',
      'Priority support (24hr response)',
      'Extended content updates (3hrs/month)',
      'Monthly analytics & SEO reports',
      'Emergency fixes (same-day)',
      'Strategy consultation calls',
      '5 change requests per month',
      '💰 Save 15% with annual billing',
    ],
    stripePriceId: process.env.STRIPE_PRICE_PREMIUM_ANNUAL,
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
export function formatSubscriptionPrice(cents: number, billingCycle: 'monthly' | 'annual'): string {
  const dollars = cents / 100;
  if (billingCycle === 'annual') {
    const monthly = dollars / 12;
    return `$${monthly.toFixed(2)}/mo (billed annually at $${dollars.toFixed(2)})`;
  }
  return `$${dollars.toFixed(2)}/mo`;
}

/**
 * Get monthly plans only
 */
export function getMonthlyPlans(): SubscriptionPlan[] {
  return SUBSCRIPTION_PLANS.filter((plan) => plan.billingCycle === 'monthly');
}

/**
 * Get annual plans only
 */
export function getAnnualPlans(): SubscriptionPlan[] {
  return SUBSCRIPTION_PLANS.filter((plan) => plan.billingCycle === 'annual');
}

/**
 * Calculate savings for annual vs monthly
 */
export function calculateAnnualSavings(planType: 'standard' | 'premium'): number {
  const monthly = SUBSCRIPTION_PLANS.find((p) => p.id === `${planType}-monthly`);
  const annual = SUBSCRIPTION_PLANS.find((p) => p.id === `${planType}-annual`);
  
  if (!monthly || !annual) return 0;
  
  const monthlyAnnualCost = monthly.price * 12;
  return monthlyAnnualCost - annual.price;
}



