# Google OAuth Redirect URI Fix

## Error: `redirect_uri_mismatch`

This error occurs when the redirect URI that your app sends to Google doesn't match what's configured in your Google OAuth Console.

## ⚠️ IMPORTANT: Port Mismatch Fix

**Your app runs on port 3000, but your `.env.local` has port 3001!**

### Quick Fix:

1. Open `.env.local` in your project root
2. Change these lines:
   ```env
   # OLD (WRONG):
   NEXTAUTH_URL=http://localhost:3001
   AUTH_URL=http://localhost:3001
   
   # NEW (CORRECT):
   NEXTAUTH_URL=http://localhost:3000
   AUTH_URL=http://localhost:3000
   ```
3. Save the file
4. Restart your dev server

## Solution

### Step 1: Add Redirect URI to Google Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create one if needed)
3. Go to **APIs & Services** > **Credentials**
4. Find your OAuth 2.0 Client ID (the one you're using for SeeZee)
5. Click **Edit** (pencil icon)
6. Under **Authorized redirect URIs**, add these URIs:

**For Development (localhost):**
```
http://localhost:3000/api/auth/callback/google
```

**For Production:**
```
https://see-zee.com/api/auth/callback/google
https://www.see-zee.com/api/auth/callback/google
```

7. Click **Save**

### Step 2: Set Environment Variables

Make sure your `.env.local` file has the correct URL:

**For Development:**
```env
AUTH_URL=http://localhost:3000
# OR
NEXTAUTH_URL=http://localhost:3000
```

**For Production:**
```env
AUTH_URL=https://see-zee.com
# OR
NEXTAUTH_URL=https://see-zee.com
```

### Step 3: Verify Your Google OAuth Credentials

Make sure your `.env.local` has:
```env
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
# OR
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Step 4: Restart Your Dev Server

After making changes:
1. Stop your dev server (Ctrl+C)
2. Restart it: `npm run dev`
3. Try logging in again

## Common Issues

### Issue: Still getting redirect_uri_mismatch

**Solution:** 
- Make sure the redirect URI in Google Console **exactly** matches what NextAuth is sending
- Check the browser console/network tab to see what redirect URI is being requested
- The redirect URI should be: `http://localhost:3000/api/auth/callback/google` (for dev)

### Issue: "Configuration" error

**Solution:**
- Make sure `AUTH_URL` or `NEXTAUTH_URL` is set correctly
- For local development, it should be `http://localhost:3000`
- Make sure the port matches your dev server port

### Issue: OAuth consent screen not configured

**Solution:**
1. Go to **APIs & Services** > **OAuth consent screen**
2. Fill out the required fields:
   - App name: "SeeZee Studio"
   - User support email: your email
   - Developer contact: your email
3. Add scopes if needed (email, profile are usually added by default)
4. Add test users if your app is in testing mode
5. Save and continue

## Testing

After fixing, test the login:
1. Go to `http://localhost:3000/login`
2. Click "Sign in with Google"
3. You should be redirected to Google's consent screen
4. After consent, you should be redirected back to your app

## Notes

- The redirect URI must **exactly** match (including http vs https, port number, and path)
- Changes in Google Console can take a few minutes to propagate
- Make sure you're using the correct OAuth Client ID (not a different project's ID)

