# Error Fixes Summary

## Date: February 3, 2026

### Errors Reported

1. **React Error #418** - Hydration mismatch (text content differs between server and client)
2. **403 Forbidden** on `/api/projects/[id]/repository` endpoint
3. **Invoice creation error** - "Failed to create invoice"

### Fixes Applied

#### 1. TypeScript Build Errors Fixed

##### a. MaintenanceClient.tsx - ChangeRequest Type Issue
**File:** `src/components/admin/MaintenanceClient.tsx`
**Issue:** The `subscription` field in `ChangeRequest` type was not nullable, but the database query could return null.
**Fix:** Changed the type definition from:
```typescript
subscription: {
  id: string;
  planName: string | null;
  status: string;
};
```
to:
```typescript
subscription: {
  id: string;
  planName: string | null;
  status: string;
} | null;
```

##### b. AdminProjectDetailClient.tsx - Null Email Handling
**File:** `src/app/admin/projects/[id]/components/AdminProjectDetailClient.tsx`
**Issue:** Code was accessing `email.charAt(0)` without checking if email could be null.
**Fixes:** 
- Line 356: Added null check for `primaryClient.email`
- Line 399: Added null check for `member.user.email`

Changed from:
```typescript
{primaryClient.name ? primaryClient.name.charAt(0).toUpperCase() : primaryClient.email.charAt(0).toUpperCase()}
```
to:
```typescript
{primaryClient.name ? primaryClient.name.charAt(0).toUpperCase() : (primaryClient.email ? primaryClient.email.charAt(0).toUpperCase() : '?')}
```

##### c. Stripe Create Subscription Route - Missing TIER_PRICING
**File:** `src/app/api/stripe/create-subscription/route.ts`
**Issue:** `TIER_PRICING` constant was not defined but was being referenced.
**Fix:** Added inline definition of TIER_PRICING since this is a deprecated endpoint:
```typescript
const TIER_PRICING: Record<string, { price: number }> = {
  BASIC: { price: 99 },
  STANDARD: { price: 199 },
  PREMIUM: { price: 399 },
};
```

##### d. Stripe Webhooks Route - Unused Import
**File:** `src/app/api/stripe/webhooks/route.ts`
**Issue:** `SubscriptionStatus` was imported but not used, and the import was failing.
**Fix:** Removed unused import. Changed from:
```typescript
import { SubscriptionStatus, MaintenancePlanStatus } from "@prisma/client";
```
to:
```typescript
import { MaintenancePlanStatus } from "@prisma/client";
```

##### e. Maintenance Page - Subscription Serialization
**File:** `src/app/admin/maintenance/page.tsx`
**Issue:** The subscription field wasn't being explicitly handled during serialization.
**Fix:** Added explicit handling:
```typescript
subscription: cr.subscription || null,
```

### Build Status

✅ **Build successful** - All TypeScript errors resolved

### Remaining Issues to Investigate

The original runtime errors still need investigation:

1. **React Hydration Error (#418)**: This occurs when server-rendered HTML doesn't match client-side rendering. Common causes:
   - Date/time formatting differences between server and client
   - Browser-specific APIs used during SSR
   - Random values or timestamps generated during render
   
   **Recommendation:** Look for components using `new Date()`, `toLocaleDateString()`, or `toLocaleString()` without proper client-side guards.

2. **403 Forbidden on Repository API**: The endpoint exists at `src/app/api/projects/[id]/repository/route.ts` and uses `getClientProjectOrThrow()` for access control. The 403 suggests:
   - User doesn't have access to the project
   - Session/auth issue
   - Organization membership issue
   
   **Recommendation:** Check the browser console for the actual request and verify the user's permissions.

3. **Invoice Creation Error**: Multiple invoice creation functions exist:
   - `createInvoiceWithLineItems` in `src/server/actions/pipeline.ts`
   - `createUnifiedInvoice` in `src/lib/invoice-unified.ts`
   - API endpoint at `src/app/api/admin/invoices/route.ts`
   
   **Recommendation:** Check server logs for the actual error message. The error could be:
   - Database constraint violation
   - Missing required fields
   - Stripe API error
   - Permission issue

### Next Steps

1. **For Hydration Error**: Add `suppressHydrationWarning` to components with date formatting, or use client-side-only rendering for dynamic content
2. **For 403 Error**: Check authentication state and project access permissions in the browser
3. **For Invoice Error**: Check server logs for the detailed error message and stack trace

### Files Modified

1. `src/components/admin/MaintenanceClient.tsx`
2. `src/app/admin/projects/[id]/components/AdminProjectDetailClient.tsx`
3. `src/app/api/stripe/create-subscription/route.ts`
4. `src/app/api/stripe/webhooks/route.ts`
5. `src/app/admin/maintenance/page.tsx`
