# 🚀 Marketing & Outreach Quick Start Guide

## ⚡ 5-Minute Setup

### Step 1: Add API Keys (2 minutes)

Add these to your `.env` file:

```env
# Required for prospect discovery
GOOGLE_PLACES_API_KEY=your-key-here

# Required for AI email generation
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Required for sending emails
RESEND_API_KEY=re_your-key-here
RESEND_FROM_EMAIL=sean@see-zee.com

# Optional - for more features
APOLLO_API_KEY=your-apollo-key
HUNTER_API_KEY=your-hunter-key
```

**Get API Keys:**
- **Google Places**: https://console.cloud.google.com/apis/credentials (FREE)
- **Anthropic**: https://console.anthropic.com (~$0.015 per email)
- **Resend**: https://resend.com (FREE up to 3k emails/month)

### Step 2: Verify Resend Domain (3 minutes)

1. Go to https://resend.com/domains
2. Add your domain (see-zee.com)
3. Add DNS records (SPF and DKIM)
4. Wait for verification (~5 minutes)

---

## 🎯 Your First Campaign (10 minutes)

### 1. Discover Prospects (2 minutes)

```
1. Go to: Admin → Marketing → Discover
2. Select: Google Places
3. Location: Louisville, KY
4. Category: Nonprofit Organizations
5. Max Results: 200
6. Click: Start Discovery
```

**Result:** 150-200 nonprofits imported with contact info

### 2. Filter Top Prospects (1 minute)

```
1. Go to: Admin → Marketing → Prospects
2. Click: Filters
3. Set: Lead Score Min: 60
4. Set: Has Website: No
5. Click: Search
```

**Result:** High-quality prospects without websites (perfect targets!)

### 3. Send AI-Powered Emails (2 minutes)

```
1. Select: Check prospects you want to email (try 10 first)
2. Click: "Send AI Emails" button
3. Confirm: Yes, send personalized emails
4. Wait: ~20 seconds for AI generation + sending
```

**Result:** Each prospect gets a unique, personalized email!

### 4. Track Results (Ongoing)

```
1. Go to: Admin → Marketing → Outreach
2. View: Open rate, click rate, reply rate
3. Check: Email Performance section
```

**Result:** Real-time analytics on your campaign!

---

## 📊 What You'll See

### Prospect Discovery Results
```
✅ Discovery Complete!
   200 new prospects imported
   Found: 235 total • Skipped: 35 duplicates
```

### Email Sending Results
```
✅ Bulk Email Success!
   Sent: 10 emails
   Failed: 0
   Rate: 10 per minute
```

### Dashboard Analytics
```
📈 Key Metrics:
   Total Prospects: 200
   Conversion Rate: 0%  (new campaign)
   Open Rate: 0%       (wait 24hrs)
   Reply Rate: 0%      (wait 48hrs)
```

---

## 💡 Pro Tips

### For Best Results

1. **Start Small**: Send to 10-20 prospects first
2. **Test Yourself**: Send one to your own email to see what they get
3. **Wait 24hrs**: Check analytics after a day
4. **Follow Up**: Send follow-ups after 5-7 days
5. **Score High**: Focus on lead score > 60

### Email Best Practices

- ✅ DO: Personalize with AI
- ✅ DO: Mention their location
- ✅ DO: Reference their Google reviews
- ✅ DO: Offer free consultation
- ❌ DON'T: Sound too salesy
- ❌ DON'T: Use spam trigger words
- ❌ DON'T: Send more than 50/day when starting

### Common Mistakes to Avoid

1. **Sending to everyone** - Filter first!
2. **No follow-ups** - 80% of sales need 5+ touches
3. **Generic emails** - Always use AI personalization
4. **Ignoring bounces** - Clean your list monthly
5. **No testing** - Send to yourself first

---

## 🎨 Example AI-Generated Email

Here's what Claude generates for a Louisville nonprofit with no website:

```
Subject: Quick thought about your online presence

Hi [Name],

I noticed [Organization] doing amazing work in Louisville. Your 4.8-star 
Google rating shows the community really values what you do.

I'm Sean from SeeZee Studio (also Louisville-based). We specialize in 
helping nonprofits like yours establish a professional web presence that 
matches the quality of your work. Starting at $2,499.

Would you be open to a quick 15-minute chat about how a website could 
help you reach more people? No pressure—just wanted to share what's 
possible.

Best,
Sean McCulloch
SeeZee Studio
sean@see-zee.com | see-zee.com
Louisville, Kentucky
```

**Why this works:**
- ✅ Personalized with their name and org
- ✅ Mentions specific detail (4.8-star rating)
- ✅ Local connection (Louisville)
- ✅ Clear value proposition
- ✅ Soft call-to-action
- ✅ Professional signature

---

## 📈 Expected Results (First 30 Days)

### Week 1
- Import: 200-500 prospects
- Send: 50-100 emails
- Opens: 30-40% (15-40 opens)
- Replies: 5-10% (2-10 replies)

### Week 2
- Send: Follow-ups to non-responders
- Opens: 20-30% (follow-ups get less)
- New replies: 3-5% (cumulative 8-15%)

### Week 3
- Send: Second follow-up
- Total replies: 10-20% cumulative
- Meetings scheduled: 2-5

### Week 4
- Proposals sent: 1-3
- Deals closed: 0-1 (typical sales cycle 30-90 days)

**Realistic Goals:**
- Month 1: 2-5 qualified leads
- Month 2: 5-10 qualified leads
- Month 3: First client closed

---

## 🔥 Advanced Features

### Bulk Operations

```typescript
// Select 100+ prospects
1. Apply filters
2. Click "Select All"
3. Choose action:
   - Archive (safe, reversible)
   - Delete (max 500, permanent)
   - Add Tags (organize by campaign)
   - Export CSV (backup data)
```

### Advanced Filtering

```typescript
// Target specific segments
Filters:
  - Lead Score: 70-100 (high quality)
  - City: Louisville (local only)
  - Has Website: No (bigger opportunity)
  - Status: Prospect (not contacted yet)
  - Tags: nonprofit, education (categories)
```

### AI Email Customization

```typescript
// Control AI generation
aiParams: {
  campaignGoal: 'introduce_services',
  tone: 'professional', // or 'friendly', 'casual'
  includeWebsiteAudit: true,
  includePortfolio: true,
  includePricing: true,
}
```

---

## 🛟 Troubleshooting

### "No prospects showing"
```bash
✅ Solution:
1. Go to Discover page
2. Run discovery
3. Wait for import
4. Refresh Prospects page
```

### "Emails not sending"
```bash
✅ Check:
1. RESEND_API_KEY is set
2. Domain is verified in Resend
3. RESEND_FROM_EMAIL matches verified domain
4. Prospects have valid emails
```

### "AI generation fails"
```bash
✅ Check:
1. ANTHROPIC_API_KEY is set
2. Billing is active at anthropic.com
3. API quota not exceeded
```

### "Tracking not working"
```bash
✅ Check:
1. NEXTAUTH_URL is correct
2. Routes exist at /api/track/...
3. Emails are HTML (not plain text only)
```

---

## 💰 Cost Calculator

### Monthly Costs (Light Usage)

**Scenario: 100 emails/month**

```
Google Places API:   $0      (free tier)
Resend Emails:       $0      (free up to 3k/month)
Anthropic AI:        $1.50   (100 emails × $0.015)
─────────────────────────────
Total:               $1.50/month
```

**Scenario: 1,000 emails/month**

```
Google Places API:   $0      (free tier)
Resend Emails:       $0      (free up to 3k/month)
Anthropic AI:        $15     (1,000 emails × $0.015)
─────────────────────────────
Total:               $15/month
```

**Scenario: 3,000 emails/month (scale)**

```
Google Places API:   $0      (free tier)
Resend Emails:       $20     (paid tier starts here)
Anthropic AI:        $45     (3,000 emails × $0.015)
Optional:
  - Apollo.io:       $49     (if using B2B database)
  - Hunter.io:       $49     (if using email finder)
─────────────────────────────
Base Total:          $65/month
With Optional:       $163/month
```

**Compare to Alternatives:**
- HubSpot Marketing: $800+/month
- Salesforce: $1,200+/month  
- Apollo.io alone: $49+/month

**Your System: $1.50-$65/month** 💰

---

## ✅ Pre-Launch Checklist

- [ ] API keys added to `.env`
- [ ] Resend domain verified (SPF/DKIM)
- [ ] Test email sent to myself
- [ ] Discovery run (50 prospects test)
- [ ] Prospects reviewed and scored
- [ ] Test campaign (5-10 emails)
- [ ] Tracking verified (opens/clicks)
- [ ] Analytics dashboard checked
- [ ] Backup CSV exported
- [ ] Follow-up calendar created

---

## 🎉 You're Ready!

Your professional marketing and outreach system is complete and ready to generate leads.

**Next Steps:**
1. ✅ Complete the checklist above
2. ✅ Send your first 10 emails
3. ✅ Monitor results for 24 hours
4. ✅ Send follow-ups after 5-7 days
5. ✅ Scale to 50-100 emails/week

**Remember:**
- Quality > Quantity
- Personalization is key
- Follow-ups close deals
- Track everything
- Iterate and improve

🚀 **Happy prospecting!**

---

## 📚 Learn More

- Full Documentation: `MARKETING_OUTREACH_SYSTEM.md`
- Code Documentation: See inline comments in source files
- API Reference: `/server/actions/outreach.ts`

Need help? Check the troubleshooting section or review the full documentation.
