# Subscription Pricing and Admin Management Update

## Overview
This update simplifies the subscription pricing model to a single quarterly plan at $2,000 per quarter and adds admin functionality to manually assign subscriptions to clients before their first payment.

## Changes Made

### 1. Pricing Model Simplification

#### Updated Files:
- `src/lib/subscriptionPlans.ts`

#### Changes:
- **Removed** all monthly and annual plan options
- **Kept** only one plan: **Quarterly Maintenance Plan**
- **Price**: $2,000 per quarter (200,000 cents)
- **Features**:
  - Managed hosting & SSL certificate
  - Security & plugin updates
  - Daily automated backups
  - Priority support (24hr response)
  - Content updates (3hrs/quarter)
  - Monthly analytics & performance reports
  - Emergency fixes (same-day)
  - 6 change requests per quarter (2 per month)
  - Strategy consultation calls
  - Performance monitoring & optimization

#### Type Updates:
- Changed `SubscriptionPlanType` from union of 4 types to single type: `'quarterly'`
- Updated `billingCycle` type from `'monthly' | 'annual'` to `'quarterly'`
- Updated utility functions to work with single plan model

### 2. Client Dashboard Updates

#### Updated Files:
- `src/components/client/UpgradeClient.tsx`
- `src/app/(client)/client/upgrade/page.tsx`

#### Changes:
- **Removed** billing cycle toggle (Monthly/Annual)
- **Simplified** UI to show only one plan option
- **Updated** messaging to reflect quarterly billing
- **Changed** button text from "Upgrade" to "Subscribe"
- Plan displays as single card with all features
- Shows "$2,000 per quarter" prominently
- Displays breakdown: "$666.67/month (billed quarterly)"

### 3. Admin Subscription Management

#### New Files Created:
- `src/server/actions/admin-subscriptions.ts` - Server actions for subscription management
- `src/app/api/admin/subscriptions/assign/route.ts` - API routes for admin operations

#### New Features:

##### Server Actions (`admin-subscriptions.ts`):
1. **`assignSubscriptionToProject()`**
   - Manually creates a subscription for a project
   - Creates "manual" subscription ID (prefixed with `manual_`)
   - Sets 90-day period (quarterly)
   - Grants immediate dashboard access
   - No Stripe integration required

2. **`revokeSubscription()`**
   - Cancels manually assigned subscriptions
   - Only works on "manual" subscriptions
   - Paid subscriptions must be managed through Stripe

3. **`updateSubscriptionAllowance()`**
   - Updates change request limits for any subscription
   - Useful for custom arrangements

##### API Routes (`/api/admin/subscriptions/assign`):
- **POST**: Assign new subscription to project
- **DELETE**: Revoke manually assigned subscription
- Both routes protected by CEO/CFO role checks

#### Updated Files:
- `src/components/admin/ClientDetailClient.tsx`
- `src/app/admin/clients/[id]/page.tsx`

#### UI Changes:
- **Added** "Subscriptions" tab to client detail page
- Shows all projects with their subscription status
- For each project displays:
  - Subscription status (Active/None)
  - Plan details if active
  - Change request usage
  - Period end date
  - Manual vs. Paid subscription indicator

##### Admin Actions Available:
- **Assign Subscription** button for projects without active subscription
  - One-click assignment
  - Confirmation dialog
  - Immediate activation
  
- **Revoke Subscription** button for manually assigned subscriptions
  - Only for manual subscriptions
  - Confirmation required
  - Immediate removal of access

##### Visual Indicators:
- Green dot (●) for active subscriptions
- Gray dot (●) for no subscription
- Blue badge for "Manually Assigned" subscriptions
- Yellow alert for projects needing subscription
- Loading states during operations

### 4. Authorization Updates

#### Security:
- All admin subscription endpoints protected
- Requires CEO or CFO role (`UserRole.CEO` or `UserRole.CFO`)
- Uses `getCurrentUser()` from `@/lib/auth/requireRole`
- Revalidates relevant admin paths after changes

## Use Cases

### Admin Workflow:
1. **Project Completion**: Client project is finished
2. **Grant Access**: Admin navigates to client detail page → Subscriptions tab
3. **Assign Subscription**: Click "Assign Subscription" on completed project
4. **Client Gets Access**: Client can immediately access their dashboard
5. **Later Payment**: Client can upgrade to paid subscription through their dashboard
6. **Revoke if Needed**: Admin can revoke manual subscription at any time

### Client Workflow:
1. **Complete Project**: Receives project from SeeZee
2. **Dashboard Access**: Logs in and sees quarterly maintenance option
3. **Subscribe**: Clicks "Subscribe to Quarterly Maintenance Plan"
4. **Payment**: Redirected to Stripe checkout for $2,000
5. **Confirmation**: Returns to dashboard with active subscription
6. **Quarterly Renewal**: Auto-billed every 3 months

## Database Schema

### Subscription Model:
No schema changes required. Uses existing `Subscription` model with:
- `stripeId`: Set to `manual_{timestamp}_{projectId}` for manual subscriptions
- `priceId`: Set to `"manual"` for manual subscriptions
- `status`: `"active"` or `"canceled"`
- `planName`: `"Quarterly Maintenance"`
- `changeRequestsAllowed`: 6 (default)
- `currentPeriodEnd`: 90 days from creation

## Environment Variables

### Required:
```env
STRIPE_PRICE_QUARTERLY=price_xxxxxxxxxxxxx
```

Create this price in Stripe:
- Product: Quarterly Maintenance Plan
- Amount: $2,000
- Billing: Every 3 months
- Currency: USD

## Testing Checklist

### Client Dashboard:
- [ ] Can see quarterly plan at $2,000
- [ ] No monthly/annual toggle visible
- [ ] Can select project for subscription
- [ ] Stripe checkout redirects properly
- [ ] Success page shows after payment

### Admin Dashboard:
- [ ] Can view Subscriptions tab on client detail page
- [ ] Can assign manual subscription to project
- [ ] Manual subscriptions show "Manually Assigned" badge
- [ ] Can revoke manual subscriptions
- [ ] Cannot revoke paid (Stripe) subscriptions
- [ ] Change request counters display correctly
- [ ] Loading states work during operations

### Authorization:
- [ ] Non-admin users cannot access admin subscription endpoints
- [ ] CEO/CFO can access all features
- [ ] Client users cannot assign/revoke subscriptions

## Migration Notes

### For Existing Subscriptions:
- Existing monthly/annual subscriptions remain active
- Will continue to renew on their current schedule
- Admins should communicate new pricing to clients
- Consider grandfathering existing clients or migrating them

### Recommended Migration Path:
1. Deploy changes
2. Let existing subscriptions run to completion
3. When renewals approach, offer new quarterly plan
4. Manually migrate high-value clients if needed

## Future Enhancements

Potential additions:
- Email notifications when admin assigns subscription
- Bulk subscription assignment
- Custom subscription durations
- Subscription history/audit log
- Client-facing subscription management
- Automated reminders for manual subscriptions ending
- Integration with project completion workflow

## Support

### Common Issues:

**Q: Client can't see dashboard**
A: Check if project has active subscription in Admin → Clients → [Client] → Subscriptions tab

**Q: Cannot revoke subscription**
A: Paid subscriptions must be canceled through Stripe dashboard. Only manual subscriptions can be revoked.

**Q: Change requests not incrementing**
A: Verify subscription has `changeRequestsAllowed` and `changeRequestsUsed` fields set correctly.

**Q: Stripe checkout not working**
A: Ensure `STRIPE_PRICE_QUARTERLY` environment variable is set with correct price ID.

## Documentation Updates Needed

- [ ] Update client onboarding documentation
- [ ] Update pricing page (if exists)
- [ ] Update admin manual with subscription management section
- [ ] Update sales team on new pricing model
- [ ] Create email template for manual subscription assignments
