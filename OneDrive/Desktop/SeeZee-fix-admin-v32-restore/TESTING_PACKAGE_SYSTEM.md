# Testing the New Package-Based System 🧪

**Status**: ✅ Ready for Testing  
**URL**: http://localhost:3000/start

## 🎯 What Changed

### Old System (Service-based)
- Step 1: Select service (Website, App, AI, Maintenance)
- Step 2: Add features (à la carte)
- Step 3: Maintenance upsell
- Steps 4-6: Questions, Contact, Review

### New System (Package-based)
- **Step 0**: Choose package tier (Starter, Pro, Elite)
- **Step 1**: Customize features (locked features pre-selected)
- **Step 2**: Answer questions (unchanged)
- **Step 3**: Contact info (unchanged)
- **Step 4**: Review & submit (updated with package breakdown)

## 📋 Test Plan

### ✅ Test 1: Package Selection (Step 0)

**Navigate to**: http://localhost:3000/start

**Expected**:
- See 3 package cards: Starter, Pro, Elite
- "Most Popular" badge on Starter
- "Best Value" badge on Elite
- Starting prices: $1,200, $2,800, $5,500
- Each card shows preview of included features

**Actions**:
1. Click "Select Starter"
2. Verify it advances to Step 1 (Feature Builder)
3. Go back and try "Select Pro"
4. Go back and try "Select Elite"

**Check**:
- [ ] All 3 packages selectable
- [ ] Smooth animation to Step 1
- [ ] Package icon appears in price counter
- [ ] Locked features are pre-checked in Step 1

---

### ✅ Test 2: Feature Customization (Step 1)

**After selecting a package**:

**Expected**:
- Features grouped by category (Design, Functionality, Integrations)
- Locked features show "✓ Included" badge (can't be unchecked)
- Recommended features show "⭐ Recommended" badge
- Optional features can be toggled on/off
- Maintenance section at bottom (locked, required)
- Price counter at bottom shows breakdown

**Actions for Starter Package**:
1. Verify 4 features are locked: Brand Identity, Content Pages, Contact Form, Mobile Responsive
2. Try to toggle a locked feature → should not uncheck
3. Add "Motion Design" ($300) → price should increase
4. Add "Admin Panel" ($700) → price should increase
5. Keep adding features until you approach $2,000 add-ons limit
6. Watch for budget warning (orange) at ~80% of limit
7. Watch for budget limit (red) at 100% limit

**Check**:
- [ ] Locked features cannot be unchecked
- [ ] Price updates in real-time
- [ ] Budget warnings appear at correct thresholds
- [ ] Can't add features beyond package limit
- [ ] Maintenance section shows $60/month

**Actions for Pro Package**:
1. Verify 8 features are locked (Starter + CMS, Analytics, Email, Forms)
2. Add optional features
3. Verify max add-ons is $2,500

**Actions for Elite Package**:
1. Verify 13 features are locked
2. Only $500 available for add-ons
3. Try to add expensive feature → should hit limit quickly

---

### ✅ Test 3: Price Calculations

**Test pricing accuracy**:

**Starter Examples**:
```
Base: $1,200
+ Motion Design ($300)
+ Custom Graphics ($400)
= $1,900 total

With rush (+15%):
$1,900 × 1.15 = $2,185

Deposit (25%):
$1,900 × 0.25 = $475

Monthly maintenance: $60 (always included)
```

**Pro Examples**:
```
Base: $2,800
+ 3D Visuals ($600)
+ E-commerce ($800)
= $4,200 total

Deposit: $1,050 (25%)
Monthly: $60
```

**Elite Examples**:
```
Base: $5,500
+ 3D Visuals ($600)
= $6,100 → capped at $6,000

Deposit: $1,500 (25%)
Monthly: $60
```

**Check**:
- [ ] Base price matches package
- [ ] Add-ons calculate correctly
- [ ] Rush fee (15%) applies when selected
- [ ] Deposit is 25% or $250 minimum
- [ ] Maintenance is always $60/month
- [ ] Total never exceeds $6,000

---

### ✅ Test 4: Questionnaire (Step 2)

**Same as before**:
- Goals selection (checkboxes)
- Target audience (checkboxes)
- Inspiration URLs (text input)
- Must-have features (text input)
- Timeline (radio buttons)
- Budget (text)
- Content ready (yes/no)
- Design preference (checkboxes)
- Additional notes (textarea)

**Check**:
- [ ] All form fields work
- [ ] Required fields prevent progression
- [ ] Data saves to sessionStorage
- [ ] Can go back without losing data

---

### ✅ Test 5: Contact Info (Step 3)

**Same as before**:
- Name (required)
- Email (required)
- Phone (optional)
- Company (optional)
- Website (optional)
- Rush delivery checkbox (+15% fee)

**Check**:
- [ ] Required validation works
- [ ] Rush checkbox updates price counter
- [ ] Data persists when navigating back/forward

---

### ✅ Test 6: Review (Step 4)

**Expected sections**:
1. **Package Summary**
   - Package icon, title, description
   - Base price and add-ons cost

2. **Included Features**
   - Grid of all locked features with checkmarks
   - Count: "Included Features (X)"

3. **Additional Features**
   - Only shows if add-ons selected
   - List with prices

4. **Maintenance**
   - Shows $60/month with "Required" badge
   - Lists benefits

5. **Contact Info**
   - Name, email, phone, company displayed

6. **Total Breakdown**
   - Project total (large, gradient)
   - Monthly maintenance (green)
   - Deposit amount (25% or $250 min)

**Check**:
- [ ] Package details display correctly
- [ ] Included features list matches package
- [ ] Add-ons only show if selected
- [ ] Contact info displays correctly
- [ ] Pricing matches Step 1 calculations
- [ ] Submit button shows correct label

---

### ✅ Test 7: Submission

**Actions**:
1. Click "Submit Quote Request" (or "Proceed to Checkout")
2. Wait for processing
3. Verify redirect to success page

**Check database**:
```sql
SELECT 
  id,
  data->>'package' as package,
  data->>'features' as features,
  estimate,
  deposit,
  created_at
FROM questionnaires
ORDER BY created_at DESC
LIMIT 1;
```

**Expected**:
- [ ] Questionnaire saved to database
- [ ] Package tier stored in `data` JSON
- [ ] Features array stored
- [ ] Estimate matches calculated total
- [ ] Deposit matches 25% or $250
- [ ] Lead created (if in quote mode)

---

### ✅ Test 8: Edge Cases

**Test 1**: Switch packages mid-flow
1. Select Starter → go to Step 1
2. Go back to Step 0
3. Select Elite
4. Verify locked features updated correctly

**Test 2**: Exceed price ceiling
1. Select Elite ($5,500)
2. Add 3D Visuals ($600)
3. Total should cap at $6,000
4. Try adding more → should be disabled

**Test 3**: Browser refresh
1. Complete Steps 0-2
2. Refresh page (Ctrl+R)
3. Verify sessionStorage persists
4. Verify can continue from current step

**Test 4**: Back navigation
1. Complete all steps
2. Click Back repeatedly
3. Verify no data loss
4. Verify can change selections

**Check**:
- [ ] Package switching updates features correctly
- [ ] $6k ceiling enforced
- [ ] sessionStorage persists across refreshes
- [ ] Back navigation preserves data

---

## 🐛 Known Issues to Watch For

1. **Type errors**: If you see TypeScript errors about missing properties
2. **Import errors**: If old file names are still referenced
3. **Calculation errors**: If totals don't match expected values
4. **UI bugs**: Features not toggling, buttons not working
5. **Database errors**: If save/update actions fail

## 📸 Screenshots to Take

If testing looks good, take screenshots of:
1. Package selector (Step 0)
2. Feature builder with locked features (Step 1)
3. Budget warning state
4. Review page showing package breakdown
5. Price counter at bottom

## ✅ Success Criteria

All tests pass if:
- ✅ All 3 packages selectable
- ✅ Locked features pre-selected and unchangeable
- ✅ Price calculations accurate
- ✅ Budget warnings appear correctly
- ✅ $6k ceiling enforced
- ✅ Full flow completes without errors
- ✅ Data saves to database correctly
- ✅ Review page shows package breakdown

---

**Ready to test?** Navigate to http://localhost:3000/start and start with Test 1! 🚀
