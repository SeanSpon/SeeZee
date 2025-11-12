# Sign-In Troubleshooting Guide

## Most Likely Issues (in order of probability)

### 1. **Missing AUTH_URL or NEXTAUTH_URL** ⚠️ MOST COMMON
**Symptom**: "Configuration" error when clicking "Continue with Google"

**Why it happens**:
- NextAuth needs to know your app's base URL to build the callback URL
- Without it, NextAuth guesses wrong and Google rejects the callback

**How to check**:
1. Visit `/auth-check` to see if AUTH_URL or NEXTAUTH_URL is set
2. Check your terminal/server logs for warnings about missing URL

**Fix**:
- **Local development**: Create `.env.local` in project root:
  ```env
  AUTH_URL=http://localhost:3000
  ```
- **Production**: Set `AUTH_URL` or `NEXTAUTH_URL` in Vercel environment variables

---

### 2. **Google OAuth Callback URL Mismatch** ⚠️ VERY COMMON
**Symptom**: "Configuration" error or redirect fails after Google login

**Why it happens**:
- Google Console has callback URL: `https://see-zee.com/api/auth/callback/google`
- But you're running locally on `http://localhost:3000`
- They don't match, so Google rejects it

**How to check**:
1. Visit `/auth-check` to see the expected callback URL
2. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
3. Check if the callback URL matches what `/auth-check` shows

**Fix**:
Add **both** to Google Console:
- `http://localhost:3000/api/auth/callback/google` (for local dev)
- `https://see-zee.com/api/auth/callback/google` (for production)

---

### 3. **Environment Variables Not Loading** ⚠️ COMMON
**Symptom**: Variables exist but still get "Configuration" error

**Why it happens**:
- `.env.local` file in wrong location (should be in project root)
- Server not restarted after adding env vars
- Typo in variable name (e.g., `AUTH_SECRET` vs `NEXTAUTH_SECRET`)

**How to check**:
1. Verify `.env.local` is in project root (same folder as `package.json`)
2. Check variable names match exactly (case-sensitive!)
3. Restart dev server after changes

**Fix**:
```bash
# Make sure file is in project root
ls .env.local  # Should show the file

# Restart dev server
npm run dev
```

---

### 4. **Wrong Google OAuth Credentials** ⚠️ LESS COMMON
**Symptom**: "Configuration" error or "invalid_client" error

**Why it happens**:
- Using wrong Client ID or Secret
- Credentials from different project
- Secret was rotated but not updated

**How to check**:
1. Visit `/auth-check` to see if credentials are set
2. Compare with Google Cloud Console → Credentials

**Fix**:
- Get fresh credentials from Google Cloud Console
- Update `.env.local` with correct values
- Restart server

---

### 5. **Database Connection Issues** ⚠️ LESS COMMON
**Symptom**: Sign-in starts but fails after Google redirect

**Why it happens**:
- DATABASE_URL not set or wrong
- Database is down or unreachable
- Prisma schema not migrated

**How to check**:
1. Check terminal for database connection errors
2. Verify DATABASE_URL in `.env.local`
3. Test connection: `npx prisma db pull`

**Fix**:
```bash
# Set DATABASE_URL
DATABASE_URL=postgresql://user:pass@host/db

# Run migrations
npx prisma migrate dev
```

---

## Quick Diagnostic Steps

### Step 1: Check Current Configuration
Visit: `http://localhost:3000/auth-check`

This shows:
- ✅ Which env vars are set
- ✅ Expected callback URL
- ✅ What Google Console needs

### Step 2: Check Server Logs
When you click "Continue with Google", check your terminal for:
- ❌ Errors about missing variables
- ❌ Database connection errors
- ⚠️ Warnings about URL configuration

### Step 3: Test Locally
1. Create `.env.local` with:
   ```env
   AUTH_URL=http://localhost:3000
   AUTH_SECRET=your-secret-here
   AUTH_GOOGLE_ID=your-google-client-id
   AUTH_GOOGLE_SECRET=your-google-client-secret
   DATABASE_URL=your-database-url
   ```

2. Restart server: `npm run dev`

3. Visit `/auth-check` to verify everything is green

4. Try signing in

---

## Most Likely Fix (90% of cases)

If you're running locally and getting "Configuration" error:

1. **Create `.env.local`** in project root:
   ```env
   AUTH_URL=http://localhost:3000
   ```

2. **Add to Google Console**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Select your OAuth 2.0 Client
   - Add to "Authorized redirect URIs":
     - `http://localhost:3000/api/auth/callback/google`
   - Add to "Authorized JavaScript origins":
     - `http://localhost:3000`

3. **Restart your dev server**

4. **Try signing in again**

This fixes the issue in 90% of cases.

---

## Still Not Working?

1. Visit `/auth-check` and screenshot what it shows
2. Check terminal logs when you click "Continue with Google"
3. Share the exact error message you see


