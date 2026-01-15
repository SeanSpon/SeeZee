# Google OAuth Production URL Fix

## Problem
The production site at `https://see-zee.com` is showing OAuth redirect URI mismatch errors because Google Cloud Console doesn't have the production domain in the authorized redirect URIs list.

## Solution

### Step 1: Update Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (the one with Client ID: `659797017979-sipunrpq0tlabjqthklic4kvoi81rfe7`)
3. Navigate to **APIs & Services** → **Credentials**
4. Click on your OAuth 2.0 Client ID
5. Under **Authorized redirect URIs**, add:
   ```
   https://see-zee.com/api/auth/callback/google
   ```
6. Keep the existing localhost URI for development:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
7. Click **SAVE**

### Step 2: Update Vercel Environment Variable

Run these commands in your terminal:

```powershell
# Remove old NEXTAUTH_URL (if prompted, answer 'y')
vercel env rm NEXTAUTH_URL production

# Add production URL
echo "https://see-zee.com" | vercel env add NEXTAUTH_URL production

# Add preview URL pattern (optional but recommended)
echo "https://*.vercel.app" | vercel env add NEXTAUTH_URL preview

# Add development URL
echo "http://localhost:3000" | vercel env add NEXTAUTH_URL development
```

### Step 3: Redeploy

After updating the environment variables, redeploy your application:

```powershell
vercel --prod
```

## Verification

1. Visit `https://see-zee.com`
2. Click "Sign in with Google"
3. You should be redirected to Google's login page
4. After signing in, you should be redirected back to `https://see-zee.com` successfully

## Current Configuration

- **Production Domain**: `https://see-zee.com`
- **Vercel Deployment**: `https://see-k06ays4p9-seanspons-projects.vercel.app`
- **Auth Configuration**: `trustHost: true` (automatically detects correct URL)
- **Google Client ID**: `659797017979-sipunrpq0tlabjqthklic4kvoi81rfe7`

## Notes

- The `trustHost: true` setting in `src/auth.ts` allows NextAuth to automatically use the request's host header, which is why it works on localhost but not on production (Google needs the redirect URI explicitly whitelisted)
- You need both the domain (`see-zee.com`) AND the callback path (`/api/auth/callback/google`) in Google Cloud Console
- Vercel preview deployments will use the preview deployment URL automatically when `trustHost: true` is set
