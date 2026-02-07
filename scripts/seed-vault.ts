/**
 * Seed CEO Vault - Add all API keys and secrets from environment
 * Run with: npx tsx scripts/seed-vault.ts
 */

import { PrismaClient, VaultScope } from '@prisma/client';
import crypto from 'crypto';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env.local first (production keys), then .env as fallback
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config(); // Fallback to .env for any missing vars

const prisma = new PrismaClient();

const VAULT_KEY = process.env.VAULT_ENCRYPTION_KEY || process.env.AUTH_SECRET || "";
const ALGORITHM = "aes-256-cbc";

function encrypt(text: string): string {
  const key = crypto.scryptSync(VAULT_KEY, "salt", 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

function getLastFour(value: string): string {
  if (value.length <= 4) return "****";
  return "…" + value.slice(-4);
}

interface VaultEntryData {
  key: string;
  value: string;
  scope: VaultScope;
  scopeRef?: string | null;
  notes: string;
}

const secrets: VaultEntryData[] = [
  // Authentication & Core
  {
    key: 'AUTH_SECRET',
    value: process.env.AUTH_SECRET || '',
    scope: 'GLOBAL' as VaultScope,
    notes: 'NextAuth v5 authentication secret (primary) - 64 char hex string',
  },
  {
    key: 'NEXTAUTH_SECRET',
    value: process.env.NEXTAUTH_SECRET || '',
    scope: 'GLOBAL' as VaultScope,
    notes: 'NextAuth JWT signing secret (legacy naming)',
  },

  // App URLs
  {
    key: 'NEXT_PUBLIC_APP_URL',
    value: process.env.NEXT_PUBLIC_APP_URL || '',
    scope: 'GLOBAL' as VaultScope,
    notes: 'Public-facing application URL',
  },
  {
    key: 'NEXTAUTH_URL',
    value: process.env.NEXTAUTH_URL || '',
    scope: 'GLOBAL' as VaultScope,
    notes: 'NextAuth callback URL (legacy)',
  },
  {
    key: 'AUTH_URL',
    value: process.env.AUTH_URL || '',
    scope: 'GLOBAL' as VaultScope,
    notes: 'NextAuth v5 callback URL',
  },

  // Google OAuth
  {
    key: 'AUTH_GOOGLE_ID',
    value: process.env.AUTH_GOOGLE_ID || '',
    scope: 'GLOBAL' as VaultScope,
    notes: 'Google OAuth 2.0 Client ID for authentication',
  },
  {
    key: 'AUTH_GOOGLE_SECRET',
    value: process.env.AUTH_GOOGLE_SECRET || '',
    scope: 'GLOBAL' as VaultScope,
    notes: 'Google OAuth 2.0 Client Secret',
  },
  {
    key: 'GOOGLE_CLIENT_SECRET',
    value: process.env.GOOGLE_CLIENT_SECRET || '',
    scope: 'GLOBAL' as VaultScope,
    notes: 'Google OAuth 2.0 Client Secret (alt naming)',
  },

  // Database
  {
    key: 'DATABASE_URL',
    value: process.env.DATABASE_URL || '',
    scope: 'GLOBAL' as VaultScope,
    notes: 'Neon PostgreSQL connection string (pooler)',
  },

  // Stripe Payment Processing (LIVE MODE)
  {
    key: 'STRIPE_SECRET_KEY',
    value: process.env.STRIPE_SECRET_KEY || '',
    scope: 'GLOBAL' as VaultScope,
    notes: '⚠️ LIVE MODE - Stripe API secret key for server-side operations',
  },
  {
    key: 'STRIPE_PUBLISHABLE_KEY',
    value: process.env.STRIPE_PUBLISHABLE_KEY || '',
    scope: 'GLOBAL' as VaultScope,
    notes: '⚠️ LIVE MODE - Stripe API publishable key for client-side',
  },
  {
    key: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    value: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
    scope: 'GLOBAL' as VaultScope,
    notes: '⚠️ LIVE MODE - Stripe publishable key (public env var)',
  },
  {
    key: 'STRIPE_WEBHOOK_SECRET',
    value: process.env.STRIPE_WEBHOOK_SECRET || '',
    scope: 'GLOBAL' as VaultScope,
    notes: 'Stripe webhook endpoint secret for signature verification',
  },

  // Email Service (Resend)
  {
    key: 'RESEND_API_KEY',
    value: process.env.RESEND_API_KEY || '',
    scope: 'GLOBAL' as VaultScope,
    notes: 'Resend API key for transactional email delivery',
  },
  {
    key: 'EMAIL_FROM',
    value: process.env.EMAIL_FROM || '',
    scope: 'GLOBAL' as VaultScope,
    notes: 'Default "From" email address for outgoing emails',
  },

  // AI Services
  {
    key: 'OPENAI_API_KEY',
    value: process.env.OPENAI_API_KEY || '',
    scope: 'GLOBAL' as VaultScope,
    notes: 'OpenAI API key for GPT models (gpt-4o-mini default)',
  },
  {
    key: 'AI_MODEL',
    value: process.env.AI_MODEL || '',
    scope: 'GLOBAL' as VaultScope,
    notes: 'Default AI model identifier (gpt-4o-mini)',
  },
  {
    key: 'ANTHROPIC_API_KEY',
    value: process.env.ANTHROPIC_API_KEY || '',
    scope: 'GLOBAL' as VaultScope,
    notes: 'Anthropic Claude API key for AI assistance',
  },

  // Google Services
  {
    key: 'GOOGLE_MAPS_API_KEY',
    value: process.env.GOOGLE_MAPS_API_KEY || '',
    scope: 'GLOBAL' as VaultScope,
    notes: 'Google Maps API key for geocoding and mapping features',
  },
  {
    key: 'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY',
    value: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    scope: 'GLOBAL' as VaultScope,
    notes: 'Google Maps API key (client-side public env var)',
  },
  {
    key: 'RECAPTCHA_SECRET_KEY',
    value: process.env.RECAPTCHA_SECRET_KEY || '',
    scope: 'GLOBAL' as VaultScope,
    notes: 'Google reCAPTCHA v3 secret key for form protection',
  },
  {
    key: 'NEXT_PUBLIC_RECAPTCHA_SITE_KEY',
    value: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '',
    scope: 'GLOBAL' as VaultScope,
    notes: 'Google reCAPTCHA v3 site key (client-side)',
  },

  // GitHub Integration
  {
    key: 'GITHUB_TOKEN',
    value: process.env.GITHUB_TOKEN || '',
    scope: 'GLOBAL' as VaultScope,
    notes: 'GitHub Personal Access Token (PAT) for API access and automation',
  },
  {
    key: 'GITHUB_REPO_FALLBACK',
    value: process.env.GITHUB_REPO_FALLBACK || '',
    scope: 'GLOBAL' as VaultScope,
    notes: 'Default GitHub repository (format: owner/repo)',
  },

  // Vercel Integration
  {
    key: 'VERCEL_TOKEN',
    value: process.env.VERCEL_TOKEN || '',
    scope: 'GLOBAL' as VaultScope,
    notes: 'Vercel API access token for deployment management',
  },
  {
    key: 'VERCEL_WEBHOOK_SECRET',
    value: process.env.VERCEL_WEBHOOK_SECRET || '',
    scope: 'GLOBAL' as VaultScope,
    notes: 'Vercel webhook secret for deployment notifications',
  },

  // Security & Automation
  {
    key: 'CRON_SECRET',
    value: process.env.CRON_SECRET || '',
    scope: 'GLOBAL' as VaultScope,
    notes: 'Secret token for securing cron job endpoints',
  },

  // AI Nodes (optional - generated by seed:node script)
  {
    key: 'NODE_ID',
    value: process.env.NODE_ID || '',
    scope: 'GLOBAL' as VaultScope,
    notes: 'AI workflow node identifier (optional)',
  },
  {
    key: 'NODE_API_KEY',
    value: process.env.NODE_API_KEY || '',
    scope: 'GLOBAL' as VaultScope,
    notes: 'AI workflow node API key (optional)',
  },
];

async function main() {
  console.log('🔐 Seeding CEO Vault with API Keys...\n');

  // Find the CEO user to set as creator
  const ceoUser = await prisma.user.findFirst({
    where: {
      OR: [
        { role: 'CEO' },
        { email: { in: ['seanspm1007@gmail.com', 'sean@seezee.studio', 'contact@seezeestudios.com'] } }
      ]
    },
  });

  if (!ceoUser) {
    console.error('❌ No CEO user found. Please create a CEO user first.');
    console.log('   Run: npx tsx scripts/setup-my-account.ts');
    return;
  }

  console.log(`✓ Using ${ceoUser.name || ceoUser.email} as vault creator\n`);

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const entry of secrets) {
    try {
      // Skip if no value provided
      if (!entry.value || entry.value.trim() === '') {
        console.log(`⏭️  Skipped: ${entry.key} (no value in environment)`);
        skipped++;
        continue;
      }

      // Check if entry already exists
      const existing = await prisma.vaultEntry.findFirst({
        where: {
          key: entry.key,
          scope: entry.scope,
          scopeRef: entry.scopeRef || null,
        },
      });

      if (existing) {
        // Update existing entry
        await prisma.vaultEntry.update({
          where: { id: existing.id },
          data: {
            encryptedValue: encrypt(entry.value),
            lastFour: getLastFour(entry.value),
            notes: entry.notes,
            updatedAt: new Date(),
          },
        });
        console.log(`🔄 Updated: ${entry.key} (${getLastFour(entry.value)})`);
        updated++;
      } else {
        // Create new entry
        await prisma.vaultEntry.create({
          data: {
            key: entry.key,
            encryptedValue: encrypt(entry.value),
            lastFour: getLastFour(entry.value),
            scope: entry.scope,
            scopeRef: entry.scopeRef || null,
            notes: entry.notes,
            createdById: ceoUser.id,
          },
        });
        console.log(`✅ Created: ${entry.key} (${getLastFour(entry.value)})`);
        created++;
      }
    } catch (error) {
      console.error(`❌ Error processing ${entry.key}:`, error instanceof Error ? error.message : error);
    }
  }

  console.log('\n' + '═'.repeat(60));
  console.log(`✅ Vault seeding complete!`);
  console.log(`   Created: ${created}`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Skipped: ${skipped}`);
  console.log('═'.repeat(60));
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
