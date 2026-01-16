# Where to See Prospect Information

## 📍 Navigation

There are 3 main places to view prospect information:

### 1. `/admin/marketing/prospects` - **Table View** ⭐ BEST FOR SCANNING
**What you see immediately:**
- ✅ Name/Company
- ✅ **Category** (Religious, Education, Healthcare, etc.)
- ✅ **Website URL** (clickable link) or "❌ No Website"
- ✅ Location (City, State)
- ✅ **Google Rating** (⭐ 4.5 with review count)
- ✅ Lead Score (0-100 with color bar)
- ✅ Status (Prospect, Qualified, Contacted, etc.)
- ✅ Email address
- ✅ Phone number

**Features:**
- Filter by website (has/doesn't have)
- Filter by lead score
- Filter by status
- Search by name, company, city, category
- Bulk operations (email, export, archive, delete)
- Checkbox selection for multiple prospects

**Use this when:** You want to quickly scan 50-200 prospects and see website info at a glance


### 2. `/admin/leads` - **Card View** ⭐ BEST FOR DETAILS
**What you see on each card (collapsed):**
- Name/Company
- Lead score with emoji (🔥 Hot, 🌟 Warm, etc.)
- Status badge
- Category
- Location (City, State)
- **Website URL** (clickable link)
- **Google Rating** (⭐ 4.5) and reviews
- First opportunity/insight

**What you see when expanded:**
- 📊 Score breakdown (Website Quality, Revenue Potential, Category Fit, Location, Org Size)
- 📧 Full contact info (Email, Phone, Website, Address)
- 🤖 AI Analysis (reasoning and contact strategy)
- 💡 Opportunities list
- ⚠️ Red flags
- 📅 Timeline (discovered, emailed, opened, replied)
- 📝 Internal notes
- Quick action buttons

**Use this when:** You want to review prospects one-by-one with full details


### 3. `/admin/leads/finder` - Redirects to Prospects
This old route now redirects to `/admin/leads` which shows the card view above.


## 🔍 Discovery Page

### `/admin/marketing/discover`
**Purpose:** Import new prospects from Google Places or Apollo.io

**What gets captured:**
- ✅ Name/Company name
- ✅ Category (auto-detected from business type)
- ✅ Website URL (if they have one)
- ✅ Google Place ID
- ✅ Google Rating (1-5 stars)
- ✅ Google Reviews (count)
- ✅ Phone number
- ✅ Full address
- ✅ City, State, Zip Code
- ✅ Latitude/Longitude
- ✅ Business types (restaurant, church, school, etc.)

**What happens after discovery:**
1. Data is saved to prospects table
2. Lead score is calculated (0-100)
3. Category is assigned
4. You can immediately view them in the prospects table


## 📊 Dashboard Page

### `/admin/leads` - Overview Dashboard
**What you see:**
- Total prospects count
- Qualified leads count
- Contacted this week
- Converted this month
- Links to Discover, Manage Prospects, and Campaigns


## 🎯 What Information Is Available

### Always Visible (Table & Cards):
- ✅ Website URL (if exists) or "No Website"
- ✅ Google rating and reviews
- ✅ Category
- ✅ Location
- ✅ Lead score
- ✅ Status
- ✅ Email
- ✅ Phone

### Available When Expanded (Card View):
- ✅ Score breakdown details
- ✅ AI analysis
- ✅ Opportunities
- ✅ Red flags
- ✅ Full address
- ✅ Timeline of interactions
- ✅ Internal notes
- ✅ Google Place ID


## 💡 Pro Tips

### To Find Prospects WITHOUT Websites:
1. Go to `/admin/marketing/prospects`
2. Click "Filters"
3. Set "Has Website" to "No"
4. Click "Search"
5. You'll see only prospects with "❌ No Website"

### To Find High-Quality Prospects:
1. Go to `/admin/marketing/prospects`
2. Click "Filters"
3. Set "Lead Score" Min to 80
4. Set "Has Website" to "Yes"
5. Click "Search"

### To Export Prospect Data:
1. Go to `/admin/marketing/prospects`
2. Check the boxes for prospects you want
3. Click "Export"
4. You'll get a CSV with all fields including websites

### To See Just the Website URLs:
1. Go to `/admin/marketing/prospects` 
2. Look at the "Website" column (4th column)
3. Click any URL to visit the site
4. Red "❌ No Website" means they don't have one


## 🚀 Quick Access URLs

| Page | URL | Purpose |
|------|-----|---------|
| **Prospects Table** | `/admin/marketing/prospects` | View all with website info |
| **Card View** | `/admin/leads` | Detailed individual cards |
| **Discover New** | `/admin/marketing/discover` | Import from Google Places |
| **Dashboard** | `/admin/leads` | Overview and stats |


## ❓ Troubleshooting

### "I don't see any prospects"
→ Go to `/admin/marketing/discover` and run a discovery

### "The website column shows No Website for everyone"
→ They genuinely don't have websites. Try filtering for "Has Website: Yes"

### "I want to see more details about a prospect"
→ Go to `/admin/leads` card view or click the prospect row

### "How do I know which prospects to contact first?"
→ Sort by lead score, filter for score 80+, and check Google ratings
