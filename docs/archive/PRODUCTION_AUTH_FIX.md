# 🔴 Production Auth Fix - Google OAuth Sign-In Issues

## Problem
After deployment to Vercel production, Google sign-ins are not working.

## Root Causes Identified

1. **Google Client Secret Length Issue**: Build logs show the secret is 35 characters, but it should be 40-50 characters
2. **AUTH_URL Configuration**: Need to ensure AUTH_URL is set in Vercel environment variables (not just vercel.json)
3. **Google Cloud Console Redirect URI**: Production redirect URI must be configured in Google Cloud Console

---

## ✅ Step-by-Step Fix

### 1. Check Vercel Environment Variables

Run this command to see all environment variables:
```bash
vercel env ls
```

**Required Variables for Production:**
- ✅ `AUTH_URL` = `https://see-zee.com` (or use NEXTAUTH_URL)
- ✅ `AUTH_SECRET` = (32+ character secret)
- ✅ `AUTH_GOOGLE_ID` = Your Google Client ID
- ✅ `AUTH_GOOGLE_SECRET` = Your Google Client Secret (40-50 characters)
- ✅ `DATABASE_URL` = Your database connection string

### 2. Fix Google Client Secret

**Issue**: The build logs show:
```
⚠️ WARNING: Google Client Secret may be incorrect!
   Secret length: 35 characters (expected 40-50)
```

**Fix**:
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Find your OAuth 2.0 Client ID (starts with `659797017979-sipunrp...`)
3. Click **Edit** (pencil icon)
4. **Copy the full Client Secret** - it should be 40-50 characters and start with `GOCSPX-`
5. Make sure there are **no spaces, quotes, or line breaks** around it
6. Update in Vercel:
   ```bash
   vercel env rm AUTH_GOOGLE_SECRET production
   vercel env add AUTH_GOOGLE_SECRET production
   # Paste the full secret when prompted
   ```

### 3. Verify AUTH_URL is Set

The `auth.ts` file looks for `AUTH_URL` first, then falls back to `NEXTAUTH_URL`.

**Check if AUTH_URL exists:**
```bash
vercel env ls | grep AUTH_URL
```

**If missing, add it:**
```bash
vercel env add AUTH_URL production
# Enter: https://see-zee.com
```

### 4. Configure Google Cloud Console for Production

**Critical**: Your Google OAuth client must have the production redirect URI configured.

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Find your OAuth 2.0 Client ID
3. Click **Edit** (pencil icon)
4. In **"Authorized JavaScript origins"**, add:
   ```
   https://see-zee.com
   ```
5. In **"Authorized redirect URIs"**, add:
   ```
   https://see-zee.com/api/auth/callback/google
   ```
6. Click **SAVE**

**Important Notes:**
- ✅ Use `https://` (not `http://`)
- ✅ No trailing slash
- ✅ Exact path: `/api/auth/callback/google`
- ✅ Wait a few seconds for changes to propagate

### 5. Verify All Environment Variables

Run this to check all production environment variables:
```bash
vercel env ls production
```

**Expected Output:**
```
✅ AUTH_URL = https://see-zee.com
✅ AUTH_SECRET = [encrypted]
✅ AUTH_GOOGLE_ID = 659797017979-sipunrp... (or GOOGLE_CLIENT_ID)
✅ AUTH_GOOGLE_SECRET = GOCSPX-... (40-50 chars) (or GOOGLE_CLIENT_SECRET)
✅ DATABASE_URL = [encrypted]
```

### 6. Redeploy After Changes

After updating environment variables:
```bash
vercel --prod
```

---

## 🔍 Verification Checklist

After making changes, verify:

- [ ] `AUTH_URL` is set to `https://see-zee.com` in Vercel production
- [ ] `AUTH_GOOGLE_SECRET` is 40-50 characters (not 35)
- [ ] `AUTH_GOOGLE_SECRET` starts with `GOCSPX-`
- [ ] Google Cloud Console has `https://see-zee.com` in JavaScript origins
- [ ] Google Cloud Console has `https://see-zee.com/api/auth/callback/google` in redirect URIs
- [ ] Redeployed to production after changes

---

## 🐛 Common Issues

### Issue: "Configuration" Error
**Cause**: Missing or incorrect environment variables
**Fix**: Verify all required env vars are set in Vercel production

### Issue: "redirect_uri_mismatch" Error
**Cause**: Redirect URI in Google Cloud Console doesn't match
**Fix**: Add `https://see-zee.com/api/auth/callback/google` to Google Cloud Console

### Issue: "invalid_client" Error
**Cause**: Wrong Client ID/Secret or wrong OAuth client type
**Fix**: 
- Verify you're using the production OAuth client (not development)
- Ensure OAuth client type is "Web application"
- Check Client ID and Secret match

### Issue: Secret Length Warning
**Cause**: Secret is truncated or has extra characters
**Fix**: 
- Copy secret directly from Google Cloud Console
- Remove any quotes, spaces, or line breaks
- Ensure it's 40-50 characters long

---

## 📝 Quick Reference

**Vercel Environment Variables:**
```bash
AUTH_URL=https://see-zee.com
AUTH_SECRET=[your-secret]
AUTH_GOOGLE_ID=[your-client-id]
AUTH_GOOGLE_SECRET=[your-client-secret-40-50-chars]
DATABASE_URL=[your-database-url]
```

**Google Cloud Console:**
- JavaScript Origin: `https://see-zee.com`
- Redirect URI: `https://see-zee.com/api/auth/callback/google`

---

## 🚀 After Fixing

1. Test sign-in on production: `https://see-zee.com/login`
2. Check Vercel logs for any errors: `vercel logs`
3. Verify session is created: Check `/api/auth/session` endpoint

If issues persist, check Vercel deployment logs for specific error messages.





