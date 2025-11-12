# Testing the New Feature-Builder Questionnaire

## Quick Start

1. **Visit the questionnaire**: http://localhost:3000/start

2. **Complete the 5 steps**:
   - ✅ Step 1: Select a service (Website, App, AI Features, or Maintenance)
   - ✅ Step 2: Choose additional features from the grid
   - ✅ Step 3: Answer structured questions about your project
   - ✅ Step 4: Enter contact information (toggle rush delivery to see +15% fee)
   - ✅ Step 5: Review selections and submit

## Test Scenarios

### Scenario 1: Quote Mode (Default)

**Setup**: Ensure `.env.local` has:
```env
QWIZ_MODE=quote
```

**Steps**:
1. Go to http://localhost:3000/start
2. Select "Website" ($2,000)
3. Add features: "Premium UI/UX Design" ($500) + "User Authentication" ($500)
4. Fill out questionnaire (any values)
5. Enter contact info (email required)
6. Click "Get Quote"
7. Should redirect to /start/success
8. Check database for new Lead record

**Expected Result**:
- Total: $3,000
- Deposit: $750 (25%)
- Lead created with metadata containing all selections
- Questionnaire status: SUBMITTED

### Scenario 2: Rush Delivery

**Steps**:
1. Same as Scenario 1
2. On Step 4, check "Rush Delivery (< 3 weeks)"
3. Watch price counter update

**Expected Result**:
- Subtotal: $3,000
- Rush Fee: $450 (15%)
- Total: $3,450
- Deposit: $862.50

### Scenario 3: Maintenance Service (Recurring)

**Steps**:
1. Select "Maintenance" ($299/month)
2. Add features (optional)
3. Complete questionnaire
4. Submit

**Expected Result**:
- Price counter shows "per month"
- Monthly recurring fee displayed
- One-time setup fee + monthly subscription

### Scenario 4: State Persistence

**Steps**:
1. Start questionnaire, complete Step 1
2. Select Website service
3. Refresh the page (F5)
4. Should restore to Step 1 with Website still selected
5. Continue to Step 2, add features
6. Close tab
7. Reopen http://localhost:3000/start
8. Should resume where you left off

**Expected Result**:
- State persists across refresh
- Cookie stores qid
- SessionStorage maintains selections
- Can resume via URL: /start?q={qid}

### Scenario 5: Checkout Mode (Stripe)

**Setup**: Update `.env.local`:
```env
QWIZ_MODE=checkout
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Terminal Setup** (for local webhook testing):
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe-questionnaire
```

**Steps**:
1. Complete questionnaire
2. Click "Proceed to Checkout"
3. Redirects to Stripe Checkout
4. Use test card: 4242 4242 4242 4242
5. Complete payment
6. Webhook processes payment
7. Redirects to /start/success

**Expected Result**:
- Stripe Checkout session created
- Line items include: Base service, Add-ons, Rush fee (if selected)
- Payment successful → Project created
- User created (if new email)
- Organization created (if company provided)
- Questionnaire status: PAYMENT_COMPLETE

## Database Queries to Verify

```sql
-- Check questionnaires
SELECT id, "userEmail", data->>'status' as status, "createdAt" 
FROM questionnaires 
ORDER BY "createdAt" DESC 
LIMIT 5;

-- Check leads (quote mode)
SELECT id, name, email, "serviceType", metadata, status, "createdAt"
FROM leads
ORDER BY "createdAt" DESC
LIMIT 5;

-- Check projects (checkout mode)
SELECT id, name, status, "questionnaireId", "stripeCustomerId", "createdAt"
FROM projects
ORDER BY "createdAt" DESC
LIMIT 5;
```

## Price Calculation Validation

Test these combinations and verify totals:

### Test 1: Basic Website
- Service: Website ($2,000)
- Features: None
- Rush: No
- **Expected**: Total $2,000, Deposit $500

### Test 2: Website + Features
- Service: Website ($2,000)
- Features: Premium Design ($500), User Auth ($500), Payment Integration ($750)
- Rush: No
- **Expected**: Total $3,750, Deposit $937.50

### Test 3: App + Rush
- Service: App ($4,000)
- Features: Admin Dashboard ($1,000)
- Rush: Yes (+15%)
- **Expected**: Subtotal $5,000, Rush $750, Total $5,750, Deposit $1,437.50

### Test 4: Minimum Deposit Rule
- Service: AI Features ($800)
- Features: Analytics ($300)
- Rush: No
- **Expected**: Total $1,100, Deposit $275 (25% rule) BUT minimum is $250, so deposit = $275

### Test 5: Maintenance Monthly
- Service: Maintenance ($299/month)
- Features: None
- Rush: No
- **Expected**: Shows monthly pricing, recurring = true

## UI/UX Checks

### Animations
- [x] Service cards have hover scale effect
- [x] Feature grid items scale on click
- [x] Step transitions slide left/right
- [x] Progress bar fills as you advance
- [x] Price counter slides up from bottom

### Validation
- [x] Can't proceed from Step 1 without selecting service
- [x] Step 3 questions marked required prevent continuation
- [x] Email validation on Step 4
- [x] Submit button disabled while loading

### Responsive Design
- [x] Single column layout on mobile
- [x] Grid adjusts for small screens
- [x] Price counter sticks to bottom
- [x] Navigation buttons stack on mobile

## Common Issues & Solutions

### Issue: "Property 'questionnaire' does not exist"
**Solution**: TypeScript language server is slow to update. The code works at runtime. Restart TS server:
```
Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
```

### Issue: Prices not updating
**Solution**: Check browser console for errors. Verify Zustand store is updating:
```javascript
// In browser console
window.useQwizStore.getState()
```

### Issue: State not persisting
**Solution**: 
1. Check browser allows cookies
2. Verify sessionStorage enabled
3. Check cookie: `document.cookie` should include `qid=`

### Issue: Stripe checkout fails
**Solution**:
1. Verify STRIPE_SECRET_KEY in .env.local
2. Check webhook secret matches Stripe CLI
3. Ensure webhook endpoint is accessible

## Success Criteria

✅ User can complete all 5 steps  
✅ Price counter updates in real-time  
✅ State persists across refresh  
✅ Quote mode creates Lead record  
✅ Checkout mode redirects to Stripe  
✅ Webhook creates Project after payment  
✅ Success page displays confirmation  
✅ No console errors during flow  
✅ Mobile responsive layout works  
✅ Animations smooth and performant  

## Next Steps After Testing

1. **Set environment variables** for production pricing
2. **Configure Stripe webhook** in dashboard
3. **Add email notifications** for quote confirmations
4. **Create admin views** to manage quotes
5. **Deploy to Vercel** and test live

---

**Note**: The old 29-step questionnaire is still available at `/questionnaire` for backward compatibility. The new feature-builder is at `/start`.
