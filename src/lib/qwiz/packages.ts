/**
 * Package-Based Pricing Configuration
 * All prices in cents (e.g., 120000 = $1,200)
 */

const getEnvPrice = (key: string, fallback: number): number => {
  const value = process.env[key];
  return value ? parseInt(value, 10) : fallback;
};

export type PackageTier = 'starter' | 'pro' | 'elite';
export type Category = 'design' | 'functionality' | 'integrations';

export interface FeatureOption {
  id: string;
  category: Category;
  title: string;
  description: string;
  price: number;
  icon: string;
  lockedInTiers?: PackageTier[]; // Required for these tiers
  recommendedTiers?: PackageTier[]; // Suggested for these tiers
}

export interface PackageDefinition {
  id: PackageTier;
  title: string;
  tagline: string;
  description: string;
  baseIncludedFeatures: string[]; // Feature IDs included in base price
  basePrice: number;
  maxAddonsCost: number; // Maximum allowed add-ons cost
  badge?: string;
  icon: string;
}

// Package Definitions
export const PACKAGES: PackageDefinition[] = [
  {
    id: 'starter',
    title: 'Starter',
    tagline: 'Perfect for small businesses',
    description: '5-page website with essential features',
    baseIncludedFeatures: [
      'brand-identity',
      'content-pages',
      'contact-form',
      'mobile-responsive',
      'search-functionality', // NOW INCLUDED
    ],
    basePrice: getEnvPrice('PKG_STARTER_BASE', 120000), // $1,200
    maxAddonsCost: 130000, // $1,300 max add-ons (total max ~$2,500)
    badge: 'Most Popular',
    icon: '🌱',
  },
  {
    id: 'pro',
    title: 'Pro',
    tagline: 'For growing businesses',
    description: 'Advanced features with CMS and integrations',
    baseIncludedFeatures: [
      'brand-identity',
      'content-pages',
      'contact-form',
      'mobile-responsive',
      'search-functionality', // NOW INCLUDED
      'content-manager',
      'insights-panel',
      'auto-emails',
      'smart-forms',
      'seo-optimization', // NOW INCLUDED
    ],
    basePrice: getEnvPrice('PKG_PRO_BASE', 199900), // $1,999 (down from $2,800)
    maxAddonsCost: 150000, // $1,500 max add-ons (total max ~$3,500)
    icon: '🚀',
  },
  {
    id: 'elite',
    title: 'Elite',
    tagline: 'Full-featured premium',
    description: 'Everything included with priority support',
    baseIncludedFeatures: [
      'brand-identity',
      'content-pages',
      'contact-form',
      'mobile-responsive',
      'search-functionality', // INCLUDED
      'content-manager',
      'insights-panel',
      'auto-emails',
      'smart-forms',
      'seo-optimization', // INCLUDED
      'motion-design',
      'visual-assets',
      'admin-panel',
      'api-backend',
      'chat-integration',
      'performance-optimization', // NOW INCLUDED
      'security-hardening', // NOW INCLUDED
    ],
    basePrice: getEnvPrice('PKG_ELITE_BASE', 299900), // $2,999 (down from $5,500)
    maxAddonsCost: 50000, // $500 max add-ons (total max ~$3,500)
    badge: 'Best Value',
    icon: '👑',
  },
];

// All Available Features
export const FEATURES: FeatureOption[] = [
  // ========== DESIGN & BRANDING ==========
  {
    id: 'brand-identity',
    category: 'design',
    title: 'Logo & Brand Colors',
    description: 'Custom logo design, color palette, typography system',
    price: 0, // Included in all packages
    icon: '🎯',
    lockedInTiers: ['starter', 'pro', 'elite'],
  },
  {
    id: 'motion-design',
    category: 'design',
    title: 'Motion & Animations',
    description: 'Smooth scroll effects, micro-interactions, page transitions',
    price: getEnvPrice('F_MOTION_DESIGN', 15000), // $150 (down from $300)
    icon: '✨',
    lockedInTiers: ['elite'],
    recommendedTiers: ['pro'],
  },
  {
    id: 'visual-assets',
    category: 'design',
    title: 'Custom Graphics',
    description: 'Icons, illustrations, hero images, infographics',
    price: getEnvPrice('F_VISUAL_ASSETS', 20000), // $200 (down from $400)
    icon: '🎨',
    lockedInTiers: ['elite'],
    recommendedTiers: ['pro'],
  },
  {
    id: '3d-visuals',
    category: 'design',
    title: '3D Elements',
    description: '3D graphics, interactive 3D models, WebGL effects',
    price: getEnvPrice('F_3D_VISUALS', 30000), // $300 (down from $600)
    icon: '🧊',
  },
  {
    id: 'video-production',
    category: 'design',
    title: 'Video Production',
    description: 'Promotional videos, explainer animations, product demos',
    price: 25000, // $250 (down from $800)
    icon: '🎥',
  },
  {
    id: 'photography',
    category: 'design',
    title: 'Professional Photography',
    description: 'Product photography, headshots, lifestyle images',
    price: 20000, // $200 (down from $500)
    icon: '📸',
  },

  // ========== CORE FUNCTIONALITY ==========
  {
    id: 'content-pages',
    category: 'functionality',
    title: 'Content Pages',
    description: 'Up to 10 custom pages (About, Services, Team, etc.)',
    price: 0, // Included in all packages
    icon: '📄',
    lockedInTiers: ['starter', 'pro', 'elite'],
  },
  {
    id: 'mobile-responsive',
    category: 'functionality',
    title: 'Mobile Responsive',
    description: 'Fully optimized for all devices and screen sizes',
    price: 0, // Included in all packages
    icon: '📱',
    lockedInTiers: ['starter', 'pro', 'elite'],
  },
  {
    id: 'contact-form',
    category: 'functionality',
    title: 'Contact Form',
    description: 'Simple contact form with spam protection',
    price: 0, // Included in all packages
    icon: '✉️',
    lockedInTiers: ['starter', 'pro', 'elite'],
  },
  {
    id: 'smart-forms',
    category: 'functionality',
    title: 'Advanced Forms',
    description: 'Multi-step forms, conditional logic, file uploads, validation',
    price: getEnvPrice('F_SMART_FORMS', 15000), // $200
    icon: '📝',
    lockedInTiers: ['pro', 'elite'],
  },
  {
    id: 'content-manager',
    category: 'functionality',
    title: 'Content Management (CMS)',
    description: 'Easy-to-use interface for updating content, blog posts, pages',
    price: getEnvPrice('F_CONTENT_MANAGER', 20000), // $250
    icon: '�',
    lockedInTiers: ['pro', 'elite'],
  },
  {
    id: 'admin-panel',
    category: 'functionality',
    title: 'Admin Dashboard',
    description: 'Manage users, content, orders, and view analytics',
    price: getEnvPrice('F_ADMIN_PANEL', 40000), // $700
    icon: '⚙️',
    lockedInTiers: ['elite'],
  },
  {
    id: 'online-store',
    category: 'functionality',
    title: 'E-commerce Store',
    description: 'Full online store with products, cart, checkout, inventory',
    price: getEnvPrice('F_ONLINE_STORE', 35000), // $800
    icon: '🛒',
  },
  {
    id: 'scheduler',
    category: 'functionality',
    title: 'Booking System',
    description: 'Appointment scheduling, calendar sync, reminders',
    price: getEnvPrice('F_SCHEDULER', 25000), // $500
    icon: '📅',
  },
  {
    id: 'account-system',
    category: 'functionality',
    title: 'User Accounts',
    description: 'Registration, login, password reset, profile management',
    price: getEnvPrice('F_ACCOUNT_SYSTEM', 15000), // $300
    icon: '🔐',
  },
  {
    id: 'membership-portal',
    category: 'functionality',
    title: 'Membership Portal',
    description: 'Tiered memberships, subscriptions, exclusive content access',
    price: 45000, // $450 (down from $900)
    icon: '🎟️',
  },
  {
    id: 'forums-community',
    category: 'functionality',
    title: 'Community Forum',
    description: 'Discussion boards, user profiles, moderation tools',
    price: 30000, // $300 (down from $700)
    icon: '💬',
  },
  {
    id: 'search-functionality',
    category: 'functionality',
    title: 'Search & Filters',
    description: 'Smart search, faceted filters, autocomplete, search analytics',
    price: 0, // FREE - Now included in ALL packages!
    icon: '🔍',
    lockedInTiers: ['starter', 'pro', 'elite'],
  },
  {
    id: 'multi-language',
    category: 'functionality',
    title: 'Multi-language Support',
    description: 'Translate content, language switcher, RTL support',
    price: 30000, // $300 (down from $450)
    icon: '🌐',
  },

  // ========== INTEGRATIONS & APIS ==========
  {
    id: 'payment-gateway',
    category: 'integrations',
    title: 'Payment Processing',
    description: 'Stripe, PayPal, or Square integration for payments',
    price: getEnvPrice('F_PAYMENT_GATEWAY', 15000), // $150
    icon: '💳',
  },
  {
    id: 'auto-emails',
    category: 'integrations',
    title: 'Email Automation',
    description: 'Automated emails, drip campaigns, transactional messages',
    price: getEnvPrice('F_AUTO_EMAILS', 15000), // $150 (down from $200)
    icon: '📧',
    lockedInTiers: ['pro', 'elite'],
  },
  {
    id: 'insights-panel',
    category: 'integrations',
    title: 'Analytics Dashboard',
    description: 'Google Analytics, visitor tracking, conversion metrics',
    price: getEnvPrice('F_INSIGHTS_PANEL', 20000), // $200 (down from $250)
    icon: '📊',
    lockedInTiers: ['pro', 'elite'],
  },
  {
    id: 'api-backend',
    category: 'integrations',
    title: 'Custom API & Backend',
    description: 'RESTful API, database design, custom endpoints',
    price: getEnvPrice('F_API_BACKEND', 40000), // $400 (down from $600)
    icon: '🔌',
    lockedInTiers: ['elite'],
  },
  {
    id: 'chat-integration',
    category: 'integrations',
    title: 'AI Chatbot',
    description: 'Intelligent chatbot for customer support and FAQs',
    price: getEnvPrice('F_CHAT_INTEGRATION', 30000), // $300 (down from $400)
    icon: '🤖',
    lockedInTiers: ['elite'],
  },
  {
    id: 'crm-integration',
    category: 'integrations',
    title: 'CRM Integration',
    description: 'Connect to Salesforce, HubSpot, or Pipedrive',
    price: 20000, // $200 (down from $350)
    icon: '📋',
  },
  {
    id: 'sms-notifications',
    category: 'integrations',
    title: 'SMS Notifications',
    description: 'Send text alerts, reminders, and updates via Twilio',
    price: 15000, // $150 (down from $250)
    icon: '📱',
  },
  {
    id: 'social-media',
    category: 'integrations',
    title: 'Social Media Integration',
    description: 'Social login, sharing, feeds from Instagram/Twitter',
    price: 15000, // $150 (down from $200)
    icon: '📱',
  },
  {
    id: 'calendar-sync',
    category: 'integrations',
    title: 'Calendar Sync',
    description: 'Google Calendar, Outlook, iCal integration',
    price: 15000, // $150 (down from $250)
    icon: '📅',
  },
  {
    id: 'maps-location',
    category: 'integrations',
    title: 'Maps & Location',
    description: 'Google Maps, store locator, directions',
    price: 20000, // $200
    icon: '🗺️',
  },
  {
    id: 'live-chat',
    category: 'integrations',
    title: 'Live Chat Support',
    description: 'Real-time chat with Intercom, Drift, or custom solution',
    price: 20000, // $200 (down from $300)
    icon: '💬',
  },
  {
    id: 'reviews-ratings',
    category: 'integrations',
    title: 'Review System',
    description: 'Customer reviews, ratings, testimonials management',
    price: 15000, // $150 (down from $250)
    icon: '⭐',
  },
  {
    id: 'shipping-integration',
    category: 'integrations',
    title: 'Shipping Integration',
    description: 'Real-time rates from USPS, FedEx, UPS',
    price: 20000, // $200 (down from $350)
    icon: '📦',
  },

  // ========== PERFORMANCE & SEO ==========
  {
    id: 'seo-optimization',
    category: 'integrations',
    title: 'SEO Optimization',
    description: 'Meta tags, schema markup, sitemap, search console setup',
    price: 0, // FREE - Now included in Pro & Elite packages!
    icon: '🔍',
    lockedInTiers: ['pro', 'elite'],
  },
  {
    id: 'performance-optimization',
    category: 'integrations',
    title: 'Performance Tuning',
    description: 'Image optimization, caching, CDN, lazy loading',
    price: 0, // FREE - Now included in Elite package!
    icon: '⚡',
    lockedInTiers: ['elite'],
  },
  {
    id: 'security-hardening',
    category: 'integrations',
    title: 'Security Hardening',
    description: 'SSL, firewall, DDoS protection, security audits',
    price: 0, // FREE - Now included in Elite package!
    icon: '🔒',
    lockedInTiers: ['elite'],
  },
  {
    id: 'accessibility',
    category: 'integrations',
    title: 'Accessibility (WCAG)',
    description: 'Screen reader support, keyboard navigation, WCAG 2.1 AA',
    price: 25000, // $250 (down from $450)
    icon: '♿',
  },
  {
    id: 'pwa',
    category: 'integrations',
    title: 'Progressive Web App',
    description: 'Offline mode, install prompt, push notifications',
    price: 30000, // $300 (down from $500)
    icon: '📲',
  },
];

// Maintenance Plan (Required for all packages)
export const MAINTENANCE = {
  title: 'Website Care & Support',
  description: 'Hosting, updates, backups & ongoing support',
  monthlyPrice: getEnvPrice('MAINTENANCE_MONTHLY', 5000), // $50/month (down from $60)
  features: [
    '✓ Managed hosting & SSL certificate',
    '✓ Security & plugin updates',
    '✓ Daily automated backups',
    '✓ Email support (48hr response)',
    '✓ Basic content updates (1hr/month)',
    '✓ Performance monitoring',
  ],
  premium: {
    title: 'Premium Support',
    monthlyPrice: 9000, // $90/month
    features: [
      '✓ Everything in Standard Support',
      '✓ Priority support (24hr response)',
      '✓ Extended content updates (3hrs/month)',
      '✓ Monthly analytics & SEO reports',
      '✓ Emergency fixes (same-day)',
      '✓ Strategy consultation calls',
    ],
  },
};

// Pricing Rules
export const PRICE_CEILING = 350000; // $3,500 max project cost (realistic for startups)
export const RUSH_MULTIPLIER = 1.15; // 15% rush fee
export const DEPOSIT_PERCENT = 0.25; // 25% deposit
export const MIN_DEPOSIT = 25000; // $250 minimum deposit

export const CATEGORIES: Record<Category, string> = {
  design: 'Design & Branding',
  functionality: 'Functionality',
  integrations: 'Integrations',
};

// Helper to get package by ID
export function getPackage(id: PackageTier): PackageDefinition {
  const pkg = PACKAGES.find((p) => p.id === id);
  if (!pkg) throw new Error(`Package ${id} not found`);
  return pkg;
}

// Helper to get feature by ID
export function getFeature(id: string): FeatureOption | undefined {
  return FEATURES.find((f) => f.id === id);
}

// Check if feature is locked for a tier
export function isFeatureLocked(featureId: string, tier: PackageTier): boolean {
  const feature = getFeature(featureId);
  return feature?.lockedInTiers?.includes(tier) || false;
}

// Check if feature is recommended for a tier
export function isFeatureRecommended(featureId: string, tier: PackageTier): boolean {
  const feature = getFeature(featureId);
  return feature?.recommendedTiers?.includes(tier) || false;
}

// Get all locked features for a tier
export function getLockedFeatures(tier: PackageTier): string[] {
  return FEATURES.filter((f) => f.lockedInTiers?.includes(tier)).map((f) => f.id);
}
