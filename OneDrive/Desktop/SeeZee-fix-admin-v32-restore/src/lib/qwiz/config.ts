/**
 * Feature Builder Pricing Configuration
 * All prices configurable via environment variables
 */

const getEnvPrice = (key: string, fallback: number): number => {
  const value = process.env[key];
  return value ? parseInt(value, 10) : fallback;
};

export const SERVICES = {
  website: {
    id: 'website',
    label: 'Website',
    description: 'Custom responsive website',
    base: getEnvPrice('SEEZEE_PRICE_WEBSITE_BASE', 200000), // $2,000 in cents
    icon: '🌐',
  },
  app: {
    id: 'app',
    label: 'Mobile App',
    description: 'iOS & Android application',
    base: getEnvPrice('SEEZEE_PRICE_APP_BASE', 400000), // $4,000
    icon: '📱',
  },
  ai: {
    id: 'ai',
    label: 'AI Integration',
    description: 'AI-powered features & automation',
    base: getEnvPrice('SEEZEE_PRICE_AI_BASE', 80000), // $800
    icon: '🤖',
  },
  maintenance: {
    id: 'maintenance',
    label: 'Maintenance Plan',
    description: 'Ongoing support & updates',
    base: 0,
    monthly: getEnvPrice('SEEZEE_PRICE_MAINT_BASE', 29900), // $299/mo
    icon: '🔧',
  },
} as const;

export type Service = keyof typeof SERVICES;

export const FEATURES = [
  // 🎨 Design & Branding
  {
    id: 'motion-design',
    category: 'design',
    label: 'Motion Design',
    description: 'Smooth scroll & micro-motion branding',
    price: getEnvPrice('F_MOTION_DESIGN', 30000), // $300
    icon: '✨',
  },
  {
    id: 'visual-assets',
    category: 'design',
    label: 'Visual Assets',
    description: 'Icons, artwork, or hero graphics',
    price: getEnvPrice('F_VISUAL_ASSETS', 40000), // $400
    icon: '🎨',
  },
  {
    id: 'brand-identity',
    category: 'design',
    label: 'Logo & Colors',
    description: 'Logo set + color palette + typography',
    price: getEnvPrice('F_BRAND_IDENTITY', 25000), // $250
    icon: '�',
  },
  {
    id: '3d-visuals',
    category: 'design',
    label: '3D Visuals',
    description: '3D hero graphics or product showcase',
    price: getEnvPrice('F_3D_VISUALS', 60000), // $600
    icon: '🧊',
  },

  // 🧩 Functionality
  {
    id: 'smart-forms',
    category: 'functionality',
    label: 'Smart Forms',
    description: 'Advanced contact or quote forms',
    price: getEnvPrice('F_SMART_FORMS', 20000), // $200
    icon: '📝',
  },
  {
    id: 'admin-panel',
    category: 'functionality',
    label: 'Admin Panel',
    description: 'Portal for client/project management',
    price: getEnvPrice('F_ADMIN_PANEL', 70000), // $700
    icon: '⚙️',
  },
  {
    id: 'online-store',
    category: 'functionality',
    label: 'Online Store',
    description: 'Cart, checkout, and payment integration',
    price: getEnvPrice('F_ONLINE_STORE', 80000), // $800
    icon: '🛒',
  },
  {
    id: 'scheduler',
    category: 'functionality',
    label: 'Scheduler',
    description: 'Appointment system with calendar sync',
    price: getEnvPrice('F_SCHEDULER', 50000), // $500
    icon: '📅',
  },
  {
    id: 'content-manager',
    category: 'functionality',
    label: 'Content Manager',
    description: 'Simple content editing system',
    price: getEnvPrice('F_CONTENT_MANAGER', 25000), // $250
    icon: '�',
  },
  {
    id: 'account-system',
    category: 'functionality',
    label: 'Account System',
    description: 'Login, signup, password reset',
    price: getEnvPrice('F_ACCOUNT_SYSTEM', 30000), // $300
    icon: '🔐',
  },

  // 🔌 Integrations
  {
    id: 'payment-gateway',
    category: 'integrations',
    label: 'Payment Gateway',
    description: 'Secure checkout with Stripe',
    price: getEnvPrice('F_PAYMENT_GATEWAY', 15000), // $150
    icon: '💳',
  },
  {
    id: 'auto-emails',
    category: 'integrations',
    label: 'Auto Emails',
    description: 'Send follow-ups and confirmations',
    price: getEnvPrice('F_AUTO_EMAILS', 20000), // $200
    icon: '📧',
  },
  {
    id: 'insights-panel',
    category: 'integrations',
    label: 'Insights Panel',
    description: 'View metrics and user analytics',
    price: getEnvPrice('F_INSIGHTS_PANEL', 25000), // $250
    icon: '�',
  },
  {
    id: 'api-backend',
    category: 'integrations',
    label: 'API Backend',
    description: 'Custom database & endpoints',
    price: getEnvPrice('F_API_BACKEND', 60000), // $600
    icon: '🔌',
  },
  {
    id: 'chat-integration',
    category: 'integrations',
    label: 'Chat Integration',
    description: 'Smart assistant / chatbot features',
    price: getEnvPrice('F_CHAT_INTEGRATION', 40000), // $400
    icon: '🤖',
  },
] as const;

export type FeatureId = typeof FEATURES[number]['id'];
export type Category = 'design' | 'functionality' | 'integrations';

export const CATEGORIES: Record<Category, string> = {
  design: 'Design & Branding',
  functionality: 'Functionality',
  integrations: 'Integrations',
};

export const RUSH_MULTIPLIER = 1.15; // 15% rush fee
export const DEPOSIT_PERCENT = 0.25; // 25% deposit
export const MIN_DEPOSIT = 25000; // $250 minimum deposit
