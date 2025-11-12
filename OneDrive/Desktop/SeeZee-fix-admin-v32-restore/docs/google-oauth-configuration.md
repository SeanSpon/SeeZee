# Google OAuth Setup Checklist for SeeZee

## Critical Issues to Fix

🚨 **URGENT**: Replace `"REPLACE_WITH_NEW_ROTATED_SECRET"` in `.env.local` with your actual Google Client Secret

## Google Cloud Console Setup

### 1. OAuth Consent Screen Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project (or create one)
3. Navigate to **APIs & Services** → **OAuth consent screen**
4. Choose **External** (for public access) or **Internal** (for org-only)
5. Fill required fields:
   - **App name**: SeeZee Studio
   - **User support email**: seanspm1007@gmail.com
   - **Developer contact**: seanspm1007@gmail.com
6. **Scopes**: Add `email` and `profile` (basic scopes)
7. **Test users** (if External): Add `seanspm1007@gmail.com`

### 2. OAuth 2.0 Client ID Setup

1. Go to **APIs & Services** → **Credentials**
2. Click **+ Create Credentials** → **OAuth client ID**
3. **Application type**: **Web application**
4. **Name**: `SeeZee Local Development`
5. **Authorized JavaScript origins**:
   ```
   http://localhost:3000
   ```
6. **Authorized redirect URIs**:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
7. Click **Create**
8. **Copy the Client ID and Client Secret** immediately

### 3. Update Environment Variables

Replace in `.env.local`:

```env
# Google OAuth - Auth.js v5 naming
AUTH_GOOGLE_ID="YOUR_ACTUAL_CLIENT_ID_HERE.apps.googleusercontent.com"
AUTH_GOOGLE_SECRET="YOUR_ACTUAL_CLIENT_SECRET_HERE"
```

## Production Setup (When Ready)

For production deployment, create a **separate** OAuth client:

1. **Name**: `SeeZee Production`
2. **Authorized JavaScript origins**:
   ```
   https://your-production-domain.com
   ```
3. **Authorized redirect URIs**:
   ```
   https://your-production-domain.com/api/auth/callback/google
   ```

## Environment Variables Template

```env
# Auth.js v5 (NextAuth v5) 
AUTH_URL="http://localhost:3000"
AUTH_SECRET="b9e3c4ecaff234c426e6ace42663b8f1317b7fa2287f2f91d95807f378d36125"

# Google OAuth - Auth.js v5 naming
AUTH_GOOGLE_ID="659797017979-sipunrpq0tlabjqthklic4kvoi81rfe7.apps.googleusercontent.com"
AUTH_GOOGLE_SECRET="REPLACE_WITH_ACTUAL_SECRET_FROM_GOOGLE_CONSOLE"

# App Configuration  
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Testing Steps

1. **Restart development server** after env changes:
   ```bash
   npm run dev
   ```

2. **Test endpoints**:
   - Providers: `http://localhost:3000/api/auth/providers`
   - Sign in: `http://localhost:3000/api/auth/signin`
   - Session: `http://localhost:3000/api/auth/session`

3. **Sign in flow**:
   - Visit `/api/auth/signin`
   - Click "Sign in with Google"
   - Complete OAuth flow
   - Check `/api/auth/session` for user data

## Common Error Solutions

### `invalid_client` Error
- **Cause**: Wrong client type, mismatched redirect URI, or wrong credentials
- **Fix**: Ensure OAuth client is **Web application** type with exact redirect URI

### `Configuration` Error on `/login`
- **Cause**: Environment variables not loaded or misnamed
- **Fix**: Check `.env.local` has `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`

### `Access blocked` Error
- **Cause**: App not configured for external users
- **Fix**: Add email to test users or publish the app

## Security Notes

- Use different OAuth clients for development and production
- Rotate secrets regularly
- Never commit actual secrets to version control
- Use strong `AUTH_SECRET` (32+ bytes)

## Current Status

✅ Auth.js v5 configuration updated
✅ JWT sessions enabled (no database required)
✅ Environment variables use correct naming
❌ **Need actual Google Client Secret**
❌ **Need to verify Google OAuth client setup**

## Next Steps

1. **URGENT**: Get actual Google Client Secret from Google Console
2. Update `AUTH_GOOGLE_SECRET` in `.env.local`
3. Restart development server
4. Test sign-in flow at `/api/auth/signin`