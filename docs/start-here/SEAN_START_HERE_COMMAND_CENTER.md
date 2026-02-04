# 🚀 Command Center Fix - Start Here

## What's Wrong?

Your Command Center page (`/admin/command-center`) has 4 issues:

1. **Git Activity** - Shows "No recent Git activity" 
2. **Email Accounts** - Shows wrong emails (`seezeestudios.com` instead of your real ones)
3. **Vercel Deployments** - Shows "No recent deployments"
4. **Stripe MRR** - Might not be pulling live data

## Quick Fix (15 minutes)

### Step 1: Get GitHub Token (5 min)

1. Go to: https://github.com/settings/tokens/new
2. Name it: "SeeZee Command Center"
3. Select scopes:
   - [x] repo
   - [x] user
   - [x] read:org
4. Click "Generate token"
5. Copy the token (starts with `ghp_`)

### Step 2: Get Vercel Token (3 min)

1. Go to: https://vercel.com/account/tokens
2. Click "Create Token"
3. Name it: "SeeZee Command Center"
4. Copy the token

**Note:** Your Vercel workspace is `zach-robards-projects` - the token will work for this workspace.

### Step 3: Add to Environment Variables (2 min)

Open your `.env` file and add:

```bash
# GitHub Integration
GITHUB_TOKEN=ghp_your_token_here
GITHUB_USERNAME=SeanSpon

# Vercel Integration
VERCEL_TOKEN=your_vercel_token_here
# VERCEL_TEAM_ID=team_xxxxx  # Only if using team account

# Stripe (you probably already have this)
STRIPE_SECRET_KEY=sk_live_your_key_here
```

### Step 4: Fix Email Accounts (5 min)

**Quick Option:** Update the hardcoded list

1. Open `src/app/api/integrations/google/workspace/route.ts`
2. Find line 33, change the domain:
   ```typescript
   const domain = process.env.GOOGLE_WORKSPACE_DOMAIN || "yourdomain.com";
   ```
3. Update the email addresses in the `getManualEmailAccounts()` function (lines 85-141) to match YOUR actual Google Workspace accounts

### Step 5: Restart and Test (2 min)

```bash
# Stop your dev server (Ctrl+C)
npm run dev

# Visit these URLs:
# http://localhost:3000/admin/command-center
# http://localhost:3000/admin/ceo
```

## What Gets Fixed?

✅ **Command Center:**
- Git Activity shows your real commits
- Repositories list populated
- Stats show correct numbers (commits, PRs, issues)
- Email accounts show correct addresses
- Vercel deployments populate
- MRR shows live Stripe data

✅ **CEO Hub (Bonus):**
- Operations tab Git Dashboard works
- All tabs show accurate data
- No errors in console

## Detailed Guides

I've created 3 documents for you:

1. **`COMMAND_CENTER_FIX_GUIDE.md`** - Complete step-by-step guide with screenshots
2. **`TODO_COMMAND_CENTER_FIXES.md`** - Checklist to track your progress
3. **`.env.example`** - Updated with all required variables

## Production Deployment

When you're ready to deploy:

1. Go to Vercel project settings → Environment Variables
2. Add the same variables you added to `.env`
3. Make sure to enable for: Production, Preview, and Development
4. Redeploy your app

## Testing Checklist

After making changes:

- [ ] Command Center loads without errors
- [ ] Git Activity shows your commits
- [ ] Email accounts show correct addresses
- [ ] Vercel deployments show up
- [ ] MRR shows correct amount
- [ ] CEO Hub → Operations tab shows Git dashboard
- [ ] No errors in browser console (F12)

## Support

If something doesn't work:

1. Check browser console (F12) → Any red errors?
2. Did you restart the dev server?
3. Are the tokens correct? (no extra spaces)
4. Test API endpoints directly:
   - http://localhost:3000/api/integrations/github/activity
   - http://localhost:3000/api/integrations/vercel/deployments

## Time Required

- Basic fixes: **15 minutes**
- Testing: **5 minutes**
- Production deploy: **10 minutes**
- **Total: ~30 minutes**

## Start Now

1. Open `COMMAND_CENTER_FIX_GUIDE.md` for detailed instructions
2. Open `TODO_COMMAND_CENTER_FIXES.md` to track your progress
3. Make the changes
4. Test everything
5. Deploy to production

---

**You've got this! 🎯**

The Command Center is your most important admin page - it's worth getting it right.
