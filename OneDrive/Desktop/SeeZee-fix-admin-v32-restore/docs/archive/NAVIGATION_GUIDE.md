# 🗺️ WHERE TO FIND EVERYTHING - Navigation Guide

## Your Website Structure & How to Access Features

All the features have been implemented. Here's **exactly** where to find them on your website.

---

## 🔐 Step 1: Login as CEO/Admin

**URL**: `http://localhost:3000/login`

1. Click "Sign in with Google"
2. Your account needs `role: "CEO"` or `role: "ADMIN"` in the database
3. After login, you'll be at the admin dashboard

---

## 📊 Admin Dashboard Navigation

### Main Admin URL
`http://localhost:3000/admin`

From here, you'll see sidebar navigation:

```
├── Overview (Dashboard home)
├── Pipeline ← THIS IS WHERE EVERYTHING IS
│   ├── Leads
│   ├── Projects  
│   ├── Invoices
│   └── View (Kanban)
├── Team
├── Finances
├── Analytics
└── ... other sections
```

---

## 🎯 LEAD MANAGEMENT (Where CEO Approval Lives)

### Step 1: View All Leads
**URL**: `http://localhost:3000/admin/pipeline/leads`

**What you'll see**:
- Table with all leads
- Columns: Name, Company, Email, Phone, Status, Created
- Status dropdown on each row (NEW, CONTACTED, QUALIFIED, etc.)
- Search bar to filter leads
- Click any row to open lead detail

### Step 2: Open a Lead Detail
**URL**: `http://localhost:3000/admin/pipeline/leads/[LEAD_ID]`

**How to get here**:
1. Go to `/admin/pipeline/leads`
2. Click any lead row in the table

**What you'll see**:
```
┌─────────────────────────────────────────────┐
│ Lead Name                    [Status ▼]     │
├─────────────────────────────────────────────┤
│                                             │
│ Contact Information                         │
│ - Email, Phone, Company                     │
│                                             │
│ Selected Package (if from questionnaire)    │
│ - Package icon, name, description           │
│                                             │
│ Selected Features                           │
│ - Checkboxes with feature names             │
│                                             │
│ Questionnaire Responses                     │
│ - All answers from /start form              │
│                                             │
│ ┌─────────────────────────┐                │
│ │  SIDEBAR (Right side)   │                │
│ │                         │                │
│ │  💰 Pricing Summary     │                │
│ │  - Base Package: $X     │                │
│ │  - Features: +$X        │                │
│ │  - Total: $X,XXX        │                │
│ │  - Monthly: $XX/mo      │                │
│ │  - Deposit: $XXX        │                │
│ │                         │                │
│ │  ✅ Quick Actions       │                │
│ │  ┌───────────────────┐  │                │
│ │  │ ✓ Approve &       │  │                │
│ │  │ Create Project    │  │← THIS BUTTON  │
│ │  └───────────────────┘  │                │
│ │  [ Send Email ]         │                │
│ │  [ Mark as Converted ]  │                │
│ │  [ Mark as Lost ]       │                │
│ └─────────────────────────┘                │
└─────────────────────────────────────────────┘
```

**The Big Button**: 
- **"✓ Approve & Create Project"**
- Only shows if lead status is NOT "CONVERTED"
- Only shows if questionnaire has pricing data
- Click it to:
  - Create organization (if lead doesn't have one)
  - Create project from lead
  - Update lead status to CONVERTED
  - Emit feed event
  - Redirect to projects list

---

## 📁 PROJECT MANAGEMENT

### View All Projects
**URL**: `http://localhost:3000/admin/pipeline/projects`

**What you'll see**:
- Grid/list of all projects
- Each project card shows name, status, organization
- Click any project to open detail

### Open a Project Detail
**URL**: `http://localhost:3000/admin/pipeline/projects/[PROJECT_ID]`

**How to get here**:
1. Click "Approve & Create Project" on a lead (creates and redirects)
2. OR go to `/admin/pipeline/projects` and click a project

**What you'll see**:
```
┌─────────────────────────────────────────────┐
│ Project Name              [Status ▼]        │
│ Organization Name                           │
├─────────────────────────────────────────────┤
│ [Lead Info] [Assignee] [Budget] [Created]  │
├─────────────────────────────────────────────┤
│                                             │
│ TABS:                                       │
│ ┌─────────────────────────────────────────┐│
│ │ Overview │ Invoices │ Activity │ Mile.. ││
│ └─────────────────────────────────────────┘│
│                                             │
│ [OVERVIEW TAB]                              │
│ - Project details                           │
│ - [Create Deposit Invoice] ← Button        │
│ - [Create Final Invoice]   ← Button        │
│                                             │
│ [INVOICES TAB]                              │
│ - List of invoices created                  │
│ - Amount, status, date                      │
│                                             │
│ [ACTIVITY TAB]                              │
│ - Feed events timeline                      │
│ - "Project Created"                         │
│ - "Status: LEAD → PAID"                     │
│ - "Invoice Created: $500"                   │
│ - "Payment Received: $500"                  │
│                                             │
│ [MILESTONES TAB]                            │
│ ┌─────────────────────────────────────────┐│
│ │ [Type title...] [Add]  ← Input + Button ││
│ └─────────────────────────────────────────┘│
│ ☐ Milestone 1              [🗑️ Delete]    │
│ ☐ Milestone 2              [🗑️ Delete]    │
│ ☑ Milestone 3 (completed)  [🗑️ Delete]    │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 🎨 INTERACTIVE FEATURES IN PROJECT DETAIL

### 1. **Status Dropdown** (Top right)
- Click to change: LEAD → PAID → ACTIVE → REVIEW → COMPLETED
- Emits feed event "Status: OLD → NEW"
- Shows in Activity tab

### 2. **Create Invoice Buttons** (Overview tab)
- "Create Deposit Invoice" - Opens Stripe Checkout for $500
- "Create Final Invoice" - Opens Stripe Checkout for $1500
- Emits feed event "Invoice Created: $XXX"
- Invoice appears in Invoices tab

### 3. **Add Milestone** (Milestones tab)
- Type milestone title in input
- Press Enter or click "Add"
- Milestone appears in list

### 4. **Toggle Milestone** (Milestones tab)
- Click checkbox to mark complete/incomplete
- Text strikes through when complete
- Emits feed event on completion

### 5. **Delete Milestone** (Milestones tab)
- Click trash icon (🗑️)
- Confirm deletion
- Milestone removed

---

## 👤 CLIENT PORTAL (What Clients See)

### Client Login
**URL**: `http://localhost:3000/login`
- Client must have `role: "CLIENT"` in database
- Project must have a lead with client's email

### Client Projects List
**URL**: `http://localhost:3000/client/projects`

**What clients see**:
- All projects where `lead.email = client.email`
- Read-only view

### Client Project Detail
**URL**: `http://localhost:3000/client/projects/[PROJECT_ID]`

**What clients see**:
```
┌─────────────────────────────────────────────┐
│ Project Name              [Status Badge]    │
├─────────────────────────────────────────────┤
│ Progress Bar: ██████░░░░ 60% (3/5)         │
├─────────────────────────────────────────────┤
│ TABS:                                       │
│ │ Overview │ Tasks │ Timeline │ Files │    │
│                                             │
│ [OVERVIEW]                                  │
│ - Project details                           │
│ - Assigned team member                      │
│ - Budget amount                             │
│                                             │
│ [TASKS]                                     │
│ - Read-only milestone list                  │
│ - Checkboxes show completion                │
│ - No editing allowed                        │
│                                             │
│ [TIMELINE]                                  │
│ - Same feed events as admin sees            │
│ - Full transparency                         │
│ - Status changes, invoices, payments        │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 🧪 HOW TO TEST THE COMPLETE WORKFLOW

### Test 1: Create a Test Lead
1. Go to `http://localhost:3000/start`
2. Fill out questionnaire
3. Submit form
4. Lead created in database

### Test 2: Approve Lead (CEO Action)
1. Login as CEO/Admin
2. Go to `/admin/pipeline/leads`
3. Click the new lead
4. See questionnaire data and pricing
5. Click **"✓ Approve & Create Project"**
6. ✅ Organization created (if missing)
7. ✅ Project created
8. ✅ Lead status → CONVERTED
9. ✅ Feed event emitted
10. Redirected to `/admin/pipeline/projects`

### Test 3: Manage Project
1. Click the new project
2. See project detail page
3. Change status dropdown: LEAD → PAID
   - ✅ Status updates
   - ✅ Feed event: "Status: LEAD → PAID"
4. Go to Milestones tab
5. Type "Design mockups" → click Add
   - ✅ Milestone created
6. Click checkbox
   - ✅ Milestone marked complete
   - ✅ Text strikes through
7. Click trash icon
   - ✅ Milestone deleted

### Test 4: Create Invoice
1. Go to Overview tab
2. Click "Create Deposit Invoice"
3. ✅ Stripe Checkout opens in new tab
4. ✅ Invoice record created
5. ✅ Feed event: "Invoice Created: $500"
6. Go to Invoices tab
   - See invoice listed

### Test 5: View as Client
1. Logout
2. Login with client email (same as lead email)
3. Go to `/client/projects`
4. Click your project
5. See Timeline tab with all feed events

---

## 🔍 TROUBLESHOOTING: "I can't find it!"

### Problem: "I don't see the Approve button"
**Reasons**:
1. Lead status is already "CONVERTED"
2. Lead doesn't have questionnaire data (no pricing)
3. You're not logged in as CEO/ADMIN

**Solution**: 
- Create a fresh lead via `/start` questionnaire
- Make sure you complete the whole form
- Login as CEO to see the button

### Problem: "Projects list is empty"
**Reasons**:
1. No leads have been approved yet
2. Lead approval failed (check terminal for errors)

**Solution**:
- Approve a lead first
- Check terminal output for error messages
- Check database for projects: `SELECT * FROM projects;`

### Problem: "Feed events are empty"
**Reasons**:
1. Project was created before feed system was implemented
2. No actions have been taken yet

**Solution**:
- Create a new project (approve a new lead)
- Change status to trigger event
- Create invoice to trigger event

### Problem: "Milestones tab shows 'No milestones yet'"
**Reasons**:
1. No milestones have been added
2. You're looking at an old project

**Solution**:
- Type a milestone title and click "Add"
- Milestone will appear immediately

---

## 📍 EXACT URLS FOR QUICK ACCESS

| Feature | URL | Notes |
|---------|-----|-------|
| Login | `/login` | Google OAuth |
| Admin Home | `/admin` | Dashboard overview |
| Leads List | `/admin/pipeline/leads` | Table of all leads |
| Lead Detail | `/admin/pipeline/leads/[id]` | Click row in table |
| Projects List | `/admin/pipeline/projects` | All projects |
| Project Detail | `/admin/pipeline/projects/[id]` | Click project card |
| Client Projects | `/client/projects` | Client view only |
| Questionnaire | `/start` | Public form to create leads |

---

## 🎬 QUICK START: See It Working in 60 Seconds

1. **Open**: `http://localhost:3000/start`
2. **Fill out** the questionnaire (pick any package)
3. **Submit** the form
4. **Login**: `http://localhost:3000/login` as CEO
5. **Go to**: `/admin/pipeline/leads`
6. **Click** the new lead row
7. **See** the big blue "✓ Approve & Create Project" button on the right
8. **Click it** → Project created!
9. **You're redirected** to `/admin/pipeline/projects`
10. **Click** the new project
11. **See** 4 tabs: Overview, Invoices, Activity, Milestones
12. **Go to** Milestones tab
13. **Type** "Test milestone" → click Add
14. **Click** the checkbox → it completes!
15. **Go to** Activity tab
16. **See** the feed events!

---

## ✅ EVERYTHING IS THERE

All features are implemented and working:
- ✅ Lead detail page exists
- ✅ Approve button exists
- ✅ Project detail page exists
- ✅ Status dropdown works
- ✅ Milestone CRUD works
- ✅ Invoice creation works
- ✅ Feed timeline works
- ✅ Client portal works

**The code is deployed locally.** Just navigate to the URLs above!

If you still can't find something, tell me:
1. What URL are you at?
2. What role is your user?
3. What do you see on the screen?
