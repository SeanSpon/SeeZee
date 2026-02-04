# Admin Routing Structure - Projects vs Clients

## Overview
This document clarifies the distinction between the **Projects** and **Clients** admin pages to prevent confusion and ensure proper routing throughout the application.

---

## Key Pages

### 1. `/admin/projects` - Project Management
**Purpose**: Comprehensive project management and tracking

**What it shows**:
- All projects (active, completed, archived)
- Project status, budget, deadlines
- Assigned team members
- Project progress

**When to use**:
- Managing individual projects
- Tracking project progress
- Viewing project-specific data

**Clicking a project goes to**: `/admin/projects/[projectId]`

---

### 2. `/admin/projects/[id]` - Project Detail Page
**Purpose**: Complete project management interface

**What it shows**:
- Project overview and status
- Tasks (client tasks and admin tasks)
- Milestones
- Change requests
- Files and documents
- Project messaging
- Invoices related to this project
- GitHub integration
- Vercel deployments
- Questionnaire responses

**This is the ONLY page for viewing project details**

---

### 3. `/admin/clients` - Client Management
**Purpose**: Client/organization management and overview

**What it shows**:
- All clients (organizations)
- Client contact information
- Number of projects per client
- Revenue per client
- Invoice status per client

**When to use**:
- Managing client relationships
- Viewing client portfolio
- Tracking client revenue

**Clicking a client goes to**: `/admin/clients/[organizationId]`

---

### 4. `/admin/clients/[id]` - Client Detail Page
**Purpose**: Client-focused view of all their engagements

**What it shows**:
- Client/organization information
- Team members (organization members)
- All projects for this client (links to `/admin/projects/[id]`)
- All invoices for this client
- Hours & maintenance packages
- Lead contacts

**This page only accepts**:
- Organization IDs
- Lead IDs

**This page does NOT accept**:
- Project IDs (projects have their own dedicated page)

---

## Routing Rules

### ✅ Correct Routing

```tsx
// Viewing a project
<Link href={`/admin/projects/${projectId}`}>View Project</Link>

// Viewing a client/organization
<Link href={`/admin/clients/${organizationId}`}>View Client</Link>

// From client page to project
<Link href={`/admin/projects/${project.id}`}>View Project</Link>
```

### ❌ Incorrect Routing

```tsx
// DON'T route projects to clients page
<Link href={`/admin/clients/${projectId}`}>View Project</Link> // WRONG!

// DON'T use project ID as fallback for clients
<Link href={`/admin/clients/${org.id || project.id}`}>View</Link> // WRONG!
```

---

## Navigation Flow

### From Projects List
```
/admin/projects 
  → Click project 
  → /admin/projects/[projectId]
```

### From Clients List
```
/admin/clients 
  → Click client 
  → /admin/clients/[organizationId]
  → Click project in client view
  → /admin/projects/[projectId]
```

### From Hours Overview
```
/admin/hours
  → Click "Manage" on a maintenance plan
  → /admin/clients/[organizationId]?tab=hours
```

---

## Data Relationships

```
Organization (Client)
  ├── Has many Projects
  ├── Has many Invoices
  ├── Has many Members
  └── Has many Maintenance Plans

Project
  ├── Belongs to Organization
  ├── Has many Tasks
  ├── Has many Milestones
  ├── Has many Change Requests
  └── Has many Files

Lead
  ├── Can belong to Organization
  └── Can be converted to Project
```

---

## Summary

- **Projects** = Project management and tracking
- **Clients** = Client/organization management
- Projects are accessed via `/admin/projects/[id]`
- Clients are accessed via `/admin/clients/[id]`
- Never route project IDs to the clients page
- Always use organization ID for client pages

---

## Fixed Issues (Feb 3, 2026)

### Problem
The `/admin/clients/[id]` page was accepting project IDs as a fallback, creating confusion where the same project could be viewed through two different routes:
- `/admin/projects/cmjvkox3j000aysueyk56d5ol` (correct)
- `/admin/clients/cmjvkox3j000aysueyk56d5ol` (incorrect)

### Solution
1. Removed project fallback logic from `/admin/clients/[id]/page.tsx`
2. Updated `ClientDetailClient` component to only handle organizations and leads
3. Fixed `/admin/hours` page to only link to organization IDs (not project IDs)
4. Ensured all project links throughout the app point to `/admin/projects/[id]`

### Result
- Clear separation of concerns
- No duplicate routes for the same entity
- Predictable navigation patterns
- Better maintainability
