# 🔐 Production Login Troubleshooting Guide

## Common Production Login Issues & Fixes

### Issue 1: "Configuration Error" on Login Page
**Symptoms:**
- `/login?error=Configuration` in URL
- Users cannot log in with Google OAuth
- Login page shows "Authentication configuration error"

**Root Cause:**
Missing or incorrect `AUTH_SECRET` in production environment variables.

**Fix:**
1. Go to Vercel Project Settings → Environment Variables
2. Add `AUTH_SECRET` with a secure random value:
   ```bash
   # Generate a secure secret (run locally):
   openssl rand -base64 32
   ```
3. Set the variable for **Production** environment
4. Redeploy the application

**Verification:**
```bash
# Check Vercel environment variables
vercel env ls

# Should show AUTH_SECRET for production
```

---

### Issue 2: OAuth Redirect URI Mismatch
**Symptoms:**
- Google OAuth callback fails with `redirect_uri_mismatch`
- Error in URL: `error=invalid_client` or `error=access_denied`
- Console shows: "The redirect URI in the request... did not match"

**Root Cause:**
The OAuth redirect URI configured in Google Cloud Console doesn't match the actual callback URL.

**Fix:**
1. Go to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. Find your OAuth 2.0 Client ID: `659797017979-sipunrpq0tlabjqthklic4kvoi81rfe7.apps.googleusercontent.com`
3. Click "Edit" and verify **Authorized redirect URIs** includes:
   ```
   https://seezeestudios.com/api/auth/callback/google
   https://see-zee.com/api/auth/callback/google
   http://localhost:3000/api/auth/callback/google (for dev)
   ```
4. Verify **Authorized JavaScript origins** includes:
   ```
   https://seezeestudios.com
   https://see-zee.com
   http://localhost:3000 (for dev)
   ```
5. Click "Save"

**Verification:**
- Try logging in with Google OAuth
- Check browser Network tab for the redirect URL
- Ensure it matches one of the authorized redirect URIs

---

### Issue 3: Missing Environment Variables
**Symptoms:**
- Login page loads but OAuth button doesn't work
- Console shows: "Google OAuth credentials missing"
- Only email/password login works

**Root Cause:**
`AUTH_GOOGLE_ID` or `AUTH_GOOGLE_SECRET` not set in production.

**Fix:**
1. Go to Vercel Project Settings → Environment Variables
2. Add/verify these variables for **Production**:
   ```env
   AUTH_GOOGLE_ID=659797017979-sipunrpq0tlabjqthklic4kvoi81rfe7.apps.googleusercontent.com
   AUTH_GOOGLE_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
3. Get the values from [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
4. Redeploy the application

**Note:** The `AUTH_GOOGLE_SECRET` starts with `GOCSPX-` and is typically 35+ characters.

---

### Issue 4: Wrong Domain in AUTH_URL
**Symptoms:**
- OAuth works on some domains but not others
- Redirect loops after OAuth callback
- Browser shows ERR_TOO_MANY_REDIRECTS

**Root Cause:**
`AUTH_URL` or `NEXTAUTH_URL` doesn't match the actual production domain.

**Current Setup:**
```json
// vercel.json
"env": {
  "AUTH_URL": "https://seezeestudios.com",
  "NEXTAUTH_URL": "https://seezeestudios.com"
}
```

**Fix:**
1. Decide on primary domain: `seezeestudios.com` or `see-zee.com`
2. Update `vercel.json`:
   ```json
   "env": {
     "AUTH_URL": "https://your-primary-domain.com",
     "NEXTAUTH_URL": "https://your-primary-domain.com"
   }
   ```
3. Update Google Console redirect URIs to match (see Issue 2)
4. Commit and deploy:
   ```bash
   git add vercel.json
   git commit -m "Fix AUTH_URL for production"
   git push
   ```

---

### Issue 5: Cookies Not Set (431 Request Header Too Large)
**Symptoms:**
- Login appears to work but session not persisted
- Browser console shows "431 Request Header Fields Too Large"
- Logged out immediately after login

**Root Cause:**
Session cookies exceed browser limits (usually 4KB per cookie).

**Already Fixed:**
✅ The codebase already removes `image` fields from tokens to prevent this:
```typescript
// src/auth.ts - session callback
delete (session.user as any).image;

// src/auth.ts - jwt callback
delete (token as any).picture;
delete (token as any).image;
```

**If still occurring:**
1. Check browser cookies in DevTools → Application → Cookies
2. Look for cookies starting with `authjs.` or `next-auth.`
3. If any cookie exceeds 4KB, we need to remove more fields from the JWT

---

### Issue 6: Database Connection Issues
**Symptoms:**
- Login hangs or times out
- Console shows: "Can't reach database server"
- OAuth callback fails with database errors

**Root Cause:**
`DATABASE_URL` not set or database unreachable.

**Fix:**
1. Go to Vercel Project Settings → Environment Variables
2. Verify `DATABASE_URL` is set for Production:
   ```env
   DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
   ```
3. For Neon.tech databases, use connection pooling URL
4. Test database connection:
   ```bash
   # Run locally with production DATABASE_URL
   npx prisma db execute --stdin < /dev/null
   ```

---

## Quick Diagnostic Checklist

Run through this checklist to diagnose production login issues:

- [ ] **AUTH_SECRET** is set in Vercel (required for JWT signing)
- [ ] **AUTH_URL** matches your production domain
- [ ] **AUTH_GOOGLE_ID** is set and matches Google Console
- [ ] **AUTH_GOOGLE_SECRET** is set and matches Google Console (starts with `GOCSPX-`)
- [ ] **DATABASE_URL** is set and database is accessible
- [ ] Google Console redirect URIs include `https://your-domain.com/api/auth/callback/google`
- [ ] Google Console JavaScript origins include `https://your-domain.com`
- [ ] No 431 errors in browser console (cookies too large)
- [ ] `/api/auth/session` returns valid session data after login

---

## Testing Production Auth Locally

To test with production environment variables locally:

1. Copy production env vars to `.env.local.production`:
   ```bash
   # Get from Vercel
   vercel env pull .env.local.production
   ```

2. Run with production mode:
   ```bash
   NODE_ENV=production npm run build
   NODE_ENV=production npm run start
   ```

3. Test login flow at `http://localhost:3000/login`

---

## Debug Pages

The codebase includes debug pages to diagnose auth issues:

- `/auth-check` - Displays current auth configuration and status
- `/auth-debug` - Shows environment variables and session details
- `/clear-cookies` - Clears oversized cookies causing 431 errors

---

## Vercel Deployment Logs

To check for auth errors in production:

1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on latest deployment
3. Go to "Functions" tab
4. Look for logs from `/api/auth` routes
5. Search for error messages:
   - `❌ Auth configuration error`
   - `❌ Google OAuth Error Detected`
   - `❌ Database health check failed`

---

## Emergency Fix: Disable OAuth Temporarily

If OAuth is completely broken and you need immediate access:

1. Use email/password login (Credentials provider still works)
2. Or create an admin account directly in database:
   ```sql
   -- Connect to database with psql or Prisma Studio
   UPDATE "User" 
   SET role = 'CEO', 
       "emailVerified" = NOW(),
       "tosAcceptedAt" = NOW(),
       "profileDoneAt" = NOW()
   WHERE email = 'your-email@example.com';
   ```

3. Login with email/password at `/login`

---

## Need More Help?

If you've tried all the above and login still doesn't work:

1. Check recent commits for auth-related changes:
   ```bash
   git log --grep="auth\|login\|OAuth" --oneline -20
   ```

2. Review the middleware logs for routing issues:
   ```bash
   # Search for middleware errors in Vercel logs
   # Look for: [MIDDLEWARE] error messages
   ```

3. Test OAuth flow manually:
   - Open `/api/auth/signin/google` in browser
   - Check if it redirects to Google
   - After Google login, check if it redirects back to `/api/auth/callback/google`
   - Check browser Network tab for any errors

4. Contact the repository maintainer with:
   - Error message from `/login?error=XXX`
   - Browser console errors
   - Vercel function logs from `/api/auth/*`
   - Screenshot of Google Console OAuth client configuration
