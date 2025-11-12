# Stripe Environment Variables for Vercel

**Date:** November 12, 2025  
**Project:** SeeZee (see-zee.com)

---

## ⚠️ IMPORTANT: Keep This File Private - Delete After Setup

This file contains sensitive API keys. **DO NOT commit to Git!**

---

## Add These to Vercel Environment Variables

Go to: https://vercel.com/dashboard → Your Project → Settings → Environment Variables

### Required Variables (Add These Now):

**1. STRIPE_SECRET_KEY**
```
Name: STRIPE_SECRET_KEY
Value: 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
Environment: Production (minimum)
```

**2. STRIPE_PUBLISHABLE_KEY**
```
Name: STRIPE_PUBLISHABLE_KEY
Value: pk_live_51SFFNkJ0wUy263l7VJP3SVapLVAMyoxpNlpscb2MdMUE6u4pFa0DmUpmXfGZCt91miwDerxCH0RRMiqikKAeE8hv00AtTL5zSC
Environment: Production (minimum)
```

**3. STRIPE_WEBHOOK_SECRET**
```
Name: STRIPE_WEBHOOK_SECRET
Value: whsec_pkNNQs958HBEAUXlde3APS272UnmCO0Y
Environment: Production (minimum)
```

---

## Optional: Subscription Price IDs

If you want to use the monthly/annual maintenance subscription features, you need to create 4 products in Stripe Dashboard and add their price IDs here.

**To create these:**
1. Go to Stripe Dashboard → Products
2. Click "Add product"
3. Create each plan with these details:

### Standard Monthly: $50/month
- Name: Standard Monthly Maintenance
- Price: $50.00
- Billing: Monthly
- After creating, copy the Price ID (starts with `price_`)

### Premium Monthly: $90/month
- Name: Premium Monthly Maintenance
- Price: $90.00
- Billing: Monthly

### Standard Annual: $510/year
- Name: Standard Annual Maintenance
- Price: $510.00
- Billing: Yearly

### Premium Annual: $918/year
- Name: Premium Annual Maintenance
- Price: $918.00
- Billing: Yearly

**Then add these to Vercel:**
```
Name: STRIPE_PRICE_STANDARD_MONTHLY
Value: price_1SSVtiJ0wUy263l7S7xwIvHO

Name: STRIPE_PRICE_PREMIUM_MONTHLY
Value: price_1SSVu0J0wUy263l7bLv168kN

Name: STRIPE_PRICE_STANDARD_ANNUAL
Value: price_1SSVv3J0wUy263l7wItA85Ef

Name: STRIPE_PRICE_PREMIUM_ANNUAL
Value: price_1SSVvOJ0wUy263l726XTPdxl
```

---

## After Adding to Vercel:

1. ✅ Save all environment variables
2. ✅ Trigger a new deployment (or it will auto-deploy)
3. ✅ Test the payment flow using the checklist in `STRIPE_PRODUCTION_CHECKLIST.md`
4. ✅ **DELETE THIS FILE** after successfully adding to Vercel

---

## Quick Verification After Deployment:

1. Visit your admin dashboard: https://see-zee.com/admin/ceo/finances
2. Check if Stripe balance loads (confirms API key works)
3. Create a test invoice and try to pay it
4. Check Stripe Dashboard → Webhooks to verify events are being received

---

## Stripe Dashboard Links:

- **Webhooks**: https://dashboard.stripe.com/webhooks
- **API Keys**: https://dashboard.stripe.com/apikeys
- **Products**: https://dashboard.stripe.com/products
- **Customers**: https://dashboard.stripe.com/customers
- **Payments**: https://dashboard.stripe.com/payments

---

## Status: Ready for Production ✅

You have everything needed for Stripe to work in production!

