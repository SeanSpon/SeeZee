# Package-Based Pricing System - Implementation Guide

**Status**: 🚧 In Progress (Core components completed)  
**Date**: October 12, 2025

## 🎯 Overview

Complete redesign from service-based to package-based pricing model with 3 tiers, pre-configured features, and a $6,000 ceiling.

## 📦 Package Tiers

### Starter ($1,200)
- **Target**: Small businesses, portfolios
- **Included Features**: 4 core features (brand identity, content pages, contact form, mobile responsive)
- **Max Add-ons**: $2,000
- **Total Range**: $1,200 - $3,200

### Pro ($2,800) ⭐ Most Popular
- **Target**: Growing businesses
- **Included Features**: 8 features (Starter + CMS, analytics, email automation, advanced forms)
- **Max Add-ons**: $2,500
- **Total Range**: $2,800 - $5,300

### Elite ($5,500) 👑 Best Value
- **Target**: Premium clients
- **Included Features**: 13 features (Pro + animations, custom graphics, admin panel, API backend, AI chatbot)
- **Max Add-ons**: $500
- **Total Range**: $5,500 - $6,000

## 🧱 Architecture

### New Files Created

1. **`src/lib/qwiz/packages.ts`** - Core configuration
   - `PackageTier` type: 'starter' | 'pro' | 'elite'
   - `PACKAGES` array: 3 tier definitions
   - `FEATURES` array: 18 features with locked/recommended tiers
   - `MAINTENANCE` config: $60/month (required for all)
   - Helper functions: `getPackage()`, `isFeatureLocked()`, etc.

2. **`src/lib/qwiz/store-new.ts`** - State management
   - Steps: 0 (Package) → 1 (Features) → 2 (Questions) → 3 (Contact) → 4 (Review)
   - State: `package`, `features[]`, `totals`, `questionnaire`, `contact`
   - Actions: `setPackage()`, `toggleFeature()`, `setFeatures()` (bulk)

3. **`src/lib/qwiz/pricing-new.ts`** - Pricing calculator
   - `calculateTotals()`: Enforces ceiling and package limits
   - `wouldExceedCeiling()`: Checks before allowing feature toggle
   - `wouldExceedPackageLimit()`: Prevents exceeding tier max add-ons
   - `getRemainingBudget()`: Shows available add-on budget

4. **`src/components/qwiz/PackageSelector.tsx`** - Step 0
   - 3-card grid with tier comparison
   - Badge highlights ("Most Popular", "Best Value")
   - Pre-selects locked features on tier selection
   - Auto-advances to Step 1 on selection

5. **`src/components/qwiz/FeatureBuilder.tsx`** - Step 1
   - Grouped by category (Design, Functionality, Integrations)
   - Feature states: Locked (included), Recommended, Optional
   - Budget warnings when approaching package limit
   - Locked maintenance section at bottom
   - Prevents toggling features that would exceed limits

6. **`src/components/qwiz/PriceCounter-new.tsx`** - Sticky footer
   - Package breakdown: Base + Add-ons + Rush = Total
   - Monthly maintenance display
   - Deposit calculation (25% or $250 min)
   - Hidden on Step 0 (package selection)

## 🎨 Feature Categories

### Design & Branding (4 features)
- **Brand Identity** (Free) - Locked in all tiers
- **Motion Design** ($300) - Locked in Elite, recommended for Pro
- **Custom Graphics** ($400) - Locked in Elite, recommended for Pro
- **3D Elements** ($600) - Optional add-on

### Functionality (9 features)
- **Content Pages** (Free) - Locked in all
- **Mobile Responsive** (Free) - Locked in all
- **Contact Form** (Free) - Locked in all
- **Advanced Forms** ($200) - Locked in Pro/Elite
- **Content Manager** ($250) - Locked in Pro/Elite
- **Admin Dashboard** ($700) - Locked in Elite
- **E-commerce** ($800) - Optional add-on
- **Booking System** ($500) - Optional add-on
- **User Accounts** ($300) - Optional add-on

### Integrations (5 features)
- **Payment Gateway** ($150) - Optional
- **Email Automation** ($200) - Locked in Pro/Elite
- **Analytics Dashboard** ($250) - Locked in Pro/Elite
- **Custom Backend** ($600) - Locked in Elite
- **AI Chatbot** ($400) - Locked in Elite

## 💰 Pricing Rules

### Ceilings & Limits
- **Global ceiling**: $6,000 max project cost
- **Starter max add-ons**: $2,000 (total $3,200 max)
- **Pro max add-ons**: $2,500 (total $5,300 max)
- **Elite max add-ons**: $500 (total $6,000 max)

### Additional Fees
- **Rush delivery** (+15%): If timeline < 3 weeks
- **Maintenance** ($60/mo): Required for all packages
- **Deposit** (25%): Minimum $250 to start

### Enforcement
- Feature toggle disabled when budget exceeded
- Visual warnings at 80% of package limit
- Error state at 100% with "Contact for custom quote" message

## 🔄 User Flow

```
Step 0: Package Selection
├─ View 3 tiers side-by-side
├─ Compare features, pricing, included items
├─ Select tier → pre-load locked features → Step 1

Step 1: Feature Builder
├─ See locked features (✓ Included badge)
├─ See recommended features (⭐ badge)
├─ Toggle optional features
├─ Budget bar shows remaining add-on capacity
├─ Locked maintenance section
└─ Next → Step 2

Step 2: Questionnaire (unchanged)
Step 3: Contact Info (unchanged)
Step 4: Review & Submit (needs update)
```

## 📝 Migration Checklist

### ✅ Completed
- [x] Package configuration (`packages.ts`)
- [x] New store architecture (`store-new.ts`)
- [x] Pricing calculator (`pricing-new.ts`)
- [x] Package selector component
- [x] Feature builder component
- [x] Price counter component

### 🚧 In Progress
- [ ] Update `/start` page to use new components
- [ ] Integrate with existing questionnaire/contact forms
- [ ] Update review component for package breakdown

### ⏳ Pending
- [ ] Server action updates (save package selection)
- [ ] Stripe checkout integration
- [ ] Email template updates
- [ ] Admin dashboard views
- [ ] Testing & QA

## 🧪 Testing Plan

### Tier Selection
1. Select Starter → verify 4 locked features pre-selected
2. Add features → verify max $2,000 add-ons enforced
3. Try to exceed → verify toggle disabled with warning

### Feature Customization
1. Toggle optional features → verify price updates
2. Approach package limit → verify warning appears
3. Reach limit → verify error state with CTA

### Edge Cases
1. Start Starter → switch to Elite mid-flow
2. Select many features → verify $6k ceiling enforced
3. Add rush delivery → verify 15% fee applied
4. Submit with 0 add-ons → verify base package price only

### Cross-browser
- Chrome, Firefox, Safari (desktop)
- Mobile responsive at 375px, 768px, 1024px

## 🎯 Business Impact

### Old Model (Service-based)
- Website: $2,000 + features → $2,000-$4,000
- App: $4,000 + features → $4,000-$8,000
- Maintenance: Optional upsell

### New Model (Package-based)
- **Starter**: $1,200-$3,200 (lower barrier to entry)
- **Pro**: $2,800-$5,300 (better value perception)
- **Elite**: $5,500-$6,000 (premium positioning)
- Maintenance: **Required** ($60/mo all tiers)

### Conversion Improvements
1. **Clear tiers** → easier decision-making
2. **Pre-configured packages** → faster selection
3. **Locked features** → better value communication
4. **Required maintenance** → guaranteed recurring revenue
5. **Price ceiling** → no "sticker shock" on checkout

### Revenue Model
- **One-time**: $1,200-$6,000 (per project)
- **Recurring**: $60/mo × 100 clients = $6,000/mo = $72,000/year
- **LTV Example**: $3,000 project + ($60 × 24 months) = $4,440 over 2 years

## 📚 Environment Variables

```env
# Package Base Prices (in cents)
PKG_STARTER_BASE=120000  # $1,200
PKG_PRO_BASE=280000      # $2,800
PKG_ELITE_BASE=550000    # $5,500

# Feature Prices (same as before)
F_MOTION_DESIGN=30000           # $300
F_VISUAL_ASSETS=40000           # $400
F_3D_VISUALS=60000              # $600
F_SMART_FORMS=20000             # $200
F_CONTENT_MANAGER=25000         # $250
F_ADMIN_PANEL=70000             # $700
F_ONLINE_STORE=80000            # $800
F_SCHEDULER=50000               # $500
F_ACCOUNT_SYSTEM=30000          # $300
F_PAYMENT_GATEWAY=15000         # $150
F_AUTO_EMAILS=20000             # $200
F_INSIGHTS_PANEL=25000          # $250
F_API_BACKEND=60000             # $600
F_CHAT_INTEGRATION=40000        # $400

# Maintenance
MAINTENANCE_MONTHLY=6000        # $60/month
```

## 🚀 Next Steps

1. **Integrate new components** into `/start` page
2. **Update review component** to show package breakdown
3. **Test complete flow** with all 3 tiers
4. **Update server actions** to handle package data
5. **Deploy** and monitor conversion rates

---

**Questions?** Check `packages.ts` for configuration details or `FeatureBuilder.tsx` for UI implementation.
