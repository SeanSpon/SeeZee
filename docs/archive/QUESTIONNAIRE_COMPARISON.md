# Questionnaire System Comparison

## Two Questionnaires Currently Exist

### 🆕 NEW: Feature-Builder Questionnaire
**URL**: http://localhost:3000/start

**What it looks like**:
- Modern single-page design with dark glass morphism UI
- 5 visual steps with progress bar
- Real-time price calculation counter at bottom
- Framer Motion animations between steps
- Service cards: Website, App, AI Features, Maintenance
- Feature grid with checkboxes and categories
- Sticky price display showing totals

**How to access**:
- Click "get a quote" button on homepage (now updated)
- Click "Start a Project" in navigation menu (now updated)
- Navigate directly to `/start`

**Steps**:
1. Select Service (visual cards)
2. Choose Features (checkbox grid with categories)
3. Answer Questions (8 streamlined questions)
4. Contact Info (with rush delivery option)
5. Review & Submit (quote or checkout)

**Features**:
- ✅ Environment-based pricing
- ✅ State persists on refresh
- ✅ Quote mode (creates Lead)
- ✅ Checkout mode (Stripe payment)
- ✅ Real-time totals with rush fees
- ✅ Single-page UX (no navigation away)

---

### 🕰️ OLD: 29-Step Questionnaire
**URL**: http://localhost:3000/questionnaire

**What it looks like**:
- Multi-page flow with individual step URLs
- Simple form inputs
- "Name or Business" as first step (what you saw in screenshot)
- Each question on separate page
- Continue button navigates to new URL

**How to access**:
- Navigate directly to `/questionnaire`
- Bookmark or direct links to old system

**Steps**:
- 29 individual steps with different URLs
- `/questionnaire/step/name`
- `/questionnaire/step/email`
- etc.

**Status**:
- ⚠️ Still functional (backward compatibility)
- ⚠️ No longer linked from homepage/nav
- ⚠️ Will be deprecated in future

---

## Which One Should You Use?

### Use `/start` (New) For:
- ✅ New projects starting now
- ✅ Modern UX with visual selection
- ✅ Real-time pricing feedback
- ✅ Better mobile experience
- ✅ Configurable pricing via env vars
- ✅ Stripe checkout integration

### Use `/questionnaire` (Old) For:
- ⚠️ Testing backward compatibility only
- ⚠️ Existing links/bookmarks (temporary)
- ⚠️ Will be removed in future release

---

## Testing the New System

**Right now, navigate to**: http://localhost:3000/start

You should see:
1. **NOT** a simple "Name or Business" input
2. **YES** a modern dark UI with:
   - Large heading "Build Your Project"
   - Progress bar showing step 1 of 5
   - Four service cards with icons and prices:
     * 🌐 Website - $2,000
     * 📱 App - $4,000
     * 🤖 AI Features - $800
     * 🔧 Maintenance - $299/mo
   - Sticky price counter at bottom (initially $0)

**If you still see the old page**:
- Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
- Make sure URL is exactly: `localhost:3000/start` (not `/questionnaire`)
- Check dev server reloaded (should see compilation in terminal)

---

## Updated Navigation

I've updated these links to point to the new questionnaire:

1. **Homepage "get a quote" button**: Now goes to `/start` ✅
2. **Navigation "Start a Project"**: Now goes to `/start` ✅

The old `/questionnaire` URL still works but is no longer linked from the site.

---

## Quick Visual Test

When you go to `/start`, you should see something like this:

```
┌─────────────────────────────────────────────────────┐
│  Build Your Project                                  │
│  [━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━] │
│  Step 1 of 5                                         │
│                                                      │
│  ┌─────────────┐  ┌─────────────┐                  │
│  │ 🌐 Website  │  │ 📱 App      │                  │
│  │ $2,000      │  │ $4,000      │                  │
│  └─────────────┘  └─────────────┘                  │
│                                                      │
│  ┌─────────────┐  ┌─────────────┐                  │
│  │ 🤖 AI       │  │ 🔧 Maintain │                  │
│  │ $800        │  │ $299/mo     │                  │
│  └─────────────┘  └─────────────┘                  │
│                                                      │
│                               ┌──────────────────┐  │
│  Price: $0        Deposit: $0 │   Continue →     │  │
│                               └──────────────────┘  │
└─────────────────────────────────────────────────────┘
```

NOT this:
```
┌─────────────────────────────────────────────────────┐
│  Name or Business                                    │
│  Let us know who we're working with                  │
│                                                      │
│  ┌─────────────────────────────────────────────┐   │
│  │ Sean                                         │   │
│  └─────────────────────────────────────────────┘   │
│                                                      │
│                      ┌──────────────┐               │
│                      │  Continue →  │               │
│                      └──────────────┘               │
└─────────────────────────────────────────────────────┘
```
