# 🎯 Vercel Webhook Integration Setup

## What This Does

Instead of **polling** Vercel's API every time you refresh the Command Center, webhooks push deployment updates to your app in **real-time**. This means:

✅ **Instant updates** when deployments start, succeed, or fail  
✅ **No API rate limits** - Vercel pushes to you  
✅ **Better performance** - Data stored in your database  
✅ **Historical data** - Keep track of all deployments  
✅ **Live badge** on Command Center showing "LIVE" status  

---

## Quick Setup (10 minutes)

### Step 1: Run Database Migration (2 min)

The `VercelDeployment` model has been added to your schema. Run the migration:

```bash
npx prisma migrate dev --name add_vercel_deployments
```

Or if you're in production:

```bash
npx prisma db push
```

This creates the `vercel_deployments` table in your database.

---

### Step 2: Add Webhook Secret to Environment (2 min)

1. Open your `.env` file
2. Add this line (generate a random secret):

```bash
# Vercel Webhook Secret (for signature verification)
VERCEL_WEBHOOK_SECRET=your_random_secret_here_min_32_chars
```

**Generate a secure secret:**

```bash
# PowerShell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})

# Or use this online: https://randomkeygen.com/
```

3. Copy the same secret - you'll need it for Vercel

---

### Step 3: Configure Vercel Webhook (5 min)

#### 3.1 Get Your Webhook URL

Your webhook endpoint is:

```
https://your-domain.com/api/webhooks/vercel
```

**For development (ngrok required):**
```bash
# Install ngrok: https://ngrok.com/download
ngrok http 3000

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
# Your webhook URL: https://abc123.ngrok.io/api/webhooks/vercel
```

**For production:**
```
https://seezee.vercel.app/api/webhooks/vercel
```

#### 3.2 Add Webhook in Vercel Dashboard

1. Go to: https://vercel.com/zach-robards-projects/settings/webhooks
2. Click **"Add Webhook"**
3. Configure the webhook:

**Endpoint URL:**
```
https://your-domain.com/api/webhooks/vercel
```

**Projects:**
- Select "All Projects" (recommended)
- OR select specific projects you want to track

**Events** (check these):
- ✅ `deployment.created`
- ✅ `deployment.succeeded`
- ✅ `deployment.error`
- ✅ `deployment.canceled`
- ✅ `deployment.checkrun.start`
- ✅ `deployment.checkrun.cancel`

**Secret:**
- Paste the same secret from your `.env` file

4. Click **"Create Webhook"**

---

### Step 4: Test the Webhook (1 min)

#### Option A: Test with a Real Deployment

1. Make any change to your project
2. Push to GitHub or deploy via Vercel
3. Check your Command Center at `/admin/command-center`
4. You should see a **"LIVE"** badge next to "Deployments"

#### Option B: Test with Vercel's Test Button

1. In Vercel webhook settings, click the webhook you just created
2. Scroll down to "Recent Deliveries"
3. Click "Test" to send a test event
4. Check your database:

```bash
npx prisma studio
```

Look in the `vercel_deployments` table - you should see the test deployment.

---

### Step 5: Deploy to Production (if not already)

If testing locally, deploy to production:

1. Add the webhook secret to Vercel environment variables:

```bash
# Go to: https://vercel.com/zach-robards-projects/seezee/settings/environment-variables

Name: VERCEL_WEBHOOK_SECRET
Value: your_random_secret_here_min_32_chars
Environments: ✅ Production ✅ Preview ✅ Development
```

2. Update the webhook URL in Vercel settings to production:
```
https://seezee.vercel.app/api/webhooks/vercel
```

3. Done! 🎉

---

## How It Works

### The Flow

```
1. You deploy to Vercel
   ↓
2. Vercel sends webhook to /api/webhooks/vercel
   ↓
3. Your API verifies the signature
   ↓
4. Deployment saved to database
   ↓
5. Command Center fetches from DB (not API)
   ↓
6. Shows "LIVE" badge when webhooks are active
```

### What Events Are Tracked

| Event | What It Means | State in DB |
|-------|---------------|-------------|
| `deployment.created` | Deployment queued | `QUEUED` |
| `deployment.checkrun.start` | Build started | `BUILDING` |
| `deployment.succeeded` | Deployment live | `READY` |
| `deployment.error` | Build failed | `ERROR` |
| `deployment.canceled` | User canceled | `CANCELED` |

### Database Table

The `vercel_deployments` table stores:

- Deployment ID (unique)
- Project name
- URL
- State (QUEUED, BUILDING, READY, ERROR, CANCELED)
- Target (production, preview, development)
- Git metadata (branch, commit, message, author)
- Timestamps (created, building, ready)
- Raw webhook payload (for debugging)

**Auto-cleanup:** Keeps the 50 most recent deployments

---

## Verification Checklist

After setup, verify everything works:

- [ ] Database migration completed successfully
- [ ] Webhook secret added to `.env` and Vercel
- [ ] Webhook created in Vercel dashboard
- [ ] Test deployment triggered
- [ ] Command Center shows "LIVE" badge
- [ ] Deployments appear in Command Center
- [ ] No errors in server logs

---

## Troubleshooting

### Webhook Not Receiving Events

**Check webhook status:**
1. Go to Vercel webhook settings
2. Click on your webhook
3. Check "Recent Deliveries" section
4. Look for failed deliveries

**Common issues:**
- ❌ Endpoint returns non-200 status
  - Check server logs for errors
  - Test endpoint: `GET https://your-domain.com/api/webhooks/vercel`
- ❌ Signature verification failed
  - Make sure webhook secret matches in both places
  - Secret must be exactly the same (no extra spaces)
- ❌ Ngrok tunnel expired (development)
  - Restart ngrok, update webhook URL

### No "LIVE" Badge in Command Center

The badge appears when:
1. Webhooks are configured in Vercel
2. At least one deployment exists in the database

**To debug:**
```bash
# Check if deployments exist
npx prisma studio
# Look in vercel_deployments table

# Check API response
curl http://localhost:3000/api/integrations/vercel/deployments
# Should show "webhookConfigured": true
```

### Database Migration Errors

If `prisma migrate dev` fails:

```bash
# Reset and try again (⚠️ DEVELOPMENT ONLY)
npx prisma migrate reset
npx prisma migrate dev --name add_vercel_deployments

# For production, use push instead
npx prisma db push
```

---

## Advanced Configuration

### Filter by Project

To only track specific projects, edit the webhook in Vercel:

1. Go to webhook settings
2. Click your webhook
3. Under "Projects", select "Specific Projects"
4. Choose which projects to track

### Custom Event Handling

Want to do something special when deployments succeed/fail?

Edit `src/app/api/webhooks/vercel/route.ts`:

```typescript
// After saving deployment
if (eventType === "deployment.succeeded") {
  // Send notification, update status page, etc.
  console.log("🎉 Deployment succeeded!");
}

if (eventType === "deployment.error") {
  // Alert team, create incident, etc.
  console.log("🚨 Deployment failed!");
}
```

### Webhook Signature Verification

The webhook verifies signatures for security. To disable (not recommended):

Remove or comment out this in `route.ts`:

```typescript
// if (webhookSecret && signature) {
//   // ... verification code
// }
```

---

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/webhooks/vercel` | POST | Receives webhook events from Vercel |
| `/api/webhooks/vercel` | GET | Test endpoint (returns status) |
| `/api/integrations/vercel/deployments` | GET | Fetch deployments (DB or API fallback) |

---

## Example Webhook Payload

Here's what Vercel sends:

```json
{
  "type": "deployment.succeeded",
  "createdAt": 1675872000000,
  "payload": {
    "deployment": {
      "id": "dpl_abc123",
      "name": "seezee",
      "url": "seezee-abc123.vercel.app",
      "state": "READY",
      "target": "production",
      "createdAt": 1675872000000,
      "meta": {
        "githubCommitRef": "main",
        "githubCommitSha": "abc123def456",
        "githubCommitMessage": "Fix bug in auth",
        "githubCommitAuthorName": "Sean",
        "githubRepo": "SeanSpon/seezee"
      }
    }
  }
}
```

---

## Next Steps

Once webhooks are working:

1. **Add more events:** Domain events, project events, etc.
2. **Create notifications:** Alert when production deploys fail
3. **Build a status page:** Show deployment history publicly
4. **Add metrics:** Track deployment frequency, success rate

---

## Resources

- [Vercel Webhooks Docs](https://vercel.com/docs/observability/webhooks-overview)
- [Available Events](https://vercel.com/docs/observability/webhooks-overview/webhooks-api#available-events)
- [Ngrok (for local testing)](https://ngrok.com/)

---

**Questions?**

Check the logs:
```bash
# Development
npm run dev
# Watch for "[Vercel Webhook]" messages

# Production (Vercel logs)
vercel logs
```

---

**You're all set! 🚀**

Your Command Center will now show real-time deployment updates with a cool "LIVE" badge.
