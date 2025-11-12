# Stripe Production Deployment Checklist for SeeZee

**Domain:** see-zee.com  
**Date:** November 12, 2025  
**Status:** Pre-Deployment Checklist

---

## ✅ Pre-Deployment: Stripe Dashboard Configuration

### 1. Switch to Live Mode
- [ ] Navigate to Stripe Dashboard
- [ ] Toggle from "Test Mode" to "Live Mode" (top right)
- [ ] Confirm you're viewing live data

### 2. Configure Webhook Endpoint
- [ ] Go to **Developers → Webhooks**
- [ ] Click **Add endpoint**
- [ ] Enter URL: `https://see-zee.com/api/webhooks/stripe`
- [ ] Select the following events:
  - [ ] `checkout.session.completed`
  - [ ] `invoice.paid`
  - [ ] `invoice.payment_succeeded`
  - [ ] `invoice.payment_failed`
  - [ ] `customer.subscription.created`
  - [ ] `customer.subscription.updated`
  - [ ] `customer.subscription.deleted`
- [ ] Click **Add endpoint**
- [ ] **Copy the webhook signing secret (starts with `whsec_`)**
- [ ] Save this for environment variables

### 3. Enable Payment Methods
- [ ] Go to **Settings → Payment methods**
- [ ] Ensure **Cards** is enabled (minimum requirement)
- [ ] Optional: Enable ACH Direct Debit, Link, etc.

### 4. Create Subscription Price IDs
- [ ] Go to **Products → Add product**
- [ ] Create 4 products for maintenance plans:

**Standard Monthly Plan:**
- [ ] Name: "Standard Monthly Maintenance"
- [ ] Description: "Essential maintenance and support"
- [ ] Price: $50.00
- [ ] Billing: Monthly
- [ ] **Copy Price ID** (starts with `price_`) → `STRIPE_PRICE_STANDARD_MONTHLY`

**Premium Monthly Plan:**
- [ ] Name: "Premium Monthly Maintenance"
- [ ] Description: "Priority support with extended features"
- [ ] Price: $90.00
- [ ] Billing: Monthly
- [ ] **Copy Price ID** → `STRIPE_PRICE_PREMIUM_MONTHLY`

**Standard Annual Plan:**
- [ ] Name: "Standard Annual Maintenance"
- [ ] Description: "Essential maintenance - save 15%"
- [ ] Price: $510.00
- [ ] Billing: Yearly
- [ ] **Copy Price ID** → `STRIPE_PRICE_STANDARD_ANNUAL`

**Premium Annual Plan:**
- [ ] Name: "Premium Annual Maintenance"
- [ ] Description: "Priority support - save 15%"
- [ ] Price: $918.00
- [ ] Billing: Yearly
- [ ] **Copy Price ID** → `STRIPE_PRICE_PREMIUM_ANNUAL`

### 5. Configure Customer Portal
- [ ] Go to **Settings → Customer portal**
- [ ] Enable customer portal
- [ ] Configure allowed actions:
  - [ ] Update payment method
  - [ ] View billing history
  - [ ] Cancel subscriptions (optional - decide business policy)
- [ ] Set return URL: `https://see-zee.com/client/settings?tab=billing`
- [ ] Save settings

### 6. Configure Email Receipts
- [ ] Go to **Settings → Emails**
- [ ] Enable **Successful payments**
- [ ] Enable **Failed payments**
- [ ] Customize email branding (optional):
  - [ ] Add company logo
  - [ ] Add support email
  - [ ] Customize colors

### 7. Configure Business Information
- [ ] Go to **Settings → Business settings**
- [ ] Fill in:
  - [ ] Business name: "SeeZee Studio" (or your legal name)
  - [ ] Support email
  - [ ] Business address
  - [ ] Phone number
- [ ] Save settings

---

## ✅ Pre-Deployment: Vercel Environment Variables

### 1. Navigate to Vercel Dashboard
- [ ] Go to https://vercel.com/dashboard
- [ ] Select your SeeZee project
- [ ] Go to **Settings → Environment Variables**

### 2. Add Stripe Variables

**Critical - Required for all Stripe functionality:**

```plaintext
STRIPE_SECRET_KEY=sk_live_[your_live_secret_key]
```
- [ ] Add this variable
- [ ] **Important:** Must start with `sk_live_` NOT `sk_test_`
- [ ] Apply to: Production, Preview, Development (or just Production)

```plaintext
STRIPE_PUBLISHABLE_KEY=pk_live_[your_live_publishable_key]
```
- [ ] Add this variable (if using client-side Stripe)
- [ ] **Important:** Must start with `pk_live_` NOT `pk_test_`

```plaintext
STRIPE_WEBHOOK_SECRET=whsec_[your_webhook_secret]
```
- [ ] Add this variable
- [ ] Use the webhook signing secret from Step 1.2 above
- [ ] **Important:** This MUST match the webhook endpoint secret

**Optional - For subscription features:**

```plaintext
STRIPE_PRICE_STANDARD_MONTHLY=price_[from_step_1.4]
STRIPE_PRICE_PREMIUM_MONTHLY=price_[from_step_1.4]
STRIPE_PRICE_STANDARD_ANNUAL=price_[from_step_1.4]
STRIPE_PRICE_PREMIUM_ANNUAL=price_[from_step_1.4]
```
- [ ] Add all 4 price ID variables
- [ ] Use the price IDs created in Step 1.4 above

### 3. Verify Other Required Variables
Ensure these are already set (should be from previous deployments):
- [ ] `AUTH_URL=https://see-zee.com`
- [ ] `NEXTAUTH_URL=https://see-zee.com`
- [ ] `NEXT_PUBLIC_APP_URL=https://see-zee.com`
- [ ] `DATABASE_URL=[your_production_database_url]`

---

## ✅ Deployment: Trigger Production Build

### 1. Deploy to Vercel
- [ ] Push latest code to main branch (or trigger manual deployment)
- [ ] Wait for Vercel deployment to complete
- [ ] Check deployment logs for any errors

### 2. Verify Deployment
- [ ] Visit https://see-zee.com
- [ ] Check homepage loads correctly
- [ ] Check no console errors in browser

---

## ✅ Post-Deployment: Test Payment Flow

### 1. Test Invoice Payment Flow (End-to-End)

**As Admin:**
- [ ] Log in as CEO user (`seanspm1007@gmail.com`)
- [ ] Go to `/admin/pipeline/invoices`
- [ ] Create a test invoice for a client
- [ ] Generate payment link
- [ ] Copy payment URL

**As Client:**
- [ ] Log in as client (or use test client account)
- [ ] Go to `/client/invoices`
- [ ] Find the test invoice
- [ ] Click "Pay Now"
- [ ] Should redirect to Stripe Checkout
- [ ] Complete payment with test card:
  - Card: `4242 4242 4242 4242`
  - Expiry: Any future date
  - CVC: Any 3 digits
  - ZIP: Any 5 digits
- [ ] Should redirect back to success page
- [ ] Verify invoice status updated to "PAID" in client dashboard

**Verify Webhook:**
- [ ] Go to Stripe Dashboard → Developers → Webhooks
- [ ] Click on your webhook endpoint
- [ ] Check recent events - should see `checkout.session.completed`
- [ ] Status should be `200` (success)
- [ ] Check response body shows `{"received":true}`

**Verify Database:**
- [ ] Check `invoices` table - status should be "PAID"
- [ ] Check `payments` table - new payment record created
- [ ] Check `webhook_events` table - event marked as processed

### 2. Test Subscription Creation

**As Client:**
- [ ] Log in to client dashboard
- [ ] Go to `/client/subscriptions`
- [ ] Select a maintenance plan (if UI exists)
- [ ] Complete checkout
- [ ] Verify subscription appears in dashboard

**Verify in Stripe:**
- [ ] Go to Stripe Dashboard → Customers
- [ ] Find the test customer
- [ ] Check "Subscriptions" tab
- [ ] Should see active subscription

### 3. Test Billing Portal

**As Client:**
- [ ] Go to `/client/settings?tab=billing`
- [ ] Click "Manage Billing"
- [ ] Should redirect to Stripe Customer Portal
- [ ] Should see subscription details
- [ ] Should see payment methods
- [ ] Click return URL - should go back to `/client/settings?tab=billing`

---

## ✅ Post-Deployment: Monitoring Setup

### 1. Stripe Dashboard Monitoring
- [ ] Bookmark Stripe Dashboard → Webhooks page
- [ ] Check webhook delivery daily for first week
- [ ] Set up Stripe email notifications for:
  - [ ] Failed payments
  - [ ] Disputes
  - [ ] Large transactions

### 2. Application Monitoring
- [ ] Check admin financial dashboard: `/admin/ceo/finances`
- [ ] Verify Stripe balance displays correctly
- [ ] Verify revenue metrics accurate
- [ ] Verify recent payouts display

### 3. Database Monitoring
- [ ] Query `webhook_events` table periodically
- [ ] Check for any events with `processed = false`
- [ ] Check for any duplicate events

### 4. Error Monitoring
- [ ] Check Vercel logs for Stripe-related errors
- [ ] Monitor `/api/webhooks/stripe` endpoint
- [ ] Set up alerts for 500 errors on payment endpoints

---

## ✅ Final Production Verification

### Stripe Integration Status
- [ ] ✅ Live API keys configured (not test keys)
- [ ] ✅ Webhook endpoint configured and working
- [ ] ✅ All required events enabled
- [ ] ✅ Subscription prices created (if using subscriptions)
- [ ] ✅ Customer portal configured
- [ ] ✅ Email receipts enabled
- [ ] ✅ Business information filled in

### Application Status
- [ ] ✅ All environment variables set in Vercel
- [ ] ✅ Production deployment successful
- [ ] ✅ No console errors on live site
- [ ] ✅ Webhook test successful
- [ ] ✅ Payment flow tested end-to-end
- [ ] ✅ Invoices update correctly
- [ ] ✅ Admin dashboard displays Stripe data
- [ ] ✅ Client dashboard displays invoices/subscriptions

### Security Verification
- [ ] ✅ No API keys exposed in client-side code
- [ ] ✅ No test keys in production
- [ ] ✅ HTTPS enforced on all pages
- [ ] ✅ Webhook signature verification enabled
- [ ] ✅ CORS configured correctly

---

## 🚨 Troubleshooting Common Issues

### Issue: Webhook Delivery Failing

**Symptoms:** Payments complete but invoices not updating

**Solution:**
1. Check Stripe Dashboard → Webhooks → Your endpoint
2. Look for failed attempts (red X)
3. Click on failed event to see error message
4. Common fixes:
   - Ensure endpoint URL is correct: `https://see-zee.com/api/webhooks/stripe`
   - Verify `STRIPE_WEBHOOK_SECRET` matches Stripe Dashboard
   - Check Vercel logs for errors in webhook handler
   - Ensure endpoint is accessible (not behind auth middleware)

### Issue: "Invalid API Key" Error

**Symptoms:** 401 errors from Stripe API

**Solution:**
1. Verify `STRIPE_SECRET_KEY` in Vercel environment variables
2. Ensure it starts with `sk_live_` not `sk_test_`
3. Check Stripe Dashboard → API keys for correct live secret key
4. Ensure no spaces or quotes around the key

### Issue: Checkout Session Not Creating

**Symptoms:** Error when clicking "Pay Now" button

**Solution:**
1. Check browser console for errors
2. Check Vercel logs for API endpoint errors
3. Verify customer email is valid
4. Ensure invoice has items and total > 0
5. Check `NEXT_PUBLIC_APP_URL` or `NEXTAUTH_URL` is set correctly

### Issue: Subscription Not Showing in Dashboard

**Symptoms:** Subscription created in Stripe but not showing in app

**Solution:**
1. Check webhook delivery (Stripe Dashboard → Webhooks)
2. Verify `customer.subscription.created` event was sent
3. Check database `subscriptions` table for new record
4. Ensure project has `stripeCustomerId` set
5. Check Vercel logs for webhook processing errors

---

## 📞 Support Resources

### Stripe Support
- **Dashboard:** https://dashboard.stripe.com
- **Documentation:** https://stripe.com/docs
- **Support:** https://support.stripe.com

### Application Files Reference
- **Stripe Client:** `src/lib/stripe.ts`
- **Webhook Handler:** `src/app/api/webhooks/stripe/route.ts`
- **Invoice Payment:** `src/app/api/invoices/[id]/pay/route.ts`
- **Subscription Plans:** `src/lib/subscriptionPlans.ts`
- **Financial Dashboard:** `src/app/admin/ceo/finances/page.tsx`

---

## ✅ Checklist Complete

Once all items are checked:
- [ ] **All Stripe Dashboard configuration complete**
- [ ] **All environment variables set in Vercel**
- [ ] **Deployment successful**
- [ ] **End-to-end payment flow tested**
- [ ] **Webhooks verified working**
- [ ] **Monitoring set up**

**Status:** Ready for Production ✅

---

**Next Steps After Going Live:**
1. Monitor webhook delivery for first 24 hours
2. Check admin financial dashboard daily for first week
3. Test with real payment within first week
4. Set up monthly financial review process
5. Document any issues encountered and solutions

