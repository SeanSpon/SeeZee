# Google Sign-In Configuration Error Fix

## Problem
Google sign-in shows `login?error=configuration` error.

## Root Cause
The "Configuration" error in NextAuth typically occurs when:
1. **AUTH_URL or NEXTAUTH_URL is missing** - NextAuth needs to know the base URL to construct OAuth callback URLs
2. **Google OAuth credentials are missing** - AUTH_GOOGLE_ID/GOOGLE_CLIENT_ID or AUTH_GOOGLE_SECRET/GOOGLE_CLIENT_SECRET
3. **Redirect URI mismatch** - The callback URL doesn't match what's configured in Google Cloud Console

## Quick Fix

### Step 1: Check Your Environment Variables

Visit `/auth-check` in your app to see which environment variables are missing.

### Step 2: Set Required Environment Variables

#### For Local Development (.env.local):
```bash
AUTH_SECRET=your-secret-here
AUTH_URL=http://localhost:3000
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
DATABASE_URL=your-database-url
```

#### For Production (Vercel):
```bash
# Set these in Vercel Dashboard → Project → Settings → Environment Variables

AUTH_SECRET=your-secret-here
AUTH_URL=https://see-zee.com
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
DATABASE_URL=your-database-url
```

**OR** use the NextAuth naming convention:
```bash
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=https://see-zee.com
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
DATABASE_URL=your-database-url
```

### Step 3: Verify Google Cloud Console Settings

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Under **Authorized redirect URIs**, ensure you have:
   ```
   http://localhost:3000/api/auth/callback/google  (for local dev)
   https://see-zee.com/api/auth/callback/google    (for production)
   ```
5. Under **Authorized JavaScript origins**, ensure you have:
   ```
   http://localhost:3000  (for local dev)
   https://see-zee.com    (for production)
   ```
6. Click **SAVE**

### Step 4: Restart Your Server

After updating environment variables:
- **Local**: Restart your dev server (`npm run dev`)
- **Production**: Redeploy your Vercel app

## Verification

1. Visit `/auth-check` to verify all environment variables are set correctly
2. Visit `/login` and try signing in with Google
3. The error should be resolved

## Common Issues

### Issue: "Configuration" error persists after setting variables
**Solution**: 
- Make sure you restarted your server after updating `.env.local`
- Check that the variable names match exactly (AUTH_URL vs NEXTAUTH_URL)
- Verify the callback URL in Google Console matches exactly: `https://see-zee.com/api/auth/callback/google`

### Issue: Works locally but not in production
**Solution**:
- Check Vercel environment variables are set for the correct environment (production/preview/development)
- Ensure `AUTH_URL` is set to your production domain: `https://see-zee.com`
- Verify Google Console has the production callback URL whitelisted

### Issue: Redirect URI mismatch error from Google
**Solution**:
- The callback URL in Google Console must match exactly what NextAuth generates
- Check `/auth-check` to see the expected callback URL
- Make sure there are no trailing slashes or typos

## Testing

1. Clear browser cookies for your domain
2. Visit `/login` in incognito mode
3. Click "Continue with Google"
4. Complete the OAuth flow
5. You should be redirected back successfully (no error)

## Need Help?

If the error persists:
1. Check `/auth-check` for detailed configuration status
2. Check your server logs for NextAuth error messages
3. Verify all environment variables are set correctly
4. Ensure Google Cloud Console settings match your domain

