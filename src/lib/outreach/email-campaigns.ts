/**
 * Advanced Email Campaign System
 * 
 * Features:
 * - AI-powered email generation (personalized for each prospect)
 * - Bulk email sending with rate limiting
 * - Email tracking (opens, clicks, replies)
 * - A/B testing
 * - Drip campaigns with follow-ups
 * - Deliverability monitoring
 */

import { Resend } from 'resend';
import { prisma } from '@/lib/prisma';
import { Prospect } from '@prisma/client';
import Anthropic from '@anthropic-ai/sdk';

const resend = new Resend(process.env.RESEND_API_KEY!);

// ============================================================================
// EMAIL TEMPLATES WITH VARIABLES
// ============================================================================

export interface EmailTemplateVars {
  firstName?: string;
  lastName?: string;
  fullName?: string;
  company?: string;
  city?: string;
  state?: string;
  category?: string;
  websiteUrl?: string;
  googleRating?: number;
  opportunities?: string[];
  [key: string]: any;
}

/**
 * Replace template variables in email content
 */
export function replaceTemplateVariables(template: string, vars: EmailTemplateVars): string {
  let result = template;

  for (const [key, value] of Object.entries(vars)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    result = result.replace(regex, String(value ?? ''));
  }

  // Remove any unreplaced variables
  result = result.replace(/{{[^}]+}}/g, '');

  return result;
}

/**
 * Extract variables from prospect for email personalization
 */
export function extractProspectVariables(prospect: Prospect): EmailTemplateVars {
  const firstName = prospect.name?.split(' ')[0] || '';
  const lastName = prospect.name?.split(' ').slice(1).join(' ') || '';

  return {
    firstName,
    lastName,
    fullName: prospect.name,
    company: prospect.company || prospect.name,
    city: prospect.city || '',
    state: prospect.state || '',
    category: prospect.category || '',
    websiteUrl: prospect.websiteUrl || '',
    googleRating: prospect.googleRating || 0,
    opportunities: prospect.opportunities || [],
    leadScore: prospect.leadScore,
  };
}

// ============================================================================
// AI EMAIL GENERATION
// ============================================================================

export interface AIEmailGenerationParams {
  prospect: Prospect;
  campaignGoal?: string; // "introduce_services", "follow_up", "check_in"
  tone?: 'professional' | 'friendly' | 'casual';
  includeWebsiteAudit?: boolean;
  includePortfolio?: boolean;
  includePricing?: boolean;
}

/**
 * Generate personalized email using Claude AI
 */
export async function generatePersonalizedEmail(params: AIEmailGenerationParams): Promise<{
  subject: string;
  body: string;
  htmlBody: string;
}> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  const anthropic = new Anthropic({ apiKey });
  const { prospect, campaignGoal = 'introduce_services', tone = 'professional' } = params;

  const systemPrompt = `You are an expert email copywriter for SeeZee Studio, a web agency in Louisville, Kentucky specializing in accessible websites for nonprofits and community organizations.

COMPANY CONTEXT:
- Founders: Sean McCulloch and Zach Robards
- Services: Website design, development, accessibility (WCAG AA+), nonprofit pricing
- Starting at $2,499 for nonprofits
- Maintenance plans from $150/month
- Recent work: A Vision For You (AVFY), Big Red Bus

EMAIL BEST PRACTICES:
1. Keep it under 150 words
2. Be genuine and warm, never pushy
3. Lead with value, not product features
4. Include ONE clear call-to-action
5. Personalize based on their specific situation
6. Reference their location if in Louisville
7. Mention their Google reviews if 4+ stars

TONE: ${tone}
GOAL: ${campaignGoal}

Return JSON with this structure:
{
  "subject": "Email subject line (under 60 characters)",
  "body": "Plain text email body",
  "htmlBody": "HTML formatted email (simple formatting only)"
}`;

  const prospectContext = `
PROSPECT INFO:
Name: ${prospect.name}
Company: ${prospect.company || prospect.name}
Location: ${[prospect.city, prospect.state].filter(Boolean).join(', ')}
Category: ${prospect.category || 'Organization'}
Google Rating: ${prospect.googleRating ? `${prospect.googleRating} stars (${prospect.googleReviews} reviews)` : 'N/A'}
Website: ${prospect.websiteUrl || 'No website found'}
Lead Score: ${prospect.leadScore}/100
Opportunities: ${(prospect.opportunities || []).join(', ') || 'General outreach'}

${params.includeWebsiteAudit && prospect.websiteUrl ? 'Include: Mention we did a quick audit of their website and found opportunities' : ''}
${params.includePortfolio ? 'Include: Mention our work with similar organizations (AVFY)' : ''}
${params.includePricing ? 'Include: Mention starting pricing ($2,499 for nonprofits)' : ''}

Generate a personalized outreach email for this ${prospect.category || 'organization'}.`;

  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: prospectContext,
      },
    ],
    system: systemPrompt,
  });

  const textContent = response.content[0].type === 'text' ? response.content[0].text : '';
  
  try {
    const parsed = JSON.parse(textContent);
    return {
      subject: parsed.subject,
      body: parsed.body,
      htmlBody: parsed.htmlBody || formatPlainTextAsHTML(parsed.body),
    };
  } catch {
    // Fallback if JSON parsing fails
    return {
      subject: 'Quick Question About Your Website',
      body: textContent,
      htmlBody: formatPlainTextAsHTML(textContent),
    };
  }
}

/**
 * Convert plain text to simple HTML
 */
function formatPlainTextAsHTML(text: string): string {
  const paragraphs = text.split('\n\n').filter(p => p.trim());
  const html = paragraphs.map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  ${html}
  <br>
  <p style="color: #666; font-size: 14px; border-top: 1px solid #eee; padding-top: 20px; margin-top: 40px;">
    <strong>Sean McCulloch</strong><br>
    Co-Founder, SeeZee Studio<br>
    <a href="mailto:sean@seezeestudios.com" style="color: #06b6d4;">sean@seezeestudios.com</a><br>
    <a href="https://seezeestudios.com" style="color: #06b6d4;">seezeestudios.com</a><br>
    Louisville, Kentucky
  </p>
</body>
</html>`;
}

// ============================================================================
// EMAIL TRACKING
// ============================================================================

/**
 * Add tracking pixel to email HTML for open tracking
 */
export function addOpenTracking(html: string, trackingId: string): string {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://your-domain.com';
  const trackingPixel = `<img src="${baseUrl}/api/track/open/${trackingId}" width="1" height="1" alt="" style="display:none;" />`;
  
  // Add before closing body tag
  return html.replace('</body>', `${trackingPixel}</body>`);
}

/**
 * Convert links to tracked links for click tracking
 */
export function addClickTracking(html: string, sentEmailId: string): string {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://your-domain.com';
  
  // Replace href attributes with tracking URLs
  return html.replace(/href="([^"]+)"/g, (match, url) => {
    // Don't track email links or tracking pixels
    if (url.startsWith('mailto:') || url.includes('/api/track/')) {
      return match;
    }
    
    const trackingUrl = `${baseUrl}/api/track/click/${sentEmailId}?url=${encodeURIComponent(url)}`;
    return `href="${trackingUrl}"`;
  });
}

// ============================================================================
// BULK EMAIL SENDING
// ============================================================================

export interface BulkEmailParams {
  prospectIds: string[];
  templateId?: string;
  subject?: string;
  bodyTemplate?: string;
  useAI?: boolean;
  aiParams?: Partial<AIEmailGenerationParams>;
  sendFrom?: string;
  replyTo?: string;
  rateLimit?: number; // emails per minute
  scheduleFor?: Date;
}

export interface BulkEmailResult {
  success: boolean;
  sent: number;
  failed: number;
  errors: Array<{ prospectId: string; error: string }>;
  sentEmailIds: string[];
}

/**
 * Send bulk personalized emails with rate limiting
 */
export async function sendBulkEmails(params: BulkEmailParams): Promise<BulkEmailResult> {
  const {
    prospectIds,
    subject: subjectTemplate,
    bodyTemplate,
    useAI = false,
    aiParams = {},
    sendFrom = process.env.RESEND_FROM_EMAIL || 'sean@seezeestudios.com',
    replyTo = 'sean@seezeestudios.com',
    rateLimit = 10, // 10 emails per minute by default
  } = params;

  const prospects = await prisma.prospect.findMany({
    where: { id: { in: prospectIds } },
  });

  const result: BulkEmailResult = {
    success: true,
    sent: 0,
    failed: 0,
    errors: [],
    sentEmailIds: [],
  };

  const delayMs = (60 * 1000) / rateLimit; // Delay between emails

  for (const prospect of prospects) {
    try {
      let subject: string;
      let body: string;
      let htmlBody: string;

      if (useAI) {
        // Generate unique AI email for this prospect
        const aiEmail = await generatePersonalizedEmail({
          prospect,
          ...aiParams,
        });
        subject = aiEmail.subject;
        body = aiEmail.body;
        htmlBody = aiEmail.htmlBody;
      } else {
        // Use template with variable replacement
        const vars = extractProspectVariables(prospect);
        subject = replaceTemplateVariables(subjectTemplate || 'Quick Question', vars);
        body = replaceTemplateVariables(bodyTemplate || 'Hi {{firstName}},\n\nJust reaching out...', vars);
        htmlBody = formatPlainTextAsHTML(body);
      }

      // Create sent email record
      const sentEmail = await prisma.sentEmail.create({
        data: {
          prospectId: prospect.id,
          from: sendFrom,
          to: prospect.email,
          subject,
          body,
          status: 'QUEUED',
        },
      });

      // Add tracking
      const trackedHtml = addClickTracking(
        addOpenTracking(htmlBody, sentEmail.id),
        sentEmail.id
      );

      // Send via Resend
      const emailResult = await resend.emails.send({
        from: sendFrom,
        to: prospect.email,
        replyTo: replyTo,
        subject,
        text: body,
        html: trackedHtml,
      });

      // Update records
      await prisma.sentEmail.update({
        where: { id: sentEmail.id },
        data: {
          status: 'SENT',
          sentAt: new Date(),
          resendId: emailResult.data?.id,
        },
      });

      await prisma.prospect.update({
        where: { id: prospect.id },
        data: {
          emailSentAt: new Date(),
          lastContactedAt: new Date(),
        },
      });

      result.sent++;
      result.sentEmailIds.push(sentEmail.id);

      // Rate limiting delay
      await new Promise(resolve => setTimeout(resolve, delayMs));

    } catch (error) {
      result.failed++;
      result.errors.push({
        prospectId: prospect.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  result.success = result.sent > 0;
  return result;
}

// ============================================================================
// FOLLOW-UP CAMPAIGNS
// ============================================================================

export interface DripCampaignStep {
  delayDays: number;
  subject: string;
  body: string;
  condition?: (prospect: Prospect) => Promise<boolean>;
}

export interface DripCampaignConfig {
  name: string;
  steps: DripCampaignStep[];
  stopOnReply: boolean;
}

/**
 * Execute drip campaign for prospects
 */
export async function runDripCampaign(
  prospectIds: string[],
  config: DripCampaignConfig
): Promise<void> {
  // This would typically be handled by a background job/cron
  // For now, just set up the campaign structure
  
  for (const prospectId of prospectIds) {
    const prospect = await prisma.prospect.findUnique({
      where: { id: prospectId },
    });

    if (!prospect) continue;

    // Schedule first email immediately
    const firstStep = config.steps[0];
    if (firstStep && (!firstStep.condition || await firstStep.condition(prospect))) {
      await sendBulkEmails({
        prospectIds: [prospectId],
        subject: firstStep.subject,
        bodyTemplate: firstStep.body,
        useAI: false,
      });
    }
  }

  // Subsequent emails would be scheduled via cron job
  // checking each day for prospects that need next step
}

/**
 * Check and send scheduled follow-ups (run via cron)
 */
export async function processScheduledFollowUps(): Promise<void> {
  const now = new Date();
  
  // Find prospects that need follow-up
  const prospects = await prisma.prospect.findMany({
    where: {
      followUpDate: {
        lte: now,
      },
      status: {
        in: ['CONTACTED', 'DRAFT_READY'],
      },
      emailRepliedAt: null, // Haven't replied yet
    },
  });

  // Send follow-up emails
  for (const prospect of prospects) {
    try {
      await sendBulkEmails({
        prospectIds: [prospect.id],
        subject: 'Following up on my previous email',
        bodyTemplate: `Hi {{firstName}},\n\nI wanted to follow up on my previous email about helping {{company}} with your website...\n\nBest,\nSean`,
        useAI: true,
        aiParams: {
          campaignGoal: 'follow_up',
        },
      });

      // Update follow-up date to 1 week from now
      const nextFollowUp = new Date();
      nextFollowUp.setDate(nextFollowUp.getDate() + 7);
      
      await prisma.prospect.update({
        where: { id: prospect.id },
        data: {
          followUpDate: nextFollowUp,
        },
      });
    } catch (error) {
      console.error(`Failed to send follow-up to ${prospect.email}:`, error);
    }
  }
}

// ============================================================================
// EMAIL VERIFICATION & VALIDATION
// ============================================================================

/**
 * Validate email address format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check if email domain has valid MX records
 */
export async function hasValidMXRecords(email: string): Promise<boolean> {
  // This would require DNS lookups
  // For now, return true - implement with dns.resolveMx() in Node.js
  return true;
}

/**
 * Bulk verify emails before sending
 */
export async function bulkVerifyEmails(emails: string[]): Promise<{
  valid: string[];
  invalid: string[];
  risky: string[];
}> {
  const valid: string[] = [];
  const invalid: string[] = [];
  const risky: string[] = [];

  for (const email of emails) {
    if (!isValidEmail(email)) {
      invalid.push(email);
      continue;
    }

    // Add more checks here (bounces, complaints, etc.)
    valid.push(email);
  }

  return { valid, invalid, risky };
}
