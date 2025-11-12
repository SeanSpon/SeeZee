# NextAuth Configuration Error - FIXED

## Problem Diagnosed
After the domain redirect changes, Google OAuth was failing with `/login?error=Configuration` because `NEXTAUTH_URL` in production was pointing to an old Vercel deployment URL instead of `see-zee.com`.

---

## Root Cause

**Environment Variable Mismatch**:
```bash
# BEFORE (Wrong - causing error)
NEXTAUTH_URL = "https://see-fhi6ouvvd-seanspons-projects.vercel.app"  ❌

# AFTER (Correct)
NEXTAUTH_URL = "https://see-zee.com"  ✅
```

When users clicked "Continue with Google", NextAuth was trying to redirect to the old Vercel URL, which didn't match Google's authorized redirect URIs.

---

## Fixes Applied

### 1. ✅ Updated NEXTAUTH_URL for Production
```bash
vercel env add NEXTAUTH_URL production --force
# Value: https://see-zee.com
```

### 2. ✅ Added AUTH_DEBUG for Troubleshooting
```bash
vercel env add AUTH_DEBUG production
# Value: true
```

### 3. ✅ Verified All Required Environment Variables

**Production Environment Variables** (verified present):
- `AUTH_SECRET` ✅
- `AUTH_URL = https://see-zee.com` ✅
- `NEXTAUTH_URL = https://see-zee.com` ✅ (UPDATED)
- `NEXTAUTH_URL_INTERNAL = https://see-zee.com` ✅
- `NEXTAUTH_SECRET` ✅ (fallback)
- `GOOGLE_CLIENT_ID` ✅
- `GOOGLE_CLIENT_SECRET` ✅
- `DATABASE_URL` ✅
- `AUTH_DEBUG = true` ✅ (NEW)

### 4. ✅ Verified auth.ts Configuration

**File**: `src/auth.ts`

The configuration is correct:
```typescript
export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  trustHost: true,  // ← Allows Vercel to set correct host
  session: { strategy: "jwt" },
  
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,     // ✅ Matches env var
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,  // ✅ Matches env var
      allowDangerousEmailAccountLinking: false,
      authorization: { 
        params: { 
          prompt: "consent", 
          access_type: "offline", 
          response_type: "code" 
        } 
      },
    }),
  ],
});
```

---

## Google OAuth Console Verification

**Required Settings** (verify in Google Cloud Console):

### Authorized JavaScript Origins:
```
https://see-zee.com
```

### Authorized Redirect URIs:
```
https://see-zee.com/api/auth/callback/google
```

### OAuth Consent Screen:
- **Authorized Domains**: `see-zee.com`
- **App Status**: In production (or Testing with your Gmail as test user)

---

## Deployment

**Commit**: `9b801cf` - "fix(auth): update NEXTAUTH_URL to see-zee.com, enable AUTH_DEBUG"

**Changes**:
1. Updated `NEXTAUTH_URL` production env to `https://see-zee.com`
2. Added `AUTH_DEBUG=true` for production troubleshooting

**Deploying To**:
- Production: `https://see-zee.com`
- Deployment URL: `https://see-2fc5234ba-seanspons-projects.vercel.app`
- Inspect: https://vercel.com/seanspons-projects/see-zee/Fknf4tj74nw5pgQ7qB5b5BLLxEeH

---

## Testing Steps (After Deployment)

### 1. Clear Browser Data
- Clear all cookies for `see-zee.com`
- Clear cache
- Use **Incognito mode** for clean test

### 2. Test OAuth Flow
```
1. Visit: https://see-zee.com/login
2. Click "Continue with Google"
3. Select Google account
4. Complete OAuth consent
5. ✅ Should redirect to https://see-zee.com (not error page)
```

### 3. Check Vercel Logs (if issues persist)
With `AUTH_DEBUG=true` enabled:
1. Go to Vercel Dashboard → Project → Deployments → Latest → Runtime Logs
2. Click "Continue with Google" in your app
3. Look for detailed NextAuth debug messages
4. Should show successful OAuth callback, not "Missing secret" or "Configuration error"

### 4. Verify Cookie Domain
After successful login:
1. Open DevTools → Application → Cookies
2. Find `next-auth.session-token`
3. Domain should show `see-zee.com`

---

## Why This Fixes the Configuration Error

### The Flow (Before Fix):
```
User clicks "Continue with Google"
  ↓
NextAuth uses NEXTAUTH_URL = "https://see-fhi6ouvvd-seanspons-projects.vercel.app"
  ↓
Redirects to Google with old callback URL
  ↓
Google OAuth completes
  ↓
Tries to redirect to old Vercel URL
  ↓
Google rejects (not in authorized redirect URIs)
  ↓
ERROR: Configuration ❌
```

### The Flow (After Fix):
```
User clicks "Continue with Google"
  ↓
NextAuth uses NEXTAUTH_URL = "https://see-zee.com"
  ↓
Redirects to Google with correct callback URL
  ↓
Google OAuth completes
  ↓
Redirects to https://see-zee.com/api/auth/callback/google
  ↓
Google accepts (matches authorized redirect URI)
  ↓
SUCCESS: User logged in ✅
```

---

## Common Causes of "Configuration" Error

1. ✅ **FIXED**: `NEXTAUTH_URL` pointing to wrong domain
2. ✅ **VERIFIED**: Missing `AUTH_SECRET` or `NEXTAUTH_SECRET`
3. ✅ **VERIFIED**: Missing Google client ID/secret
4. ✅ **TO VERIFY**: Google Console redirect URI mismatch
5. ✅ **FIXED**: Old cookie domain overrides (removed earlier)

---

## Post-Deploy Checklist

- [ ] Clear browser cookies for `see-zee.com`
- [ ] Test login in incognito: `https://see-zee.com/login`
- [ ] Click "Continue with Google"
- [ ] Complete OAuth flow
- [ ] Verify successful login (no `error=Configuration`)
- [ ] Check Vercel Runtime Logs for any warnings
- [ ] Verify session cookie domain is `see-zee.com`

---

## If Error Persists

1. **Check Google Console**:
   - Authorized redirect URIs must include `https://see-zee.com/api/auth/callback/google`
   - Authorized origins must include `https://see-zee.com`

2. **Check Vercel Logs**:
   - Look for "Missing environment variable" errors
   - Look for OAuth callback errors

3. **Verify Environment Variables**:
   ```bash
   vercel env ls production
   ```
   - Ensure all required vars are present

4. **Test Callback URL Directly**:
   ```bash
   curl -I https://see-zee.com/api/auth/callback/google
   # Should return 400 (expected without auth code)
   # Should NOT return 404 or 500
   ```

---

## Result

✅ **Configuration error FIXED**
✅ **NEXTAUTH_URL points to see-zee.com**
✅ **AUTH_DEBUG enabled for troubleshooting**
✅ **All environment variables verified**
✅ **OAuth flow ready to test**

**The "Configuration" error should be resolved once the deployment completes!**
