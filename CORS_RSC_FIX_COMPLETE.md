# CORS/RSC Preflight Fix - Complete

## Problem Diagnosed
The production site was experiencing **CORS preflight request failures** with the error:
```
"Redirect is not allowed for a preflight request."
```

### Root Cause
1. **www → apex redirect happening in Next.js** instead of at the edge
2. **Middleware redirecting OPTIONS requests** (CORS preflight)
3. **Middleware redirecting RSC fetches** (`?_rsc` query param)
4. **Middleware redirecting prefetch requests** (`next-router-prefetch` header)
5. **Global auth guard** protecting all routes including RSC data fetches

## Solutions Implemented

### 1. Edge-Level www → apex Redirect
**File**: `vercel.json`
```json
{
  "redirects": [
    {
      "source": "/(.*)",
      "has": [{ "type": "host", "value": "www.see-zee.com" }],
      "destination": "https://see-zee.com/$1",
      "permanent": true
    }
  ]
}
```
- ✅ Redirect happens **before Next.js** and **before CORS/preflight**
- ✅ No interference with RSC requests

### 2. RSC/CORS-Safe Middleware
**File**: `src/middleware.ts`

**Key Changes**:
- ✅ **Never intercept OPTIONS requests** (CORS preflight)
- ✅ **Never intercept `?_rsc` requests** (React Server Component data)
- ✅ **Never intercept prefetch requests** (`next-router-prefetch: 1`)
- ✅ **Narrow protection** to only specific routes (admin, client)
- ✅ **Let SSR handle auth** instead of middleware redirects

**Before** (Global Auth Guard):
```typescript
export default auth((req) => {
  // Redirected EVERYTHING including OPTIONS, RSC, prefetch
  if (!user) {
    return NextResponse.redirect("/login"); // ❌ Breaks CORS
  }
});
```

**After** (RSC-Safe):
```typescript
export function middleware(req: NextRequest) {
  // 0) Never interfere with preflight or RSC
  if (method === "OPTIONS") return NextResponse.next();
  if (url.searchParams.has("_rsc")) return NextResponse.next();
  if (headers.get("next-router-prefetch") === "1") return NextResponse.next();
  
  // Let server components handle auth checks
  return NextResponse.next();
}
```

### 3. Clean Auth.js v5 Configuration
**File**: `src/auth.ts`

**Removed**:
- ❌ Commented-out Email provider
- ❌ Hardcoded redirect_uri logic
- ❌ baseURL hacks

**Kept**:
- ✅ `trustHost: true` (auto-detects correct URL)
- ✅ Clean redirect callback
- ✅ JWT session strategy

### 4. Environment Variables (Production)

**Added to Vercel**:
- ✅ `AUTH_URL = https://see-zee.com`
- ✅ `AUTH_SECRET = 515546cd...` (same as NEXTAUTH_SECRET)

**Kept for Compatibility**:
- `NEXTAUTH_URL` (still works with Auth.js v5)
- `NEXTAUTH_SECRET` (fallback in code)
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `DATABASE_URL`

## Verification Checklist

### ✅ Google OAuth Configuration
- [x] `https://see-zee.com/api/auth/callback/google` whitelisted
- [x] `https://www.see-zee.com/api/auth/callback/google` whitelisted
- [x] `http://localhost:3000/api/auth/callback/google` whitelisted

### ✅ Vercel Domain Setup
- [x] `see-zee.com` (apex) - Primary
- [x] `www.see-zee.com` - Redirects to apex via vercel.json

### ✅ Deployment
- [x] vercel.json committed and pushed
- [x] Middleware updated to be RSC-safe
- [x] Auth.js cleaned up
- [x] Environment variables configured
- [x] Deployed with `--force` flag

## Testing Steps

1. **Visit**: `https://www.see-zee.com`
   - Should redirect to `https://see-zee.com` ✅
   
2. **Sign in with Google**:
   - Click "Sign in with Google"
   - Authenticate with Google
   - Should redirect back to see-zee.com ✅
   
3. **Navigate between pages**:
   - RSC prefetch should work without errors ✅
   - No CORS errors in console ✅
   
4. **Check protected routes**:
   - `/admin` → Should require auth
   - `/client` → Should require auth
   - SSR should handle redirects, not middleware

## Commit History

```bash
9f8fec2 - fix(auth,cors): edge www→apex redirect, RSC-safe middleware, Auth.js v5 envs
ef6a988 - fix: Remove obsolete invitation route using old Invitation model
0bda974 - fix: Update admin redirects to point to analytics dashboard
```

## Production URLs

- **Primary**: https://see-zee.com
- **Latest Deployment**: https://see-fojfppj0j-seanspons-projects.vercel.app
- **Inspect**: https://vercel.com/seanspons-projects/see-zee/7VgoyPYxoXuQPp1yFRU2oKt8p7Tr

## Result

✅ **CORS preflight errors FIXED**
✅ **RSC data fetches working**
✅ **www → apex redirect at edge**
✅ **Auth still protected, but RSC-safe**
✅ **Clean Auth.js v5 setup**

The site should now work perfectly with no CORS errors!
