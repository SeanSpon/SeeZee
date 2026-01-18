# 🚨 Quick Fix: Production Google OAuth Sign-In

## Current Status
✅ All required environment variables are set in Vercel production
⚠️ **Issue**: Google Client Secret is 35 characters (should be 40-50)

## The Problem
Build logs show:
```
⚠️ WARNING: Google Client Secret may be incorrect!
   Secret length: 35 characters (expected 40-50)
   Secret prefix: GOCSPX-edk...
```

This suggests the secret is truncated or incomplete.

---

## 🔧 Fix Steps

### Step 1: Get the Full Google Client Secret

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Find your OAuth 2.0 Client ID (should start with `659797017979-sipunrp...`)
3. Click the **Edit** (pencil) icon
4. In the **Client secret** field, click **Show** or **Reveal**
5. **Copy the ENTIRE secret** - it should be:
   - 40-50 characters long
   - Start with `GOCSPX-`
   - No spaces, quotes, or line breaks

### Step 2: Update in Vercel

**Option A: Via Vercel Dashboard**
1. Go to https://vercel.com/dashboard
2. Select your project: `see-zee`
3. Go to **Settings** → **Environment Variables**
4. Find `AUTH_GOOGLE_SECRET` (Production)
5. Click **Edit**
6. Paste the **full secret** (40-50 characters)
7. Click **Save**

**Option B: Via CLI**
```bash
# Remove the old (possibly truncated) secret
vercel env rm AUTH_GOOGLE_SECRET production

# Add the correct full secret
vercel env add AUTH_GOOGLE_SECRET production
# When prompted, paste the full 40-50 character secret
```

### Step 3: Verify Google Cloud Console Redirect URI

**Critical**: Ensure production redirect URI is configured:

1. In Google Cloud Console, edit your OAuth client
2. **Authorized JavaScript origins** should include:
   ```
   https://see-zee.com
   ```
3. **Authorized redirect URIs** should include:
   ```
   https://see-zee.com/api/auth/callback/google
   ```
4. Click **SAVE**
5. Wait 10-30 seconds for changes to propagate

### Step 4: Redeploy

After updating the secret:
```bash
vercel --prod
```

---

## ✅ Verification

After redeploying, test:
1. Go to `https://see-zee.com/login`
2. Click "Sign in with Google"
3. Complete the OAuth flow
4. Should redirect back and create a session

If it still fails, check Vercel logs:
```bash
vercel logs --follow
```

---

## 📋 Checklist

- [ ] Google Client Secret is 40-50 characters (not 35)
- [ ] Secret starts with `GOCSPX-`
- [ ] No spaces, quotes, or line breaks in secret
- [ ] `AUTH_GOOGLE_SECRET` updated in Vercel production
- [ ] Google Cloud Console has `https://see-zee.com` in JavaScript origins
- [ ] Google Cloud Console has `https://see-zee.com/api/auth/callback/google` in redirect URIs
- [ ] Redeployed to production after changes

---

## 🐛 If Still Not Working

Check Vercel deployment logs for specific errors:
```bash
vercel logs [deployment-url]
```

Common errors:
- **"redirect_uri_mismatch"**: Redirect URI not configured in Google Cloud Console
- **"invalid_client"**: Wrong Client ID/Secret or wrong OAuth client type
- **"Configuration"**: Missing environment variables (but we verified these are set)





