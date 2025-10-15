/**
 * Questionnaire step registry with validation schemas
 */
import { z } from 'zod';

export const StepSlugs = [
  'name', 'email', 'phone', 'site', 'referral',
  'projectTypes', 'goal', 'deadline', 'budget', 'comms',
  'style', 'tone', 'brand', 'colorMode', 'inspo',
  'features', 'ecommerce', 'auth', 'content', 'integrations',
  'contentStatus', 'tagline', 'testimonials', 'motion', 'pages',
  'audience', 'demographics', 'problem', 'feeling', 'notes'
] as const;

export type StepSlug = typeof StepSlugs[number];

export const StepSchemas: Record<StepSlug, z.ZodTypeAny> = {
  name: z.string().min(2, 'Name required (at least 2 characters)'),
  email: z.string().email('Valid email required'),
  phone: z.string().optional(),
  site: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  referral: z.string().optional(),

  projectTypes: z.array(z.enum(['Website','App','Maintenance','AI Integration','Branding','Other'])).min(1, 'Select at least one project type'),
  goal: z.string().min(10, 'Please describe your main goal (at least 10 characters)'),
  deadline: z.string().optional(),
  budget: z.enum(['<1k','1–3k','3–7k','7k+']).optional(),
  comms: z.enum(['In-person','Call','Online']).optional(),

  style: z.array(z.string()).min(1, 'Select at least 1 style').max(5, 'Maximum 5 styles'),
  tone: z.enum(['professional','fun','relaxed','corporate','friendly','luxury']).optional(),
  brand: z.boolean().optional(),
  colorMode: z.enum(['light','dark','both']).optional(),
  inspo: z.array(z.string()).max(3, 'Maximum 3 inspiration links').optional(),

  features: z.string().optional(),
  ecommerce: z.boolean().optional(),
  auth: z.boolean().optional(),
  content: z.boolean().optional(),
  integrations: z.array(z.string()).optional(),

  contentStatus: z.enum(['have','need creation','mixed']).optional(),
  tagline: z.string().optional(),
  testimonials: z.boolean().optional(),
  motion: z.enum(['animated','subtle','static']).optional(),
  pages: z.array(z.string()).optional(),

  audience: z.string().optional(),
  demographics: z.string().optional(),
  problem: z.string().optional(),
  feeling: z.string().optional(),
  notes: z.string().optional()
};

export const StepLabels: Record<StepSlug, string> = {
  name: 'Name or Business',
  email: 'Contact Email',
  phone: 'Phone Number (optional)',
  site: 'Current Website or Domain (optional)',
  referral: 'How did you hear about us?',
  projectTypes: 'What type of project do you need?',
  goal: 'Main goal for this project',
  deadline: 'Desired completion date',
  budget: 'Approximate budget',
  comms: 'Preferred communication',
  style: 'Pick 3–5 style adjectives',
  tone: 'Select your tone',
  brand: 'Do you have a brand identity?',
  colorMode: 'Preferred color mode',
  inspo: '2–3 inspiration links',
  features: 'Key features or interactions',
  ecommerce: 'Need e‑commerce checkout?',
  auth: 'Should users have accounts/login?',
  content: 'Blog/notifications needed?',
  integrations: 'Connect to other tools?',
  contentStatus: 'Do you have copy/images?',
  tagline: 'Main tagline or message',
  testimonials: 'Show testimonials?',
  motion: 'Animated or static layout?',
  pages: 'Which pages do you want?',
  audience: 'Target audience',
  demographics: 'Typical demographic',
  problem: 'What problem are you solving?',
  feeling: 'What should visitors feel?',
  notes: 'Any final notes?'
};

export const StepDescriptions: Partial<Record<StepSlug, string>> = {
  name: 'Let us know who we\'re working with',
  email: 'We\'ll send updates and your project summary here',
  projectTypes: 'Select all that apply to your project',
  goal: 'Help us understand what you want to achieve',
  style: 'Choose words that describe your desired aesthetic',
  features: 'Tell us about any special functionality you need',
  notes: 'Anything else we should know?'
};

// Input type definitions for rendering
export type InputType = 'text' | 'email' | 'tel' | 'url' | 'select' | 'multiselect' | 'textarea' | 'date' | 'boolean';

export const StepInputTypes: Record<StepSlug, InputType> = {
  name: 'text',
  email: 'email',
  phone: 'tel',
  site: 'url',
  referral: 'select',
  projectTypes: 'multiselect',
  goal: 'textarea',
  deadline: 'date',
  budget: 'select',
  comms: 'select',
  style: 'multiselect',
  tone: 'select',
  brand: 'boolean',
  colorMode: 'select',
  inspo: 'multiselect',
  features: 'textarea',
  ecommerce: 'boolean',
  auth: 'boolean',
  content: 'boolean',
  integrations: 'multiselect',
  contentStatus: 'select',
  tagline: 'text',
  testimonials: 'boolean',
  motion: 'select',
  pages: 'multiselect',
  audience: 'text',
  demographics: 'text',
  problem: 'textarea',
  feeling: 'text',
  notes: 'textarea'
};

// Options for select/multiselect fields
export const StepOptions: Partial<Record<StepSlug, string[]>> = {
  referral: ['Google Search', 'Friend Referral', 'Social Media', 'Online Ad', 'Other'],
  projectTypes: ['Website', 'App', 'Maintenance', 'AI Integration', 'Branding', 'Other'],
  budget: ['<1k', '1–3k', '3–7k', '7k+'],
  comms: ['In-person', 'Call', 'Online'],
  style: ['modern', 'minimal', 'elegant', 'bold', 'playful', 'luxury', 'techy', 'earthy', 'professional', 'creative'],
  tone: ['professional', 'fun', 'relaxed', 'corporate', 'friendly', 'luxury'],
  colorMode: ['light', 'dark', 'both'],
  integrations: ['Google Analytics', 'Stripe', 'Zapier', 'Airtable', 'Shopify', 'Mailchimp', 'Other'],
  contentStatus: ['have', 'need creation', 'mixed'],
  motion: ['animated', 'subtle', 'static'],
  pages: ['Home', 'About', 'Services', 'Projects', 'Pricing', 'Contact', 'FAQ', 'Blog', 'Careers', 'Other']
};
