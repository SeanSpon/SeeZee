# Production Environment Variables Guide

## Required for Production Deployment

### Authentication (CRITICAL)
```bash
# Base URL - MUST be your production domain
AUTH_URL=https://see-zee.com
NEXTAUTH_URL=https://see-zee.com

# Auth Secret - Generate with: openssl rand -base64 32
AUTH_SECRET=<64-char-random-string>

# Google OAuth (Production Client)
GOOGLE_CLIENT_ID=<your-prod-google-client-id>
GOOGLE_CLIENT_SECRET=<GOCSPX-format-secret-35-chars>
```

### Database
```bash
# Production PostgreSQL with connection pooling
DATABASE_URL=postgresql://user:password@host:5432/db?pgbouncer=true
```

### Stripe Payments
```bash
# Stripe Production Keys
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Maintenance Plan Price IDs (from Stripe Dashboard)
STRIPE_PRICE_ID_TIER_1_MONTHLY=price_...
STRIPE_PRICE_ID_TIER_1_ANNUAL=price_...
STRIPE_PRICE_ID_TIER_2_MONTHLY=price_...
STRIPE_PRICE_ID_TIER_2_ANNUAL=price_...
STRIPE_PRICE_ID_TIER_3_MONTHLY=price_...
STRIPE_PRICE_ID_TIER_3_ANNUAL=price_...
```

### Email (Resend)
```bash
RESEND_API_KEY=re_...
FROM_EMAIL=hello@see-zee.com
```

### File Uploads
```bash
UPLOADTHING_SECRET=sk_live_...
UPLOADTHING_APP_ID=...
```

### Vercel KV (Rate Limiting) - Auto-configured on Vercel Pro
```bash
# These are automatically set by Vercel when you add KV storage
KV_URL=...
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
KV_REST_API_READ_ONLY_TOKEN=...
```

### Optional Integrations
```bash
# AI Services
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...

# Google Maps
GOOGLE_MAPS_API_KEY=AIza...

# reCAPTCHA v3
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=...
RECAPTCHA_SECRET_KEY=...

# GitHub (for commit feed)
GITHUB_TOKEN=ghp_...
```

## Vercel Setup Steps

### 1. Set Environment Variables
Go to Vercel Project Settings → Environment Variables and add all required vars above.

**IMPORTANT:** Set variables for:
- ✅ Production
- ✅ Preview (use test/staging values)
- ❌ Development (use .env.local file instead)

### 2. Enable Vercel KV
1. Go to Vercel Dashboard → Storage
2. Click "Create Database" → KV
3. Name it "seezee-ratelimit-kv"
4. Connect to your project
5. Vercel automatically injects KV environment variables

### 3. Google OAuth Production Client
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create new OAuth 2.0 Client ID (type: Web application)
3. Authorized redirect URIs:
   - `https://see-zee.com/api/auth/callback/google`
   - `https://www.see-zee.com/api/auth/callback/google`
4. Authorized JavaScript origins:
   - `https://see-zee.com`
   - `https://www.see-zee.com`
5. Copy Client ID and Client Secret to Vercel

### 4. Stripe Production Setup
1. Switch to Live mode in Stripe Dashboard
2. Get API Keys from Developers → API keys
3. Create webhook endpoint:
   - URL: `https://see-zee.com/api/webhooks/stripe`
   - Events: `checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`
5. Create Price IDs for maintenance plans (Products → Create product)

### 5. Domain Configuration
1. Add custom domain in Vercel: `see-zee.com`
2. Configure DNS records as shown by Vercel
3. Ensure `www.see-zee.com` redirects to apex (configured in next.config.js)

### 6. Database Migrations
Run migrations before first deployment:
```bash
npx prisma migrate deploy
```

Or add to Vercel build command:
```bash
npx prisma migrate deploy && next build
```

## Pre-Deployment Checklist

- [ ] All required environment variables set in Vercel
- [ ] Vercel KV database created and connected
- [ ] Google OAuth production client created with correct redirect URIs
- [ ] Stripe production webhook registered at `/api/webhooks/stripe`
- [ ] Stripe price IDs created and added to env vars
- [ ] Professional email address configured (hello@see-zee.com)
- [ ] Database migrations deployed to production database
- [ ] Custom domain configured and DNS propagated
- [ ] Test build passes locally: `npm run build`
- [ ] All telemetry/debug code removed (100 fetch calls removed ✅)
- [ ] CSP headers configured in next.config.js ✅
- [ ] Rate limiting using Vercel KV ✅

## Verification After Deployment

1. **Auth Flow**: Test Google OAuth login
2. **Client Portal**: Verify hours tracking displays correctly
3. **Stripe Checkout**: Test maintenance plan subscription
4. **Email**: Confirm invoice receipts send
5. **API Routes**: Check /api/health or similar
6. **Rate Limiting**: Test with multiple requests
7. **Error Monitoring**: Check Vercel logs for errors

## Rollback Procedure

If deployment fails:
```bash
# Via Vercel CLI
vercel rollback

# Or via Vercel Dashboard:
# Deployments → [Previous deployment] → "Promote to Production"
```

## Environment Variable Verification

Test that all required vars are set:
```bash
# In Vercel CLI
vercel env pull .env.production
cat .env.production | grep -E "AUTH_SECRET|DATABASE_URL|STRIPE_SECRET_KEY|RESEND_API_KEY"
```

## Security Notes

- ✅ Never commit `.env.local` or `.env.production` to git
- ✅ Use different Stripe/Google OAuth clients for dev vs production
- ✅ Rotate `AUTH_SECRET` if ever exposed
- ✅ Enable Stripe webhook signature verification
- ✅ Use connection pooling for DATABASE_URL in serverless
- ✅ Set up Vercel log drains for monitoring
