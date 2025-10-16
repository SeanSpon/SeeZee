# 🔧 Maintenance Upsell - Step 3

## Overview

The maintenance plan is now presented as a dedicated upsell step AFTER the client selects their main service (Website, App, or AI Integration). This creates a natural upgrade path and highlights the value of ongoing support.

## Flow Structure

### Step 1: Service Selection (PRIMARY PROJECT)
Choose ONE of:
- 🌐 Website ($2,000)
- 📱 Mobile App ($4,000)
- 🤖 AI Integration ($800)

**Note**: Maintenance is NOT shown here - it's an add-on, not a standalone service initially.

### Step 2: Feature Builder
Select additional features:
- Design & Branding
- Functionality
- Integrations

### Step 3: ⭐ **MAINTENANCE UPSELL** (NEW!)
After selecting their main project, clients see a compelling pitch for ongoing support:

**Benefits Highlighted**:
- 🛡️ Security & Updates (monthly patches, vulnerability monitoring)
- ⚡ Performance Optimization (speed monitoring, database tuning)
- 🔧 Bug Fixes & Support (priority support, quick fixes)
- 🤝 Content Updates (up to 2hrs/month of changes)

**Pricing**: $299/month

**Two Clear Options**:
1. ✅ "Yes, Add Maintenance" (recommended)
2. "No Thanks" (skip for now)

**Alternative Option** (shown at bottom):
- "Already have a website that needs maintenance?"
- We can take over existing sites, perform health checks, fix issues
- Mention in contact form for custom quote

### Step 4: Questionnaire
Answer structured questions about the project

### Step 5: Contact Info
Name, email, company, rush delivery option

### Step 6: Review & Submit
Final review with all selections and pricing

## Why This Approach Works

### 1. **Contextual Timing**
Clients have already:
- Committed to a main project ($2k-$4k)
- Seen the value proposition
- Started visualizing their solution

Now they're primed to think about **long-term success**.

### 2. **Value Framing**
Instead of "Do you want maintenance?" it's:
- "Keep Your Site Running Smoothly"
- "Protect Your Investment"
- Visual benefits with icons
- Clear monthly pricing

### 3. **No Pressure**
- Not required to proceed
- Clear "No Thanks" option
- Can always add later

### 4. **Alternative Path**
The note about existing websites opens a secondary revenue stream:
- Clients with old sites that need help
- Maintenance-only engagements
- Lower barrier to entry
- Builds relationship for future projects

## Pricing Impact

**Example: Website + Maintenance**

Without Maintenance:
- Website: $2,000
- Features: $850
- **Total**: $2,850 one-time
- **Monthly**: $0

With Maintenance:
- Website: $2,000
- Features: $850
- **Total**: $2,850 one-time
- **Monthly**: $299/mo 🎉

**Annual Value**:
- One-time: $2,850
- Recurring: $3,588/year
- **Total Year 1**: $6,438

This turns a $2,850 project into a $6,438+ relationship!

## Implementation Details

### Store State
```typescript
// lib/qwiz/store.ts
{
  maintenance: boolean; // true if selected
  setMaintenance: (value: boolean) => void;
}
```

### Pricing Calculation
```typescript
// lib/qwiz/pricing.ts
calculateTotals(service, features, rush, maintenance)

// If maintenance === true:
// - totals.monthly = $29900 (299.00)
// - totals.recurring = true
```

### Component
```typescript
// components/qwiz/MaintenanceUpsell.tsx
- Visual benefits grid (4 cards)
- Pricing highlight
- Selection buttons
- Alternative option note
```

## Conversion Strategy

### Social Proof (Future Enhancement)
Add to the upsell page:
- "93% of our clients choose ongoing maintenance"
- "Websites with maintenance plans see 47% fewer issues"
- Testimonials from happy maintenance clients

### Risk Reversal
- "Cancel anytime"
- "No long-term contract"
- "First month free when you sign up today" (optional promo)

### Scarcity (Subtle)
- "Limited maintenance slots available"
- "Lock in current pricing"

## Existing Website Maintenance

The alternative option at the bottom serves multiple purposes:

### 1. **Entry Point for Non-Build Clients**
Someone who:
- Already has a website
- It's broken or outdated
- Needs someone to take over

Can start with maintenance-only, then:
- Build trust
- Identify upgrade opportunities
- Upsell to redesign later

### 2. **Lower Commitment**
$299/month is easier to say yes to than $2,000+ project.

### 3. **Revenue While Building Pipeline**
Monthly recurring revenue while you:
- Learn their business
- Identify pain points
- Propose bigger solutions

## Future Enhancements

### 1. **Maintenance Tiers**
Instead of single $299 plan:
- **Basic**: $199/mo (updates only)
- **Standard**: $299/mo (current features)
- **Premium**: $499/mo (4hrs/month content, priority)

### 2. **Annual Discounts**
- Pay annually: 15% off ($3,050 vs $3,588)
- Creates cash flow upfront
- Reduces churn

### 3. **Add-On Services**
Monthly maintenance + optional:
- SEO monitoring: +$99/mo
- Content creation: +$150/mo
- A/B testing: +$75/mo

### 4. **Prepaid Hours Bank**
- Maintenance includes 2hrs/month
- Unused hours roll over (up to 6hrs max)
- Buy additional hours at $150/hr

## Testing the Upsell

Navigate to: http://localhost:3000/start

1. Select "Website" on Step 1
2. Optionally add features on Step 2
3. **See the maintenance upsell on Step 3**
4. Click "Yes, Add Maintenance"
5. Watch the price counter update: "+$299/mo"
6. Complete the flow

**Check database** for:
```sql
SELECT data->>'maintenance' as has_maintenance
FROM questionnaires
WHERE id = 'your-qid';
```

Should return: `true`

## Summary

The maintenance upsell:
- ✅ Positioned at optimal moment (after commitment)
- ✅ Clear value proposition
- ✅ No pressure (optional)
- ✅ Opens maintenance-only revenue stream
- ✅ Dramatically increases LTV (lifetime value)
- ✅ Creates recurring revenue predictability

**Before**: $2,000-$4,000 one-time projects  
**After**: $2,000-$4,000 + $299/mo recurring = $5,588-$7,588 Year 1

This single step could increase annual revenue per client by **180%+**! 🚀
