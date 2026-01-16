# Score System Fix - January 16, 2026

## Problem
The lead scoring system in Marketing & Growth was incomplete. The scoring algorithm calculates 6 components totaling up to 100 points, but only 5 were being stored in the database. This caused score breakdowns to be inaccurate and made it impossible to understand why a prospect had a particular score.

## What Was Missing
The **Google Score** component (0-5 points based on Google ratings and reviews) was being calculated but never stored in the database.

### Scoring Components
- Website Quality: 0-20 points ✅ (was working)
- Revenue Potential: 0-25 points ✅ (was working)
- Category Fit: 0-25 points ✅ (was working)
- Location: 0-15 points ✅ (was working)
- Organization Size: 0-10 points ✅ (was working)
- **Google Rating: 0-5 points** ⚠️ **NOW FIXED**

**Total: Up to 100 points**

## What Was Fixed

### 1. Database Schema
Added `googleScore` field to the `Prospect` model:
```prisma
googleScore Int? // 0-5 (Google rating/reviews score)
```

### 2. API Endpoints Updated
Updated all score calculation endpoints to include `googleScore`:
- `/api/prospects/[id]/recalculate-score` - Single prospect recalculation
- `/api/prospects/recalculate-all` - Bulk recalculation
- `/api/prospects/bulk` - Bulk operations (includes score recalculation)
- `/api/leads/discover-places` - New prospect creation

### 3. UI Component Updated
Updated `ProspectCard` component to display the Google score in the breakdown section with a pink progress bar.

## How to Use

### Recalculate All Existing Prospect Scores
Since existing prospects in the database don't have the `googleScore` field populated, you need to recalculate them. There are 3 ways:

#### Option 1: From Marketing & Growth Dashboard (Easiest)
1. Go to Marketing & Growth > Prospects
2. Select prospects (checkbox in table header for all, or individual ones)
3. Click the purple "Recalculate Scores" button
4. Confirm the action
5. Scores will be recalculated with the new breakdown

#### Option 2: Run Script Locally
```bash
# From the project root directory
npx ts-node scripts/recalculate-all-prospect-scores.ts
```

This will:
- Process all non-converted, non-archived prospects
- Show progress updates every 10 prospects
- Display statistics on score changes
- Show top 10 score increases/decreases

#### Option 3: API Call (For Automation)
```bash
# Make a POST request to recalculate all scores
curl -X POST https://your-domain.com/api/prospects/recalculate-all \
  -H "Content-Type: application/json" \
  -H "Cookie: your-auth-cookie"
```

Note: Requires CEO, CFO, or OUTREACH role.

### View Score Breakdown
1. Go to any prospect in Marketing & Growth
2. Click "More" to expand the card
3. View the "📊 Score Breakdown" section
4. You'll now see 6 components including "Google Rating"

## Verification
To verify the fix is working:
1. Check that new prospects have all 6 score components populated
2. Recalculate existing prospects and verify their breakdown sums to their total score
3. The Google Rating component should show the actual points (0-5) based on:
   - Rating ≥ 4.5 + 50+ reviews = 5 points
   - Rating ≥ 4.0 + 20+ reviews = 4 points
   - Rating ≥ 3.5 + 10+ reviews = 3 points
   - 5+ reviews = 2 points
   - Has rating = 1 point

## Technical Details
- Migration: `prisma/migrations/20260116_add_google_score/migration.sql`
- Database: Field added to production database successfully
- Type Safety: TypeScript interfaces updated in all relevant components

## Next Steps
After deploying this fix:
1. Run the recalculate-all endpoint to update existing prospects
2. Monitor that new prospects are created with all 6 components
3. The scoring system should now be fully transparent and accurate
