# Command Center Fix Guide

## Overview
This guide will help you fix all the broken integrations on your Command Center page at `/admin/command-center`.

## Current Issues

### 1. ❌ Git Activity - Not Working
**Problem:** Showing "No recent Git activity"
**Cause:** Missing `GITHUB_TOKEN` environment variable

**Fix:**
1. Go to GitHub: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a name like "SeeZee Command Center"
4. Select scopes: `repo`, `user`, `read:org`
5. Generate token and copy it
6. Add to your `.env`:
   ```
   GITHUB_TOKEN=ghp_your_token_here
   GITHUB_USERNAME=SeanSpon
   ```
7. Restart your dev server

---

### 2. ❌ Email Accounts - Wrong Emails
**Problem:** Showing hardcoded `seezeestudios.com` emails instead of your real Google Workspace accounts
**Cause:** The API route is returning manual/mock data

**Option A: Quick Fix (Manual Configuration)**
1. Open `src/app/api/integrations/google/workspace/route.ts`
2. Update the `getManualEmailAccounts()` function with YOUR actual email addresses
3. Change the domain on line 33 from `seezeestudios.com` to your actual domain

**Option B: Full Google Workspace Integration (Recommended)**
1. Go to Google Cloud Console: https://console.cloud.google.com
2. Create a Service Account with domain-wide delegation
3. Enable Google Admin SDK API
4. Download service account JSON key
5. Add to `.env`:
   ```
   GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
   GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   GOOGLE_ADMIN_EMAIL=sean@yourdomain.com
   GOOGLE_WORKSPACE_DOMAIN=yourdomain.com
   ```

---

### 3. ❌ Vercel Deployments - Not Connected
**Problem:** Showing "No recent deployments"
**Cause:** Missing `VERCEL_TOKEN`

**Fix:**
1. Go to Vercel: https://vercel.com/account/tokens
2. Click "Create Token"
3. Name it "SeeZee Command Center"
4. Copy the token
5. Add to your `.env`:
   ```
   VERCEL_TOKEN=your_vercel_token_here
   VERCEL_TEAM_ID=team_xxxxx  # Optional, only if using team account
   ```
6. Restart your dev server

**How to find your Team ID:**
- Go to https://vercel.com/zach-robards-projects/~/settings
- Click Settings → General
- Look for "Team ID" or check the URL structure 

---

### 4. ⚠️ Stripe MRR - May Need Update
**Problem:** MRR showing $27,067 but may not be pulling live data
**Cause:** `STRIPE_SECRET_KEY` may not be set

**Fix:**
1. Go to Stripe Dashboard: https://dashboard.stripe.com/apikeys
2. Copy your "Secret key" (starts with `sk_live_` or `sk_test_`)
3. Add to your `.env`:
   ```
   STRIPE_SECRET_KEY=sk_live_your_key_here
   ```
4. Restart your dev server

---

## Environment Variables Checklist

Add these to your `.env` file:

```bash
# ===== COMMAND CENTER INTEGRATIONS =====

# GitHub Integration
GITHUB_TOKEN=ghp_your_github_token_here
GITHUB_USERNAME=SeanSpon

# Vercel Integration
VERCEL_TOKEN=your_vercel_token_here
VERCEL_TEAM_ID=team_xxxxx  # Optional

# Stripe Integration (you likely already have this)
STRIPE_SECRET_KEY=sk_live_your_key_here

# Google Workspace (Optional - for full integration)
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=
GOOGLE_ADMIN_EMAIL=sean@yourdomain.com
GOOGLE_WORKSPACE_DOMAIN=yourdomain.com
```

---

## CEO Hub (/admin/ceo) Additional Checks

The CEO Hub is your most important page. Here are critical items to verify:

### Page Route
- Located at: `/admin/ceo`
- Component: `src/app/admin/ceo/page.tsx`
- Client component: `src/components/ceo/CEODashboardClient.tsx`

### What It Does
1. **Overview Tab** - Executive summary with revenue, projects, alerts
2. **Financials Tab** - Revenue, expenses, profit & loss
3. **Operations Tab** - Projects, tasks, team workload, Git activity
4. **Analytics Tab** - Conversion rates, trends, performance metrics
5. **Team Tab** - Team management and assignment
6. **Learning Tab** - Resources and tools for team

### Dependencies
The CEO Hub relies on:
- ✅ Database queries (should work)
- ✅ Finance calculations (should work)
- ⚠️ Git Dashboard component (needs `GITHUB_TOKEN`)
- ✅ Task management (should work)
- ✅ Invoice tracking (should work)

---

## Quick Setup Script

Run these commands in order:

```bash
# 1. Copy environment template
cp .env.example .env.local

# 2. Open in editor
code .env.local

# 3. Add your tokens (see sections above)

# 4. Restart dev server
npm run dev

# 5. Test Command Center
# Visit: http://localhost:3000/admin/command-center
```

---

## Verification Steps

After adding environment variables:

1. **Git Activity**
   - Should show your recent commits, PRs, and repos
   - Shows your GitHub username and avatar
   - "View All" link should work

2. **Email Accounts**  
   - Should show your actual email addresses
   - Primary email should be highlighted with star
   - Click email to open Gmail

3. **Vercel Deployments**
   - Should show recent deployments
   - Deployment status badges (Ready, Building, etc.)
   - Links to live deployments should work

4. **Stats at Top**
   - Commits Today: Should show actual count
   - Open PRs: Should show actual count
   - Deployments: Should show actual count
   - MRR: Should show actual Stripe revenue

---

## Production Deployment

When deploying to Vercel:

1. Go to your Vercel project settings
2. Navigate to Environment Variables
3. Add ALL the variables from your `.env` file
4. Make sure to add them for:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. Redeploy your application

---

## Troubleshooting

### "No recent Git activity" after adding token
- Check token has correct scopes: `repo`, `user`, `read:org`
- Verify token isn't expired
- Make sure `GITHUB_USERNAME` matches your GitHub username
- Check browser console for errors

### "No recent deployments" after adding Vercel token
- Verify token isn't expired
- Check if you need `VERCEL_TEAM_ID` (if using team account)
- Confirm you have deployments in Vercel dashboard

### Email accounts not updating
- If using manual config: Edit `src/app/api/integrations/google/workspace/route.ts`
- If using Google Admin SDK: Verify service account has domain-wide delegation
- Check service account has correct API scopes

### MRR showing $0
- Verify `STRIPE_SECRET_KEY` is correct
- Make sure you're using the right key (live vs test mode)
- Check you have active subscriptions in Stripe

---

## Need Help?

1. Check browser console (F12) for errors
2. Check server logs for API errors
3. Test API endpoints directly:
   - `http://localhost:3000/api/integrations/github/activity`
   - `http://localhost:3000/api/integrations/vercel/deployments`
   - `http://localhost:3000/api/integrations/stripe/metrics`
   - `http://localhost:3000/api/integrations/google/workspace`

---

## Summary

**Priority Order:**
1. 🔥 **High:** Add `GITHUB_TOKEN` (for Git activity across both Command Center and CEO Hub)
2. 🔥 **High:** Add `VERCEL_TOKEN` (for deployment tracking)
3. ⚠️ **Medium:** Fix email accounts (either manual update or full Google Workspace setup)
4. ✅ **Low:** Verify Stripe MRR is pulling live data

**Time Estimate:**
- GitHub + Vercel tokens: ~10 minutes
- Manual email fix: ~5 minutes
- Full Google Workspace: ~30-60 minutes
- Testing: ~10 minutes

**Total: 25-85 minutes depending on which options you choose**
