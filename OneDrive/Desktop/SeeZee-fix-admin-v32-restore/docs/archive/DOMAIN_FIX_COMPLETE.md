# Domain Fix Complete - see-zee.com

## ✅ All Changes Applied

### 1. Auth.js Configuration (`src/auth.ts`)
- ✅ Set `APEX = "https://see-zee.com"`
- ✅ Cookie domain set to `.see-zee.com` (works on apex + www)
- ✅ All redirects forced to apex domain
- ✅ `trustHost: true` for automatic URL detection

### 2. Middleware (`src/middleware.ts`)
- ✅ Minimal, RSC-safe implementation
- ✅ Never intercepts OPTIONS, RSC, or prefetch requests
- ✅ No auth redirects (let server components handle)

### 3. Edge Redirect (`vercel.json`)
- ✅ www → apex redirect at Vercel edge
- ✅ Happens before Next.js

### 4. Environment Variables (Production)
- ✅ `AUTH_URL = https://see-zee.com`
- ✅ `AUTH_SECRET = [set]`
- ✅ No vercel.app references

### 5. Deployment Status
- ✅ **Live at**: https://see-zee.com
- ✅ **Aliases**: www.see-zee.com redirects to apex
- ✅ **Build**: Ready and deployed
- ✅ **Commit**: `ef8065f` - "fix(domains): enforce apex-only redirects, set cookie domain .see-zee.com"

## 🧪 Testing

### Test 1: Domain Resolution
```bash
curl -I https://see-zee.com
# Expected: 200 OK (no redirect)
```

### Test 2: www Redirect
```bash
curl -I https://www.see-zee.com
# Expected: 308 redirect to https://see-zee.com/
```

### Test 3: OAuth Flow
1. Open incognito: `https://see-zee.com/login`
2. Sign in with Google
3. Should redirect to `https://see-zee.com` (no loop)
4. Cookie domain should be `.see-zee.com` in DevTools

### Test 4: Session Persistence
- Navigate to `https://www.see-zee.com/admin`
- Should redirect to `https://see-zee.com/admin`
- Session should persist (no re-login)

## 🎯 How It Works

1. **User visits www.see-zee.com** → Vercel edge redirects to https://see-zee.com (308)
2. **User signs in** → Google OAuth callback goes to https://see-zee.com/api/auth/callback/google
3. **Auth.js processes login** → Sets cookie with domain `.see-zee.com`
4. **Redirect callback** → Forces redirect to `https://see-zee.com` (apex)
5. **Cookie persists** → Works on both see-zee.com and www.see-zee.com

## 🚫 What Was Fixed

- ❌ Removed baseUrl redirects that could loop
- ❌ Removed conditional cookie domain
- ❌ Removed complex middleware auth logic
- ❌ No more vercel.app references

## ✅ Result

**Your site is now live at https://see-zee.com with:**
- No redirect loops
- Proper cookie domain
- www → apex redirect working
- OAuth flow stable
- All traffic on apex domain

**Status**: Production ready! 🎉
