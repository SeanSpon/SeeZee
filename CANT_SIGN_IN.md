# Can't Sign In? Quick Troubleshooting Guide

If you're having trouble signing into your SeeZee account, this guide will help you diagnose and fix the most common issues.

## 🚨 Quick Fixes (Try These First)

### 1. Check Your Email and Password
- Make sure your email address is correct
- Passwords are **case-sensitive** - check your Caps Lock
- If you forgot your password, use the [Password Reset](https://seezeestudios.com/forgot-password) link

### 2. Clear Your Browser Cache
Sometimes old data can cause sign-in issues:
1. Press `Ctrl+Shift+Delete` (Windows/Linux) or `Cmd+Shift+Delete` (Mac)
2. Select "Cached images and files" and "Cookies and other site data"
3. Click "Clear data"
4. Try signing in again

### 3. Try a Different Browser
If one browser doesn't work, try another:
- Chrome
- Firefox
- Safari
- Microsoft Edge

### 4. Use Incognito/Private Mode
Open an incognito/private window and try signing in there to rule out browser extensions or cache issues.

---

## 🔍 Common Error Messages

### Error: "Invalid email or password"
**What it means:** Your login credentials don't match our records.

**Solutions:**
- Double-check you're using the correct email address
- Make sure your password is entered correctly (case-sensitive)
- Try [resetting your password](https://seezeestudios.com/forgot-password)
- If you signed up with Google, use the "Login with Google" button instead

### Error: "Authentication configuration error"
**What it means:** There's a server configuration issue (not your fault).

**Solutions:**
- This is a technical issue on the server side
- Visit [/auth-check](https://seezeestudios.com/auth-check) to see detailed configuration status
- Contact support at [support@seezeestudios.com](mailto:support@seezeestudios.com)

### Error: "OAuth callback error"
**What it means:** Google sign-in couldn't complete, usually due to browser settings.

**Solutions:**
- Enable third-party cookies in your browser
- Allow pop-ups from seezeestudios.com
- Try signing in with email/password instead
- Clear your browser cache and try again

### Error: "Account not found"
**What it means:** We couldn't find an account with that email address.

**Solutions:**
- Check if you're using the correct email address
- If you haven't signed up yet, [create an account](https://seezeestudios.com/register)
- If you signed up with Google, use the "Login with Google" button

---

## 🔧 Browser-Specific Issues

### Chrome/Edge
1. Settings → Privacy and security → Cookies and other site data
2. Make sure "Block third-party cookies" is OFF
3. Add seezeestudios.com to "Sites that can always use cookies"

### Firefox
1. Options → Privacy & Security
2. Set "Enhanced Tracking Protection" to Standard (not Strict)
3. Click "Manage Exceptions" and add seezeestudios.com

### Safari
1. Preferences → Privacy
2. Uncheck "Block all cookies"
3. Uncheck "Prevent cross-site tracking" temporarily

---

## 🔐 Google Sign-In Issues

If you're having trouble with "Login with Google":

### Check Browser Settings
- ✅ Third-party cookies are enabled
- ✅ Pop-ups are allowed for seezeestudios.com
- ✅ JavaScript is enabled

### Try These Steps
1. Sign out of all Google accounts
2. Sign in to Google with the account you use for SeeZee
3. Try the "Login with Google" button again
4. If it still doesn't work, try email/password login instead

---

## 🆘 Still Can't Sign In?

If you've tried everything above and still can't access your account:

### Get Help
- 📧 **Email support:** [support@seezeestudios.com](mailto:support@seezeestudios.com)
- 🌐 **Help page:** [/help/sign-in](https://seezeestudios.com/help/sign-in)
- 🔍 **Configuration check:** [/auth-check](https://seezeestudios.com/auth-check)

### What to Include in Your Support Request
1. What error message you see (take a screenshot)
2. Which browser and version you're using
3. Whether you signed up with email or Google
4. What you've already tried from this guide

---

## 🛠️ For Developers/Administrators

If you're managing the SeeZee instance and users are reporting sign-in issues:

### 1. Check Environment Variables
Run the configuration checker:
```bash
npm run check:prod-auth
```

### 2. Required Environment Variables
Make sure these are set in your Vercel project:
- `AUTH_SECRET` (32+ characters, required)
- `AUTH_URL` (your production domain)
- `AUTH_GOOGLE_ID` (for Google OAuth)
- `AUTH_GOOGLE_SECRET` (for Google OAuth)
- `DATABASE_URL` (PostgreSQL connection)

### 3. Google OAuth Configuration
In [Google Cloud Console](https://console.cloud.google.com/apis/credentials):
- **Authorized redirect URIs:** `https://your-domain.com/api/auth/callback/google`
- **Authorized JavaScript origins:** `https://your-domain.com`

### 4. Detailed Troubleshooting
See [docs/PRODUCTION_LOGIN_TROUBLESHOOTING.md](./docs/PRODUCTION_LOGIN_TROUBLESHOOTING.md) for comprehensive debugging steps.

---

## 📚 Related Documentation
- [Production Login Fix Summary](./PRODUCTION_LOGIN_FIX.md)
- [Production Login Troubleshooting](./docs/PRODUCTION_LOGIN_TROUBLESHOOTING.md)
- [Environment Variables Checklist](./docs/ENV_VARS_CHECKLIST.md)
- [Quick Start Guide](./QUICK_START.md)
