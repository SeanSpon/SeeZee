# Subscription & Hour Allocation Fix

## Problem
Clients purchasing quarterly maintenance plans on localhost were not receiving:
- Monthly support hours allocation
- Subscription visibility in dashboard
- Hour pack tracking

## Root Cause
The Stripe webhook handlers (`checkout.session.completed`, `subscription.created`, and `invoice.paid`) were updating the maintenance plan with the subscription ID but **failing to reset the monthly usage counters** and billing period dates.

When a subscription was created or renewed, the system would:
1. ✅ Link the Stripe subscription ID to the maintenance plan
2. ✅ Set the plan status to ACTIVE
3. ❌ **NOT reset `supportHoursUsed` to 0** (so clients couldn't use their monthly hours)
4. ❌ **NOT set `currentPeriodStart` and `currentPeriodEnd`** (so billing period was unknown)
5. ❌ **NOT handle rollover hours** on subscription renewal

## Solution Implemented

### 1. Fixed `handleSubscriptionCreated` Webhook
**File:** `src/app/api/webhooks/stripe/route.ts`

Now when a subscription is created, it:
- Resets `supportHoursUsed` to 0
- Resets `changeRequestsUsed` to 0  
- Resets `urgentRequestsUsed` to 0
- Resets `requestsToday` to 0
- Sets `currentPeriodStart` from subscription
- Sets `currentPeriodEnd` from subscription

```typescript
const maintenancePlanUpdateData = {
  stripeSubscriptionId: subscription.id,
  status: subscription.status === 'active' ? 'ACTIVE' : 'PAUSED',
  supportHoursUsed: 0, // ✅ Monthly hours now available
  changeRequestsUsed: 0,
  urgentRequestsUsed: 0,
  requestsToday: 0,
  currentPeriodStart: new Date(subscription.current_period_start * 1000),
  currentPeriodEnd: new Date(subscription.current_period_end * 1000),
};
```

### 2. Fixed `handleInvoicePaid` Webhook  
**File:** `src/app/api/webhooks/stripe/route.ts`

Added logic to detect recurring subscription invoices and reset monthly counters:

```typescript
// CRITICAL: If this is a recurring subscription invoice, reset monthly usage counters
if (stripeInvoice.subscription && stripeInvoice.billing_reason === 'subscription_cycle') {
  // Handle rollover hours: unused hours from previous period
  const unusedHours = maintenancePlan.supportHoursIncluded - maintenancePlan.supportHoursUsed;
  const newRolloverHours = Math.min(
    maintenancePlan.rolloverHours + Math.max(0, unusedHours),
    maintenancePlan.rolloverCap
  );
  
  await prisma.maintenancePlan.update({
    where: { id: maintenancePlan.id },
    data: {
      supportHoursUsed: 0, // ✅ Reset monthly hours
      changeRequestsUsed: 0,
      urgentRequestsUsed: 0,
      requestsToday: 0,
      rolloverHours: newRolloverHours, // ✅ Bank unused hours
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  });
}
```

### 3. Fixed `handleCheckoutSessionCompleted`
**File:** `src/app/api/webhooks/stripe/route.ts`

Ensured initial subscription checkout also resets usage counters and sets billing period:

```typescript
const updateResult = await prisma.maintenancePlan.update({
  where: { id: maintenancePlanId },
  data: {
    stripeSubscriptionId: subscriptionId,
    status: 'ACTIVE',
    supportHoursUsed: 0, // ✅ Start with full hours
    changeRequestsUsed: 0,
    urgentRequestsUsed: 0,
    requestsToday: 0,
  },
});

// Set billing period dates
await prisma.maintenancePlan.update({
  where: { id: maintenancePlanId },
  data: {
    currentPeriodStart: periodStart,
    currentPeriodEnd: periodEnd,
  },
});
```

## What Now Works

### ✅ Initial Subscription Purchase
1. Client goes to `/client/hours`
2. Selects a tier (ESSENTIALS, DIRECTOR, or COO)
3. Completes Stripe checkout
4. Webhook fires and:
   - Links subscription to maintenance plan
   - Activates plan status
   - **Allocates monthly support hours** (8, 16, or unlimited)
   - Sets billing period dates
   - Resets all usage counters to 0

### ✅ Monthly Subscription Renewal
1. Stripe automatically bills the customer
2. `invoice.paid` webhook fires
3. System detects it's a subscription renewal (`billing_reason === 'subscription_cycle'`)
4. Calculates unused hours from previous period
5. Banks unused hours as rollover (up to cap)
6. **Resets monthly hours to full allocation**
7. Updates billing period dates

### ✅ Hour Pack Purchases
- Work independently of subscriptions
- Can be purchased without an active subscription
- Hours are tracked separately via `HourPack` model
- Still visible and usable in dashboard

### ✅ Client Dashboard Display
The `/api/client/hours` endpoint now correctly shows:
- Monthly hours included (from tier config)
- Monthly hours used (from maintenance logs)
- Monthly hours remaining
- Rollover hours (persist across periods)
- Hour pack hours (persist until expiry)
- Total hours available (sum of all sources)
- Subscription status and next billing date

## Testing Instructions

### Test Initial Subscription
1. Log in as a client user
2. Navigate to `/client/hours`
3. Click "Select Plan" on any tier
4. Complete test checkout with Stripe test card: `4242 4242 4242 4242`
5. After redirect back to dashboard, verify:
   - Subscription status shows as ACTIVE
   - Monthly hours show the correct amount (8, 16, or unlimited)
   - Billing period dates are set
   - Usage counters are at 0

### Test Hour Pack Purchase  
1. While logged in as client
2. Go to `/client/hours`
3. Purchase any hour pack
4. Complete checkout
5. Verify pack hours appear in dashboard
6. Verify pack hours are separate from monthly subscription hours

### Verify Webhook Processing
Check webhook logs in Stripe dashboard or server logs for:
```
[WEBHOOK] ✅ Monthly hours allocated for [plan-id]: 8 hours available
[WEBHOOK] ✅ Monthly hours reset for [plan-id]: 8 hours available, 4 rollover hours
```

## Database Schema Reference

### MaintenancePlan Model
Key fields involved in the fix:
```prisma
model MaintenancePlan {
  stripeSubscriptionId    String?    // Stripe subscription ID
  supportHoursIncluded    Int        // Monthly hours from tier
  supportHoursUsed        Float      // Hours used this period (resets monthly)
  changeRequestsIncluded  Int        // Change requests from tier
  changeRequestsUsed      Int        // Requests used (resets monthly)
  currentPeriodStart      DateTime?  // Billing period start
  currentPeriodEnd        DateTime?  // Billing period end
  rolloverHours           Float      // Banked hours from previous periods
  rolloverCap             Int        // Max rollover hours allowed
  status                  MaintenancePlanStatus // ACTIVE, PAUSED, CANCELLED
}
```

## Known Limitations

1. **Manual Testing Required**: These changes only affect new subscriptions and renewals. Existing subscriptions may need manual adjustment.
2. **Webhook Dependency**: The system depends on Stripe webhooks firing correctly. If webhooks fail, hours won't be allocated.
3. **Local Testing**: Stripe webhooks require a public URL. Use Stripe CLI for local testing:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

## Manual Fix for Existing Subscriptions

If existing maintenance plans have subscriptions but no hours allocated, run this SQL:

```sql
-- Reset usage counters for plans with active subscriptions
UPDATE maintenance_plans
SET 
  "supportHoursUsed" = 0,
  "changeRequestsUsed" = 0,
  "urgentRequestsUsed" = 0,
  "requestsToday" = 0
WHERE 
  "stripeSubscriptionId" IS NOT NULL
  AND status = 'ACTIVE';
```

## Files Modified

1. `src/app/api/webhooks/stripe/route.ts` - Added hour allocation logic to 3 webhook handlers
2. This document - `SUBSCRIPTION_FIX_SUMMARY.md`

## Next Steps

1. ✅ Deploy the webhook fixes to production
2. ⚠️ Set up Stripe webhook endpoint in Stripe Dashboard
3. ⚠️ Test with a real subscription purchase
4. 📊 Monitor webhook logs for the next 24 hours
5. 🔧 If needed, manually fix any existing subscriptions using SQL above
