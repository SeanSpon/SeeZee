/**
 * Comprehensive questionnaire for package-based system
 */

export const GOAL_OPTIONS = [
  '📈 Increase online sales',
  '🎯 Generate more leads',
  '🌟 Build brand awareness',
  '💡 Launch new product/service',
  '⚡ Improve site performance',
  '🔄 Modernize existing website',
  '🤝 Improve customer experience',
  '🤖 Automate business processes',
  '📱 Expand to mobile users',
  '🌍 Reach global audience',
  '📊 Better analytics & insights',
  '🎨 Rebrand & redesign',
] as const;

export const AUDIENCE_OPTIONS = [
  '🏢 B2B (Businesses)',
  '🛍️ B2C (Consumers)',
  '🏭 Enterprise companies',
  '💼 Small businesses',
  '🚀 Startups & founders',
  '👨‍💻 Tech professionals',
  '🎓 Students & educators',
  '💰 High-income individuals',
  '👥 General public',
  '🌐 International audience',
  '📱 Mobile-first users',
  '🎮 Millennials/Gen Z',
  '👔 Gen X professionals',
  '👴 Boomers/seniors',
] as const;

export const INDUSTRY_OPTIONS = [
  '💻 Technology & Software',
  '🏥 Healthcare & Medical',
  '💰 Finance & Banking',
  '🛒 E-commerce & Retail',
  '🎓 Education & Training',
  '🏠 Real Estate',
  '🍔 Food & Beverage',
  '✈️ Travel & Hospitality',
  '🎨 Creative & Design',
  '⚖️ Legal Services',
  '🏋️ Health & Fitness',
  '🎭 Entertainment & Events',
  '🏗️ Construction',
  '🚗 Automotive',
  '📱 Marketing & Advertising',
  '🔧 Professional Services',
  '🌱 Non-profit & Social',
  '📦 Logistics & Supply Chain',
  '💎 Luxury Goods',
  '🎮 Gaming & Esports',
] as const;

export const TIMELINE_OPTIONS = [
  '⚡ ASAP - Launch in 2-3 weeks (Rush fee applies)',
  '🚀 Fast - Launch in 1 month',
  '📅 Standard - Launch in 2-3 months',
  '🗓️ Flexible - Launch in 3-6 months',
  '💭 Planning stage - Not urgent',
] as const;

export const DESIGN_PREFERENCES = [
  '✨ Minimalist & clean',
  '🎨 Bold & colorful',
  '🔮 Modern & sleek',
  '💼 Professional & corporate',
  '🎪 Playful & creative',
  '💎 Luxury & elegant',
  '🌈 Vibrant & energetic',
  '🌙 Dark mode focused',
  '🎯 Match existing brand',
  '🔥 Cutting-edge/experimental',
  '📰 Editorial/content-focused',
  '🖼️ Image-heavy/visual',
] as const;

export const CONTENT_STATUS = [
  '✅ All content ready (text, images, videos)',
  '📝 Text ready, need images/media',
  '🖼️ Images ready, need copywriting',
  '⏳ Content in progress',
  '❌ Need help creating everything',
  '🤝 Want guidance on content strategy',
] as const;

export const MUST_HAVE_FEATURES = [
  '🔐 User login & authentication',
  '💳 Payment processing',
  '📧 Email marketing integration',
  '📱 SMS notifications',
  '🔍 Advanced search functionality',
  '🌐 Multi-language support',
  '♿ Accessibility (WCAG compliant)',
  '📊 Custom reporting dashboard',
  '📅 Calendar/scheduling system',
  '💬 Live chat support',
  '⭐ Review & rating system',
  '📍 Location/map integration',
  '🎥 Video hosting',
  '📖 Blog/news section',
  '🔔 Push notifications',
  '📱 Progressive Web App (PWA)',
  '🤖 AI/chatbot integration',
  '📈 SEO optimization',
  '🎯 Marketing automation',
  '🔗 Third-party API integrations',
] as const;

export interface QuestionConfig {
  id: string;
  label: string;
  description?: string;
  type: 'multiselect' | 'select' | 'text' | 'textarea' | 'boolean';
  options?: readonly string[];
  required?: boolean;
  placeholder?: string;
}

export const QUESTIONS: QuestionConfig[] = [
  {
    id: 'goals',
    label: 'What are your main goals for this project?',
    description: 'Select all that apply - this helps us prioritize features',
    type: 'multiselect',
    options: GOAL_OPTIONS,
    required: true,
  },
  {
    id: 'industry',
    label: 'What industry are you in?',
    description: 'Helps us understand your market and competition',
    type: 'multiselect',
    options: INDUSTRY_OPTIONS,
    required: true,
  },
  {
    id: 'targetAudience',
    label: 'Who is your target audience?',
    description: 'Select all segments you want to reach',
    type: 'multiselect',
    options: AUDIENCE_OPTIONS,
    required: true,
  },
  {
    id: 'mustHaveFeatures',
    label: 'Must-have features for your project',
    description: 'Select any features that are critical to your success',
    type: 'multiselect',
    options: MUST_HAVE_FEATURES,
    required: false,
  },
  {
    id: 'designPreference',
    label: 'Design style preferences',
    description: 'What aesthetic resonates with your brand?',
    type: 'multiselect',
    options: DESIGN_PREFERENCES,
    required: false,
  },
  {
    id: 'contentStatus',
    label: 'Content readiness',
    description: 'Where are you at with content creation?',
    type: 'select',
    options: CONTENT_STATUS,
    required: true,
  },
  {
    id: 'timeline',
    label: 'When do you need to launch?',
    description: 'Rush delivery (under 3 weeks) includes a 15% fee',
    type: 'select',
    options: TIMELINE_OPTIONS,
    required: true,
  },
  {
    id: 'inspirationUrls',
    label: 'Inspiration websites',
    description: 'Share 2-3 websites you admire (design, functionality, etc.)',
    type: 'textarea',
    placeholder: 'https://example1.com - Love their clean layout\nhttps://example2.com - Great user flow',
    required: false,
  },
  {
    id: 'competitors',
    label: 'Main competitors',
    description: 'Who are you competing against? (URLs or names)',
    type: 'text',
    placeholder: 'competitor1.com, competitor2.com',
    required: false,
  },
  {
    id: 'uniqueValue',
    label: 'What makes you different?',
    description: 'Your unique selling proposition or competitive advantage',
    type: 'textarea',
    placeholder: 'What sets you apart from competitors?',
    required: false,
  },
  {
    id: 'existingWebsite',
    label: 'Do you have an existing website?',
    description: 'Are we building from scratch or redesigning?',
    type: 'boolean',
    required: true,
  },
  {
    id: 'notes',
    label: 'Additional requirements',
    description: 'Specific integrations, compliance needs, technical requirements, etc.',
    type: 'textarea',
    placeholder: 'E.g., "Need HIPAA compliance", "Must integrate with Salesforce", "Require 99.9% uptime SLA"',
    required: false,
  },
];
