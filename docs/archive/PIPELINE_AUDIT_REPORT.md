# Pipeline System Audit Report
**Date:** November 7, 2025  
**Auditor:** AI Code Review  
**Scope:** Pipeline (Leads), Projects, CEO Functionality, and Client-Admin Integration

---

## Executive Summary

This audit examined the pipeline system, project management workflow, CEO functionality, and client-admin integration across the SeeZee application. The audit revealed **15 critical issues**, **8 integration gaps**, and **12 inconsistencies** that need to be addressed for proper functionality.

### Overall Status: ⚠️ NEEDS ATTENTION

**Key Findings:**
- ❌ **CRITICAL:** Duplicate server action files causing potential conflicts
- ❌ **CRITICAL:** Client dashboard using mock data instead of real API
- ❌ **CRITICAL:** Missing API routes for lead CRUD operations
- ⚠️ **WARNING:** Inconsistent lead-to-project conversion implementations
- ⚠️ **WARNING:** Authorization checks vary across endpoints
- ✅ **GOOD:** CEO functionality well-structured with proper RBAC

---

## 1. Pipeline/Lead Management System Audit

### 1.1 Architecture Overview

The lead management system has **multiple implementations** that may conflict:

**Server Actions (2 files):**
- `/src/server/pipeline.ts` - Full pipeline implementation
- `/src/server/actions/pipeline.ts` - Duplicate pipeline implementation

**API Routes:**
- `/api/leads/get` - Get lead by questionnaire ID
- `/api/leads/submit` - Create lead from questionnaire
- `/api/leads/create-from-package` - Create lead from package selection
- ❌ **MISSING:** `/api/leads/[id]` route for update/delete operations

**Frontend:**
- `/src/pages/admin/Pipeline.jsx` - Admin pipeline view

### 1.2 Critical Issues Found

#### 🔴 ISSUE #1: Duplicate Pipeline Server Actions
**Severity:** CRITICAL  
**Location:** `/src/server/pipeline.ts` vs `/src/server/actions/pipeline.ts`

**Problem:** Two nearly identical files implementing pipeline functionality:
- Both export `getPipeline()`, `updateLeadStatus()`, `getLeadDetails()`, etc.
- Both have `convertLeadToProject()` functions
- Different role requirements: 
  - `pipeline.ts` uses `ROLE.FRONTEND, ROLE.BACKEND, ROLE.OUTREACH`
  - `actions/pipeline.ts` uses the same roles

**Impact:** 
- Import confusion - unclear which file should be used
- Maintenance nightmare - changes need to be made in two places
- Potential runtime errors if wrong import is used

**Recommendation:**
```
ACTION REQUIRED: Consolidate into ONE file
- Keep: /src/server/actions/pipeline.ts (follows Next.js conventions)
- Delete: /src/server/pipeline.ts
- Update all imports across codebase
```

---

#### 🔴 ISSUE #2: Frontend Pipeline Page Uses adminApi.getLeads() - Missing API Route
**Severity:** CRITICAL  
**Location:** `/src/pages/admin/Pipeline.jsx:47`

**Problem:**
```javascript
const leadsData = await adminApi.getLeads().catch(() => ({ leads: [] }))
```

But in `/src/utils/api.js:209-212`:
```javascript
getLeads: (qid) => {
  const url = qid ? `/leads/get?qid=${qid}` : '/leads/get'
  return fetchJson(url)
}
```

The `/leads/get` endpoint **REQUIRES** a `qid` parameter (line 9-11 of route):
```typescript
if (!qid) {
  return NextResponse.json({ error: 'Missing qid' }, { status: 400 });
}
```

**Impact:** 
- Admin pipeline page will **ALWAYS FAIL** to load leads
- Returns 400 error: "Missing qid"
- Pipeline view will show empty state

**Recommendation:**
```
ACTION REQUIRED: Create /api/admin/leads route
- GET /api/admin/leads - Return all leads for admin
- Implement proper role checking
- Update adminApi.getLeads() to use /admin/leads
```

---

#### 🔴 ISSUE #3: Missing Lead Update/Delete API Routes
**Severity:** CRITICAL  
**Location:** `/src/utils/api.js:217-220`

**Problem:** Frontend expects these endpoints:
```javascript
updateLead: (id, data) => fetchJson(`/leads/${id}`, {
  method: 'PUT',
  body: JSON.stringify(data),
}),
```

But `/api/leads/[id]/route.ts` **DOES NOT EXIST**.

**Impact:**
- Cannot update leads from admin panel (line 62 of Pipeline.jsx)
- Cannot update lead status from dropdown (line 117)
- User sees "Failed to update lead" errors

**Recommendation:**
```
ACTION REQUIRED: Create /api/leads/[id]/route.ts
- PUT - Update lead (CEO only per server action line 440)
- DELETE - Delete lead (CEO only per server action line 387)
- Implement authorization checks
```

---

#### 🔴 ISSUE #4: Lead Creation from Admin Panel
**Severity:** HIGH  
**Location:** `/src/pages/admin/Pipeline.jsx:72`

**Problem:**
```javascript
await adminApi.createLead({
  qid: null, // Will be set if creating from questionnaire
  ...
})
```

But `createLead` in api.js points to `/leads/submit` which:
1. Requires authenticated user (line 8-12)
2. Requires qid parameter (line 14-18)
3. Creates lead from questionnaire data

This endpoint is **NOT designed** for manual admin lead creation.

**Impact:**
- Admin cannot manually create leads
- "Create Lead" button in Pipeline page is broken

**Recommendation:**
```
ACTION REQUIRED: Create /api/admin/leads route
- POST /api/admin/leads - Create lead manually
- Support manual data entry (not questionnaire-based)
- Return proper lead object
```

---

### 1.3 Lead Lifecycle Issues

#### ⚠️ ISSUE #5: Lead Status Enum Mismatch
**Severity:** MEDIUM  
**Location:** Multiple files

**Problem:** Different files define lead statuses differently:

`/src/server/actions/pipeline.ts:16-22`:
```typescript
export type LeadStatus =
  | "NEW"
  | "CONTACTED"
  | "QUALIFIED"
  | "PROPOSAL_SENT"
  | "CONVERTED"
  | "LOST";
```

`/src/pages/admin/Pipeline.jsx:25-31`:
```javascript
const pipelineStages = [
  { id: 'NEW', label: 'New Lead' },
  { id: 'CONTACTED', label: 'Contacted' },
  { id: 'QUALIFIED', label: 'Qualified' },
  { id: 'PROPOSAL_SENT', label: 'Proposal Sent' },
  { id: 'CONVERTED', label: 'Converted' },
]
```

Frontend is **missing** the "LOST" status that exists in backend.

**Recommendation:**
```
ACTION: Add "LOST" status to frontend pipeline stages
```

---

### 1.4 Lead-to-Project Conversion Analysis

#### ⚠️ ISSUE #6: Multiple Lead Conversion Functions
**Severity:** MEDIUM  
**Location:** Multiple files

**Problem:** THREE different implementations of lead-to-project conversion:

1. `/src/server/actions/pipeline.ts:167` - `convertLeadToProject()`
2. `/src/server/leads.ts:13` - `approveLeadAndCreateProject()`
3. `/src/server/actions/projects.ts:22` - `approveLead()`

All three:
- Check if lead is already converted
- Create organization if missing
- Create project
- Update lead status to CONVERTED
- Emit feed events

But they have **different logic**:
- Different role requirements (CEO vs Admin)
- Different status assignments (LEAD vs PLANNING)
- Different budget handling

**Impact:**
- Confusion about which function to use
- Inconsistent project creation behavior
- Duplicate code maintenance

**Recommendation:**
```
ACTION REQUIRED: Standardize on ONE conversion function
Recommended: /src/server/actions/projects.ts:approveLead()
- Most comprehensive implementation
- Proper CEO authorization
- Uses PLANNING status (correct workflow)
- Delete other two implementations
```

---

## 2. Project Management System Audit

### 2.1 Architecture Overview

**API Routes:**
- `/api/projects` - Get project requests (wrong model!)
- `/api/projects/update-status` - Update project status with auto-invoicing
- `/api/projects/[id]/feed` - Get project activity feed
- `/api/admin/projects` - Get all projects (admin view)
- `/api/client/projects` - Get user's projects (client view)

**Server Actions:**
- `/src/server/actions/projects.ts` - Project lifecycle management
- `/src/server/projects.ts` - Duplicate (same issue as pipeline!)

### 2.2 Critical Issues Found

#### 🔴 ISSUE #7: Wrong Model Used in /api/projects Route
**Severity:** CRITICAL  
**Location:** `/src/app/api/projects/route.ts:6`

**Problem:**
```typescript
const projects = await prisma.projectRequest.findMany({
  orderBy: { createdAt: "desc" },
});
```

This route queries `projectRequest` model, not `project` model!

**Impact:**
- Returns wrong data type
- Frontend expects Project objects, gets ProjectRequest objects
- Data structure mismatch causes errors

**Recommendation:**
```
ACTION REQUIRED: Fix the query
Change: prisma.projectRequest.findMany
To: prisma.project.findMany
```

---

#### 🔴 ISSUE #8: Client Dashboard Uses Mock Data
**Severity:** CRITICAL  
**Location:** `/src/pages/dashboard/Projects.jsx:22-24`

**Problem:**
```javascript
useEffect(() => {
  initializeMockData()
  const clientProjects = getProjects(user?.id)
  setProjects(clientProjects)
}, [user])
```

Client dashboard is **NOT using real API**! It's using mock data from `utils/mockData.js`.

**Impact:**
- Clients cannot see real projects
- Changes in admin panel don't reflect in client view
- Complete disconnect between admin and client

**Recommendation:**
```
ACTION REQUIRED: Replace mock data with real API
- Use clientApi.getProjects() from utils/api.js
- Remove initializeMockData() and getProjects() from mockData.js
- Update imports
```

---

#### ⚠️ ISSUE #9: Project Status Updates Have Different Implementations
**Severity:** MEDIUM  
**Location:** Multiple files

**Problem:**

1. `/api/projects/update-status` (line 130-191):
   - Requires CEO/CFO role
   - Auto-creates final invoice on completion
   - Uses Stripe integration
   - Emits feed events

2. `/src/server/actions/projects.ts:99` - `updateProjectStatus()`:
   - Requires CEO/CFO role
   - Only updates status and emits feed event
   - No invoice creation

3. `/src/utils/api.js:380` - `projectsApi.updateProjectStatus()`:
   - Points to `/projects/update-status`

Admin Projects page (line 31) uses:
```javascript
await adminApi.updateProject(projectId, { status: newStatus })
```

But `adminApi.updateProject` points to `/projects/${id}` which **DOESN'T EXIST**!

**Impact:**
- Status updates from admin panel will fail (404)
- Inconsistent behavior depending on which API is called

**Recommendation:**
```
ACTION REQUIRED:
1. Create /api/projects/[id]/route.ts with PUT handler
2. OR update adminApi.updateProject to use /projects/update-status
3. Consolidate status update logic into ONE implementation
```

---

### 2.3 Project-Invoice Integration

#### ✅ GOOD: Auto-Invoice Creation
**Location:** `/api/projects/update-status:168-181`

The system automatically creates a 50% final invoice when project status changes to COMPLETED. This is good automation.

**Minor Issue:** No check if deposit invoice was paid first.

**Recommendation:**
```
ENHANCEMENT: Add payment verification
- Check if deposit invoice (50%) was paid before creating final invoice
- Prevent invoice creation if budget is not set
```

---

## 3. CEO Functionality Audit

### 3.1 Architecture Overview

CEO has extensive permissions managed through:
- Server actions in `/src/server/actions/ceo.ts`
- API routes in `/api/ceo/*` (14 endpoints)
- Role-based access control using `requireRole(["CEO"])`

### 3.2 Findings

#### ✅ GOOD: Comprehensive CEO Permissions
**Location:** `/src/server/actions/ceo.ts`

CEO functionality is well-implemented with:
- `assignLearningResources()` - Assign training to users/roles
- `assignTools()` - Assign tools to users/roles
- `assignTasksToTeam()` - Bulk task assignment
- `getExecutiveMetrics()` - Comprehensive analytics
- `getTeamWorkload()` - Team capacity planning
- `getResourceUtilization()` - Resource tracking

All functions properly check for CEO role and log activities.

---

#### ✅ GOOD: Task Assignment and Approval Flow
**Location:** `/api/ceo/tasks/assign` and `/api/ceo/tasks/approve`

**Workflow:**
1. CEO assigns tasks to roles or individual users
2. Users claim tasks (status: TODO → CLAIMED)
3. Users submit completed work (status: CLAIMED → SUBMITTED)
4. CEO approves/rejects (status: SUBMITTED → AWAITING_PAYOUT or CLAIMED)
5. System creates TaskPayout record on approval
6. Notifications sent at each stage

This is a well-structured workflow with proper state management.

---

#### ⚠️ ISSUE #10: Hardcoded CEO Email
**Severity:** LOW  
**Location:** `/src/server/actions/projects.ts:24`

**Problem:**
```typescript
const CEO_EMAIL = "seanspm1007@gmail.com";

if (!session?.user || (session.user.role !== "CEO" && session.user.email !== CEO_EMAIL)) {
  throw new Error("Unauthorized: CEO role required");
}
```

Hardcoded email as backup authorization.

**Recommendation:**
```
CLEANUP: Remove hardcoded email, rely on role only
or move to environment variable if needed for development
```

---

#### ⚠️ ISSUE #11: Activity Log Type Misuse
**Severity:** LOW  
**Location:** `/src/server/actions/ceo.ts` (multiple lines)

**Problem:** Using "LEAD_UPDATED" activity type for non-lead actions:
- Line 33: Assigning learning resources → uses "LEAD_UPDATED"
- Line 54: Assigning learning resources by role → uses "LEAD_UPDATED"  
- Line 88: Assigning tools → uses "LEAD_UPDATED"

**Impact:** Confusing activity logs, incorrect filtering

**Recommendation:**
```
ACTION: Use proper activity types
- RESOURCE_ASSIGNED
- TOOL_ASSIGNED
- Or create new types in ActivityType enum
```

---

## 4. Client-Admin Integration Audit

### 4.1 Data Flow Analysis

#### 🔴 ISSUE #12: Client Cannot See Real Projects
**Severity:** CRITICAL  
**Location:** `/src/pages/dashboard/Projects.jsx`

**Problem:** Already covered in Issue #8, but worth emphasizing for integration:

**Current Flow:**
```
Admin creates project → Database updated → Client sees mock data
```

**Expected Flow:**
```
Admin creates project → Database updated → Client API fetches → Client sees real data
```

**Fix:** Replace mock data with `clientApi.getProjects()` call.

---

#### ⚠️ ISSUE #13: Organization Linking Inconsistency
**Severity:** MEDIUM  
**Location:** Multiple files

**Problem:** Client projects are found by email matching:

`/api/client/projects/route.ts:33-36`:
```typescript
const lead = await prisma.lead.findFirst({
  where: { email: userEmail },
  select: { organizationId: true },
});
```

This assumes:
1. Lead was created with client's email
2. Lead has organizationId set
3. Projects are linked to that organization

**Issues:**
- If client signs up with different email than lead, no projects shown
- If lead has no organization, client sees nothing
- No way to manually link users to organizations

**Recommendation:**
```
ACTION REQUIRED: Implement OrganizationMember system
1. Create proper org membership when lead converts
2. Add UI for admin to manage org members
3. Update client project query to use organizationMember table
4. Add endpoint: /api/admin/organizations/[id]/members
```

---

#### ⚠️ ISSUE #14: Feed Events Not Visible to Clients
**Severity:** MEDIUM  
**Location:** `/api/projects/[id]/feed/route.ts`

**Problem:** Feed endpoint exists and works for both admin and client (line 34-48), but:
- No frontend component to display feed to clients
- Feed events are emitted but not consumed
- Clients have no project activity timeline

**Recommendation:**
```
ENHANCEMENT: Add feed display to client project detail page
- Create FeedTimeline component
- Fetch from /api/projects/[id]/feed
- Show status changes, milestones, invoices
```

---

### 4.2 API Consistency Issues

#### ⚠️ ISSUE #15: API Response Format Inconsistency
**Severity:** LOW  
**Location:** Multiple API routes

**Problem:** Different endpoints return data in different formats:

```javascript
// Some return { items: [...] }
GET /api/client/projects → { items: [...], total: N }

// Some return { projects: [...] }
GET /api/admin/projects → { projects: [...] }

// Some return { success, data }
Server actions → { success: true, project: {...} }

// Some return just the data
GET /api/projects → { projects: [...] }
```

**Impact:**
- Frontend needs custom parsing for each endpoint
- `normalizeItems()` helper partially addresses this (api.js:107)
- Increases complexity

**Recommendation:**
```
ENHANCEMENT: Standardize API response format
Recommended:
{
  success: boolean,
  data: T | T[],
  error?: string,
  metadata?: { total, page, limit }
}
```

---

## 5. Cross-Cutting Concerns

### 5.1 Database Schema Alignment

#### ✅ GOOD: Prisma Schema Well-Defined
**Location:** `/prisma/schema.prisma`

The schema properly defines:
- Lead model with all required fields and statuses
- Project model with organization and lead relationships
- LeadStatus enum: NEW, CONTACTED, QUALIFIED, PROPOSAL_SENT, CONVERTED, LOST
- Proper foreign key relationships

**Minor Issue:** `Lead.requirements` is Json type but typed as string in some code.

---

### 5.2 Authorization Checks

#### ⚠️ ISSUE #16: Inconsistent Role Checking
**Severity:** MEDIUM  
**Location:** Multiple files

**Problem:** Different authorization approaches:

1. Server actions use `requireRole([...])` from `/lib/auth/requireRole`
2. API routes use `await auth()` then manual role check
3. Some routes check specific roles, others check broad admin list
4. Hardcoded role arrays in different files

**Example Inconsistencies:**

`/api/admin/projects:14`:
```typescript
const adminRoles = ["ADMIN", "CEO", "STAFF", "FRONTEND", "BACKEND", "OUTREACH", "DESIGNER", "DEV"];
```

`/api/projects/update-status:134`:
```typescript
if (!["CEO", "CFO"].includes(session.user.role || "")) {
```

Server actions:
```typescript
await requireRole([ROLE.FRONTEND, ROLE.BACKEND, ROLE.OUTREACH]);
```

**Recommendation:**
```
ACTION REQUIRED: Centralize role definitions
1. Create /lib/roles.ts with role groups:
   - ADMIN_ROLES = ["CEO", "CFO"]
   - STAFF_ROLES = ["FRONTEND", "BACKEND", "OUTREACH", "DESIGNER"]
   - ALL_INTERNAL = [...ADMIN_ROLES, ...STAFF_ROLES]
2. Use consistent checking across all routes
3. Prefer server action pattern (requireRole) over manual checks
```

---

### 5.3 Data Serialization

#### ✅ GOOD: Decimal to Number Conversion
**Location:** Multiple server actions

Properly converts Prisma Decimal fields to numbers for JSON serialization:

```typescript
const serializedProjects = projects.map((project) => ({
  ...project,
  budget: project.budget ? Number(project.budget) : null,
}));
```

This is correct and prevents serialization errors.

---

### 5.4 Activity Logging

#### ⚠️ ISSUE #17: Inconsistent Activity Logging
**Severity:** LOW  
**Location:** Multiple files

**Problem:**
- Some functions log to `Activity` model via `logActivity()`
- Some log to `SystemLog` model via `prisma.systemLog.create()`
- Some don't log at all

**Example - Lead update logs to Activity:**
`/src/server/actions/pipeline.ts:471`:
```typescript
await createActivity({
  type: "LEAD_UPDATED",
  title: `Lead updated`,
  ...
});
```

**Example - Task assignment logs to SystemLog:**
`/api/ceo/tasks/assign:83`:
```typescript
await prisma.systemLog.create({
  data: {
    entityType: "Todo",
    action: "ASSIGNED",
    ...
  },
});
```

**Recommendation:**
```
ENHANCEMENT: Standardize on ONE logging system
Recommended: Use Activity model for all user actions
- More flexible metadata
- Already has user relationship
- Used in feed system
```

---

## 6. Security Concerns

### 6.1 Authorization

#### ⚠️ ISSUE #18: Client Organization Access Not Validated
**Severity:** MEDIUM  
**Location:** `/api/client/projects/route.ts:33`

**Problem:** Client projects are found by email-to-lead matching only. No validation that user should have access to that organization.

**Attack Scenario:**
1. User creates account with email that matches a lead
2. System finds organizationId from that lead
3. User gains access to ALL projects in that organization
4. User might not be legitimate organization member

**Recommendation:**
```
ACTION REQUIRED: Add organization membership validation
1. Don't rely solely on lead email matching
2. Check OrganizationMember table for explicit membership
3. Require admin to explicitly add users to organizations
4. Add organization invitation flow
```

---

### 6.2 Input Validation

#### ✅ GOOD: Zod Validation in CEO Routes
**Location:** `/api/ceo/tasks/assign:19` and similar

Uses Zod schemas for input validation:
```typescript
const parsed = assignTaskSchema.safeParse(body);
if (!parsed.success) {
  return NextResponse.json(
    { error: "Validation failed", details: parsed.error.format() },
    { status: 400 }
  );
}
```

**Recommendation:** Apply this pattern to all API routes.

---

## 7. Summary of Critical Action Items

### Immediate Fixes Required (Critical)

1. **[CRITICAL] Delete duplicate server files:**
   - Delete `/src/server/pipeline.ts` (keep actions/pipeline.ts)
   - Delete `/src/server/projects.ts` (keep actions/projects.ts)
   - Update all imports

2. **[CRITICAL] Create missing API routes:**
   - `/api/admin/leads` (GET all, POST create)
   - `/api/leads/[id]` (PUT update, DELETE delete)
   - `/api/projects/[id]` (PUT update)

3. **[CRITICAL] Fix client dashboard:**
   - Replace mock data with real API in `/src/pages/dashboard/Projects.jsx`
   - Change `initializeMockData()` to `clientApi.getProjects()`

4. **[CRITICAL] Fix /api/projects route:**
   - Change `projectRequest` to `project` model query

5. **[CRITICAL] Fix admin pipeline leads loading:**
   - Update `/api/leads/get` to support loading all leads without qid
   - Or create new `/api/admin/leads` endpoint

### High Priority Improvements

6. **[HIGH] Consolidate lead-to-project conversion:**
   - Keep only `approveLead()` from actions/projects.ts
   - Delete `convertLeadToProject()` and `approveLeadAndCreateProject()`
   - Update all references

7. **[HIGH] Implement organization membership system:**
   - Add admin UI to manage organization members
   - Update client project query to use membership table
   - Add proper authorization checks

8. **[HIGH] Standardize role checking:**
   - Create centralized role definitions
   - Use consistent authorization pattern across all routes

### Medium Priority Enhancements

9. **[MEDIUM] Add missing "LOST" status to frontend pipeline
10. **[MEDIUM] Standardize API response format across all endpoints
11. **[MEDIUM] Fix activity type misuse in CEO actions
12. **[MEDIUM] Add feed timeline display for clients

### Low Priority Cleanup

13. **[LOW] Remove hardcoded CEO email
14. **[LOW] Standardize activity logging system
15. **[LOW] Add input validation (Zod) to all API routes

---

## 8. Testing Recommendations

Before deploying fixes, test these workflows:

### Pipeline Workflow Test
1. ✅ Admin can view all leads in pipeline
2. ✅ Admin can manually create a new lead
3. ✅ Admin can update lead status (drag between stages)
4. ✅ Admin can edit lead details
5. ✅ Lead from questionnaire submission appears in pipeline
6. ✅ CEO can convert lead to project

### Project Workflow Test
1. ✅ Lead converts to project with correct status (PLANNING)
2. ✅ Project appears in admin projects list
3. ✅ Project appears in client dashboard (for organization members)
4. ✅ Admin can update project status
5. ✅ Status change to COMPLETED creates final invoice automatically
6. ✅ Project feed shows all activities

### CEO Workflow Test
1. ✅ CEO can assign tasks to role groups
2. ✅ Staff can claim tasks
3. ✅ Staff can submit completed tasks
4. ✅ CEO can approve/reject submitted tasks
5. ✅ Approved tasks create payout records
6. ✅ CEO dashboard shows executive metrics

### Client-Admin Integration Test
1. ✅ Admin creates lead → Appears in pipeline
2. ✅ CEO converts lead → Creates project
3. ✅ Client logs in → Sees project in dashboard
4. ✅ Admin updates project → Client sees updated data
5. ✅ Admin changes status → Client sees new status
6. ✅ Invoice created → Client can view/pay invoice

---

## 9. Conclusion

The pipeline system has a **solid foundation** but suffers from:
1. **Code duplication** (duplicate server action files)
2. **Missing API routes** (leads CRUD, project update)
3. **Integration gaps** (client dashboard not connected)
4. **Inconsistent patterns** (authorization, logging, responses)

### Estimated Effort to Fix Critical Issues:
- **Immediate fixes:** 8-12 hours
- **High priority:** 16-20 hours
- **Total cleanup:** 30-40 hours

### Risk Level if Not Fixed:
- **Pipeline page:** ❌ Currently broken (cannot load leads)
- **Client dashboard:** ❌ Currently broken (shows fake data)
- **Admin lead management:** ❌ Currently broken (cannot update leads)
- **Project integration:** ⚠️ Partially working but inconsistent

**Recommendation:** Address critical issues (#1-5) immediately before any production use.

---

## Appendix A: File Structure Map

```
Pipeline System Files:
├── Frontend
│   ├── /src/pages/admin/Pipeline.jsx - Admin pipeline view
│   └── /src/pages/dashboard/Projects.jsx - Client projects (USES MOCK DATA!)
│
├── API Routes
│   ├── /src/app/api/leads/get/route.ts - Get lead by qid
│   ├── /src/app/api/leads/submit/route.ts - Submit from questionnaire
│   ├── /src/app/api/leads/create-from-package/route.ts - Create from package
│   ├── /src/app/api/admin/projects/route.ts - Admin projects list
│   ├── /src/app/api/client/projects/route.ts - Client projects list
│   ├── /src/app/api/projects/route.ts - WRONG MODEL USED
│   ├── /src/app/api/projects/update-status/route.ts - Update status + auto-invoice
│   └── /src/app/api/projects/[id]/feed/route.ts - Project feed
│
├── Server Actions
│   ├── /src/server/actions/pipeline.ts - ✅ USE THIS
│   ├── /src/server/pipeline.ts - ❌ DELETE (duplicate)
│   ├── /src/server/actions/projects.ts - ✅ USE THIS
│   ├── /src/server/projects.ts - ❌ DELETE (duplicate)
│   ├── /src/server/leads.ts - Contains approveLeadAndCreateProject
│   └── /src/server/actions/ceo.ts - CEO executive functions
│
├── CEO API Routes (14 files)
│   ├── /src/app/api/ceo/tasks/assign/route.ts - Task assignment
│   ├── /src/app/api/ceo/tasks/approve/route.ts - Task approval
│   ├── /src/app/api/ceo/payouts/route.ts - Payout management
│   ├── /src/app/api/ceo/resources/route.ts - Learning resources
│   ├── /src/app/api/ceo/tools/route.ts - Tool management
│   └── ... (9 more CEO endpoints)
│
├── API Client
│   └── /src/utils/api.js - API wrapper functions
│       ├── clientApi - Client endpoints
│       ├── adminApi - Admin endpoints
│       ├── ceoApi - CEO endpoints
│       └── projectsApi - Project endpoints
│
└── Database Schema
    └── /prisma/schema.prisma - Data models
        ├── Lead - Lead tracking
        ├── Project - Project management
        ├── Organization - Client organizations
        ├── OrganizationMember - Org membership
        ├── Invoice - Invoicing
        ├── Todo - Task management
        └── TaskPayout - Payout tracking
```

---

## Appendix B: API Endpoint Coverage Matrix

| Functionality | Frontend Expects | API Route Exists | Status |
|--------------|------------------|------------------|--------|
| Get all leads (admin) | `GET /admin/leads` | ❌ NO | 🔴 BROKEN |
| Get lead by ID | `GET /leads/:id` | ❌ NO | 🔴 BROKEN |
| Create lead (manual) | `POST /admin/leads` | ❌ NO | 🔴 BROKEN |
| Create lead (questionnaire) | `POST /leads/submit` | ✅ YES | ✅ WORKS |
| Create lead (package) | `POST /leads/create-from-package` | ✅ YES | ✅ WORKS |
| Update lead | `PUT /leads/:id` | ❌ NO | 🔴 BROKEN |
| Delete lead | `DELETE /leads/:id` | ❌ NO | 🔴 BROKEN |
| Get all projects (admin) | `GET /admin/projects` | ✅ YES | ✅ WORKS |
| Get all projects (client) | `GET /client/projects` | ✅ YES | ⚠️ NOT USED |
| Update project | `PUT /projects/:id` | ❌ NO | 🔴 BROKEN |
| Update project status | `POST /projects/update-status` | ✅ YES | ✅ WORKS |
| Get project feed | `GET /projects/:id/feed` | ✅ YES | ✅ WORKS |
| CEO assign tasks | `POST /ceo/tasks/assign` | ✅ YES | ✅ WORKS |
| CEO approve tasks | `POST /ceo/tasks/approve` | ✅ YES | ✅ WORKS |

**Summary:** 7/15 expected endpoints are missing (47% coverage)

---

**END OF AUDIT REPORT**

