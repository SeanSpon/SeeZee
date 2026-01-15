# Post-Checkout Workflow Documentation

## Complete Workflow: Package Selection → Stripe Checkout → Project Creation → Dashboard Visibility

This document explains the complete workflow of what happens after a user selects a package (Starter/Pro/Elite) and completes payment, and where the resulting project appears in each dashboard.

---

## 1. Package Selection Flow

### User Journey
1. User visits package selection page (e.g., `/start` or questionnaire flow)
2. User selects a package:
   - **Starter Package**: `https://buy.stripe.com/dRmcN6bPwa630kUbwjes002`
   - **Pro Package**: `https://buy.stripe.com/4gM4gA8Dkemj2t2fMzes001`
   - **Elite Package**: `https://buy.stripe.com/6oU5kE4n4gurffOdEres000`

3. User is redirected to Stripe Payment Link
4. User completes payment on Stripe's hosted checkout page
5. Stripe sends `checkout.session.completed` webhook event to `/api/webhooks/stripe`

---

## 2. Webhook Handler Processing

### Endpoint
**File**: `src/app/api/webhooks/stripe/route.ts`  
**Route**: `POST /api/webhooks/stripe`

### Webhook Event Processing

When Stripe sends `checkout.session.completed`, the webhook handler:

1. **Verifies webhook signature** using `STRIPE_WEBHOOK_SECRET`
2. **Checks for duplicate events** (idempotency)
3. **Stores webhook event** in database for audit trail
4. **Processes the event** based on type:
   - `checkout.session.completed` → Creates project and related records
   - `invoice.paid` → Updates invoice status
   - `invoice.payment_failed` → Marks invoice as overdue

### Expected Metadata from Stripe Session

The webhook handler expects the following metadata in the Stripe checkout session:

```typescript
{
  lead_id: string,          // Lead reference ID
  quote_id: string,         // Quote reference ID
  service_type: string,     // Package type (starter/pro/elite)
  full_amount: string,      // Total project cost (in dollars)
  deposit_amount: string    // Deposit amount (in dollars)
}
```

---

## 3. What Gets Created (handleCheckoutCompleted)

When `checkout.session.completed` is processed, the following records are created:

### 1. Organization
- **Created from**: Lead's company name or lead's name
- **Slug**: Generated from company/name (lowercase, hyphens)
- **Fields**: name, slug, email, phone

### 2. User Account
- **Role**: `CLIENT`
- **Email**: From lead email
- **Name**: From lead name
- **Email Verified**: Automatically set to current date

### 3. Organization Member
- **Role**: `OWNER`
- **Links**: User to Organization

### 4. Project
- **Status**: `PAID`
- **Name**: `{ServiceType} Development Project` (e.g., "Starter Development Project")
- **Description**: `{service_type} development project for {organization.name}`
- **Budget**: Full amount from metadata
- **Organization**: Linked to created organization
- **Lead**: Linked to original lead
- **Milestones**: Creates 3 default milestones:
  1. Project Planning & Design (due in 1 week)
  2. Development Phase (due in 3 weeks)
  3. Testing & Launch (due in 4 weeks)

### 5. Deposit Invoice
- **Status**: `PAID`
- **Number**: `INV-{timestamp}-DEP`
- **Title**: "Project Deposit"
- **Description**: `50% deposit for {service_type} development project`
- **Amount**: Deposit amount from metadata
- **Paid At**: Current date
- **Stripe Invoice ID**: From session

### 6. Payment Record
- **Status**: `COMPLETED`
- **Method**: `stripe`
- **Amount**: Deposit amount
- **Currency**: USD
- **Stripe Payment ID**: From session payment_intent
- **Linked to**: Deposit invoice

### 7. Balance Invoice (if applicable)
- **Status**: `DRAFT`
- **Number**: `INV-{timestamp}-BAL`
- **Title**: "Project Balance"
- **Description**: `Remaining balance for {service_type} development project`
- **Amount**: Full amount - Deposit amount
- **Due Date**: 30 days from creation

### 8. Lead Status Update
- **Status**: Updated to `CONVERTED`
- **Converted At**: Current date
- **Organization ID**: Linked to created organization

### 9. Feed Events
- **project.created**: Emitted with project ID and name
- **payment.succeeded**: Emitted with project ID, deposit amount, and invoice ID

### 10. Notification
- **Title**: "Welcome to SeeZee Studio!"
- **Message**: "Your project has been successfully created. We'll be in touch within 24 hours to schedule your kick-off call."
- **Type**: `SUCCESS`
- **User**: Sent to client user

---

## 4. Dashboard Visibility Flow

### CEO Dashboard (`/admin`)

#### Leads Management
**Route**: `/admin/pipeline/leads`

**What CEO Sees**:
- All leads in the system
- Table with columns: Name, Company, Email, Phone, Status, Created
- Lead status: NEW → CONTACTED → QUALIFIED → CONVERTED
- After payment, lead status is automatically set to `CONVERTED`

**Actions Available**:
- View lead details: `/admin/pipeline/leads/[leadId]`
- Approve lead → Create project (if not already created)
- Update lead status
- Add notes to lead

#### Projects Management
**Route**: `/admin/pipeline/projects`

**What CEO Sees**:
- All projects in the system (including those created from Stripe checkout)
- Projects appear immediately after webhook processes payment
- Project cards showing:
  - Project name
  - Status (PAID initially)
  - Organization
  - Budget
  - Created date

**Actions Available**:
- View project details: `/admin/pipeline/projects/[projectId]`
- Update project status
- Add milestones
- Create invoices
- View feed timeline

#### Project Detail Page
**Route**: `/admin/pipeline/projects/[projectId]`

**What CEO Sees**:
- Complete project information
- Organization details
- Lead information
- Assignee (if assigned)
- Milestones list
- Invoices (deposit + balance)
- Feed timeline (project.created, payment.succeeded events)
- Status dropdown (can update project status)

---

### Admin Dashboard (`/admin`)

#### Projects Management
**Route**: `/admin/pipeline/projects`

**What Admin Sees**:
- **All projects** in the system (same as CEO)
- Projects created from Stripe checkout appear here
- Filter by status
- Search by project name
- Grid/list view of projects

**Actions Available**:
- View project details: `/admin/pipeline/projects/[projectId]`
- Update project status (dropdown with all status options)
- Add/edit milestones
- Create invoices (deposit or final payment)
- Assign team members
- View feed timeline
- Manage project tasks

#### Project Detail Page
**Route**: `/admin/pipeline/projects/[projectId]`

**What Admin Sees**:
- Full project overview
- Tabs: Overview, Tasks, Timeline, Files
- **Overview Tab**: Project details, assignee, budget, organization
- **Tasks Tab**: Milestones with progress tracking
- **Timeline Tab**: Feed events (project.created, payment.succeeded, status changes, etc.)
- **Files Tab**: Project files (placeholder)

**Actions Available**:
- Update project status
- Add/edit/delete milestones
- Create invoices
- View all invoices (deposit + balance)
- See payment history
- Add notes/comments

---

### Client Dashboard (`/client`)

#### Projects List
**Route**: `/client/projects`

**What Client Sees**:
- **Only their organization's projects**
- Projects filtered by: `lead.email = session.user.email`
- Projects appear after:
  1. Webhook creates project
  2. User account is created with matching email
  3. Project is linked to organization

**Project Cards Show**:
- Project name
- Status badge (PAID, ACTIVE, IN_PROGRESS, etc.)
- Progress indicator
- Milestone completion
- Last updated date

#### Project Detail Page
**Route**: `/client/projects/[projectId]`

**What Client Sees**:
- **Read-only view** of their project
- **Tabs Available**:
  - **Overview Tab**: Project details, description, budget, status
  - **Tasks Tab**: Milestones with progress (read-only)
  - **Timeline Tab**: Feed events (project.created, payment.succeeded, status updates)
  - **Files Tab**: Project files (placeholder)

**What Client Can Do**:
- View project status
- See milestones and progress
- View timeline of events
- See invoices (deposit + balance)
- Submit change requests (if enabled)

**What Client Cannot Do**:
- Update project status
- Edit milestones
- Create invoices
- Modify project details

---

## 5. Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    User Selects Package                      │
│            (Starter/Pro/Elite)                               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Redirect to Stripe Payment Link                 │
│  https://buy.stripe.com/[package-id]                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              User Completes Payment on Stripe                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│     Stripe Sends checkout.session.completed Webhook         │
│     POST /api/webhooks/stripe                                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Webhook Handler Processing                      │
│  handleCheckoutCompleted(session)                            │
│                                                              │
│  Creates:                                                   │
│  • Organization                                             │
│  • User (CLIENT role)                                       │
│  • OrganizationMember (OWNER)                                │
│  • Project (status: PAID)                                   │
│  • Deposit Invoice (PAID)                                   │
│  • Payment Record (COMPLETED)                               │
│  • Balance Invoice (DRAFT)                                  │
│  • Updates Lead (status: CONVERTED)                         │
│  • Emits Feed Events (project.created, payment.succeeded)   │
│  • Creates Notification (Welcome message)                   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Appears in Dashboards                │
│                                                              │
│  CEO Dashboard:                                             │
│  • /admin/pipeline/leads → Lead status = CONVERTED          │
│  • /admin/pipeline/projects → Project appears              │
│                                                              │
│  Admin Dashboard:                                           │
│  • /admin/pipeline/projects → All projects visible          │
│  • Can update status, add milestones, create invoices        │
│                                                              │
│  Client Dashboard:                                          │
│  • /client/projects → Their organization's projects          │
│  • Can view project, see timeline, view invoices             │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Key Routes Reference

### CEO Routes
- `/admin/pipeline/leads` - View all leads
- `/admin/pipeline/leads/[id]` - View lead details
- `/admin/pipeline/projects` - View all projects
- `/admin/pipeline/projects/[id]` - View project details

### Admin Routes
- `/admin/pipeline/projects` - View all projects
- `/admin/pipeline/projects/[id]` - View/edit project details
- `/admin/pipeline/view` - Kanban view of projects

### Client Routes
- `/client/projects` - View their projects
- `/client/projects/[id]` - View project details (read-only)
- `/client/projects/[id]/requests` - Submit change requests

### API Routes
- `POST /api/webhooks/stripe` - Stripe webhook handler
- `GET /api/client/projects` - Client projects API
- `GET /api/projects` - All projects API (admin)

---

## 7. Project Status Flow

After checkout, project status progression:

1. **PAID** (initial status after checkout)
   - Project created with deposit paid
   - Appears in all dashboards

2. **PLANNING** (CEO/Admin can update)
   - Initial planning phase
   - Requirements gathering

3. **DESIGN** (CEO/Admin can update)
   - Design phase
   - Mockups and wireframes

4. **BUILD** (CEO/Admin can update)
   - Development phase
   - Feature implementation

5. **REVIEW** (CEO/Admin can update)
   - Client review phase
   - Feedback and revisions

6. **ACTIVE** (CEO/Admin can update)
   - Project actively in progress
   - Multiple phases happening

7. **IN_PROGRESS** (CEO/Admin can update)
   - Development in progress
   - Similar to ACTIVE

8. **ON_HOLD** (CEO/Admin can update)
   - Project paused
   - Waiting for client input

9. **LAUNCH** (CEO/Admin can update)
   - Ready for launch
   - Final testing

10. **COMPLETED** (CEO/Admin can update)
    - Project finished
    - All milestones complete

---

## 8. Feed Events Timeline

After checkout, these feed events are created and visible in the Timeline tab:

1. **project.created**
   - Event: Project created
   - Visible in: Admin and Client project detail pages
   - Contains: Project name, status, created by

2. **payment.succeeded**
   - Event: Payment successful
   - Visible in: Admin and Client project detail pages
   - Contains: Amount, invoice ID

3. **status.changed** (when admin updates status)
   - Event: Status updated
   - Visible in: Admin and Client project detail pages
   - Contains: Old status, new status, updated by

4. **milestone.created** (when admin adds milestones)
   - Event: Milestone added
   - Visible in: Admin and Client project detail pages
   - Contains: Milestone title, due date

---

## 9. Important Notes

### Payment Links Configuration
- Payment Links are configured in `src/lib/qwiz/packages.ts`
- Each package has a `paymentLink` field
- Payment Links redirect users directly to Stripe checkout
- **Important**: Payment Links need to be configured in Stripe Dashboard to:
  - Send webhook events to `/api/webhooks/stripe`
  - Include metadata in checkout session (if needed)
  - Set success/cancel URLs

### Webhook Metadata Requirements
The current webhook handler expects specific metadata in the Stripe checkout session. If using Payment Links, ensure:
- Lead is created before checkout (if `lead_id` is required)
- Metadata is passed through Payment Link configuration
- Or webhook handler is updated to work without metadata

### Lead Creation
- For the current webhook handler to work, a Lead must exist before checkout
- The webhook handler looks up the lead by `lead_id` from metadata
- If no lead exists, webhook will fail with "Lead not found" error

### Organization Filtering
- Client projects are filtered by organization membership
- Projects appear in client dashboard only if:
  1. User email matches lead email
  2. Project is linked to user's organization
  3. User is a member of the organization

---

## 10. Testing the Workflow

To test the complete workflow:

1. **Select a package** on the package selection page
2. **Complete payment** on Stripe (use test mode)
3. **Check webhook logs** in server console
4. **Verify project creation**:
   - Check database: `Project` table should have new project
   - Check database: `Invoice` table should have deposit invoice
   - Check database: `Payment` table should have payment record

5. **Check CEO Dashboard**:
   - Visit `/admin/pipeline/leads` - Lead should be CONVERTED
   - Visit `/admin/pipeline/projects` - Project should appear

6. **Check Admin Dashboard**:
   - Visit `/admin/pipeline/projects` - Project should appear
   - Click project to view details

7. **Check Client Dashboard**:
   - Login as client user (email from lead)
   - Visit `/client/projects` - Project should appear
   - Click project to view details

---

This workflow ensures that after a package purchase, the project is automatically created and visible in all relevant dashboards with proper permissions and filtering.








