# TODO: Command Center & CEO Hub Fixes

## Priority Tasks

### 🔥 CRITICAL - Do These First

- [ ] **Add GitHub Token** (Fixes Git activity in both Command Center AND CEO Hub)
  - Go to: https://github.com/settings/tokens/new
  - Create token with scopes: `repo`, `user`, `read:org`
  - Add to `.env`:
    ```
    GITHUB_TOKEN=ghp_xxxxx
    GITHUB_USERNAME=SeanSpon
    ```
  - **Impact:** This will fix:
    - ✅ Command Center: Git Activity section
    - ✅ CEO Hub: Operations tab Git Dashboard
    - ✅ Git statistics across entire admin dashboard

- [ ] **Add Vercel Token** (Fixes deployment tracking)
  - Go to: https://vercel.com/account/tokens
  - Create token named "SeeZee Command Center"
  - Add to `.env`:
    ```
    VERCEL_TOKEN=xxxxx
    VERCEL_TEAM_ID=team_xxxxx  # Optional if using team
    ```
  - **Impact:** Shows live deployment status, recent deployments

### ⚠️ MEDIUM - Fix Email Accounts

Choose ONE option:

**Option A: Quick Fix (5 minutes)**
- [ ] Update hardcoded email accounts
  - File: `src/app/api/integrations/google/workspace/route.ts`
  - Function: `getManualEmailAccounts()`
  - Change domain from `seezeestudios.com` to YOUR domain
  - Update email addresses to YOUR actual Google Workspace accounts

**Option B: Full Integration (30-60 minutes)**
- [ ] Set up Google Workspace API
  - Create Service Account in Google Cloud Console
  - Enable Google Admin SDK API
  - Set up domain-wide delegation
  - Add environment variables (see guide)

### ✅ LOW - Verify Stripe Integration

- [ ] Check if Stripe MRR is pulling live data
  - Current showing: $27,067
  - Verify `STRIPE_SECRET_KEY` is set in `.env`
  - If missing, add from: https://dashboard.stripe.com/apikeys

---

## Testing Checklist

After adding environment variables:

### Command Center (`/admin/command-center`)

- [ ] Git Activity section shows your recent commits
- [ ] Git Activity shows correct username and avatar
- [ ] Repositories section populates with your repos
- [ ] Stats at top show correct numbers:
  - Commits Today
  - Open PRs
  - Open Issues
- [ ] Email Accounts shows correct email addresses
- [ ] Vercel Deployments section shows recent deploys
- [ ] MRR stat shows correct amount
- [ ] All "View All" links work correctly

### CEO Hub (`/admin/ceo`)

- [ ] Overview tab loads without errors
- [ ] Financials tab shows revenue/expenses
- [ ] Operations tab → Git Dashboard shows activity
- [ ] Analytics tab displays metrics
- [ ] Team tab shows team members
- [ ] Learning tab displays resources
- [ ] No console errors in browser (F12)

---

## Production Deployment Checklist

When deploying to Vercel:

- [ ] Add all environment variables to Vercel project settings
- [ ] Enable variables for all environments:
  - Production
  - Preview
  - Development
- [ ] Required variables for Command Center:
  ```
  GITHUB_TOKEN=ghp_xxxxx
  GITHUB_USERNAME=SeanSpon
  VERCEL_TOKEN=xxxxx
  VERCEL_TEAM_ID=team_xxxxx (if applicable)
  STRIPE_SECRET_KEY=sk_live_xxxxx
  ```
- [ ] Redeploy application
- [ ] Test Command Center in production
- [ ] Test CEO Hub in production

---

## File Reference

Files you may need to edit:

### Environment Variables
- `.env` - Your local environment
- `.env.example` - Template (already updated)

### Command Center
- `src/app/admin/command-center/page.tsx` - Command Center page
- `src/app/api/integrations/github/activity/route.ts` - Git API
- `src/app/api/integrations/vercel/deployments/route.ts` - Vercel API
- `src/app/api/integrations/google/workspace/route.ts` - Email accounts API
- `src/app/api/integrations/stripe/metrics/route.ts` - Stripe API

### CEO Hub
- `src/app/admin/ceo/page.tsx` - CEO Hub page
- `src/components/ceo/CEODashboardClient.tsx` - CEO Hub client
- `src/components/admin/git/GitDashboard.tsx` - Git dashboard component
- `src/lib/git/github-service.ts` - Shared GitHub service

---

## Quick Commands

```bash
# Copy environment template
cp .env.example .env

# Edit environment file (add your tokens)
code .env

# Restart dev server
npm run dev

# Test Command Center
# Visit: http://localhost:3000/admin/command-center

# Test CEO Hub
# Visit: http://localhost:3000/admin/ceo
```

---

## Common Issues & Solutions

### "No recent Git activity" even with token
- Check token has correct scopes: `repo`, `user`, `read:org`
- Verify token isn't expired
- Confirm `GITHUB_USERNAME` matches your GitHub username
- Restart dev server after adding token

### "No recent deployments" even with token
- Verify you have deployments in Vercel dashboard
- Check if you need `VERCEL_TEAM_ID` for team account
- Token might need higher permissions

### Email accounts not updating
- For manual config: Edit `getManualEmailAccounts()` function
- For full integration: Verify service account setup
- Check domain matches your actual domain

### MRR showing $0
- Verify `STRIPE_SECRET_KEY` is set
- Confirm you're using correct key (live vs test)
- Check you have active subscriptions in Stripe

---

## Time Estimates

| Task | Time | Priority |
|------|------|----------|
| GitHub Token | 5 min | 🔥 Critical |
| Vercel Token | 5 min | 🔥 Critical |
| Email Quick Fix | 5 min | ⚠️ Medium |
| Email Full Setup | 60 min | ⚠️ Medium |
| Verify Stripe | 2 min | ✅ Low |
| Testing | 10 min | Required |
| Production Deploy | 15 min | Required |

**Total (Quick Path): 25-30 minutes**
**Total (Full Setup): 85-95 minutes**

---

## Status Tracking

Mark your progress:

- Started: ____/____/____
- GitHub Token: [ ] Added [ ] Tested
- Vercel Token: [ ] Added [ ] Tested
- Email Accounts: [ ] Fixed [ ] Tested
- Stripe Verified: [ ] Done
- Command Center: [ ] Working
- CEO Hub: [ ] Working
- Production: [ ] Deployed
- Completed: ____/____/____

---

## Support

If you run into issues:

1. Check browser console (F12) for errors
2. Check server logs for API errors
3. Test API endpoints directly in browser:
   - `/api/integrations/github/activity`
   - `/api/integrations/vercel/deployments`
   - `/api/integrations/stripe/metrics`
   - `/api/integrations/google/workspace`
4. Verify environment variables are loaded (restart server)
5. Check token permissions and expiration

---

## Notes

- The Command Center is your centralized hub for ALL integrations
- The CEO Hub has tabs for different business areas (Overview, Financials, Operations, Analytics, Team, Learning)
- Both pages use the same GitHub integration, so one `GITHUB_TOKEN` fixes both
- All integrations work without tokens but with reduced functionality/mock data
- MRR shown is calculated from actual Stripe subscriptions
