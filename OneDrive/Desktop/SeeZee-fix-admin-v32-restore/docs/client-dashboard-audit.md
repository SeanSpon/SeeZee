# Client Dashboard vs Admin Dashboard Coverage

This document inventories the current client dashboard surface (under `src/app/(client)/client`) and compares it with the administrator experience (under `src/app/admin`). The goal is to decide which client features must stay, what requires refactoring, and which advanced workflows should be hidden or simplified for end-clients.

## 1. Page Inventory

### Client Routes (Next.js App Router)

- `client/page.tsx` → Dashboard overview (`DashboardClient`)
- `client/projects/page.tsx` → Project list (`ProjectsClient`)
- `client/projects/[id]/page.tsx` → Project detail (`ProjectDetailClient`)
- `client/projects/[id]/requests/page.tsx` → Change requests (AI-powered `RequestsPanel`)
- `client/requests/page.tsx` → Project requests list (`RequestsClient`)
- `client/tasks/page.tsx` / `[taskId]/page.tsx` → Client tasks (questionnaires, deliverables)
- `client/invoices/page.tsx` → Invoice centre with pay/download actions
- `client/subscriptions/page.tsx` → Subscription overview (`SubscriptionsClient`)
- `client/billing/page.tsx` → Billing dashboard (`BillingDashboard`)
- `client/files/page.tsx` → File browser & upload
- `client/messages/page.tsx` → Client messaging threads
- `client/profile/page.tsx` → Profile management (`ProfileClient`)
- `client/settings/page.tsx` → Settings hub (profile, notifications, billing, security)
- `client/support/page.tsx` → Support + FAQ
- `client/github/page.tsx` / `progress/page.tsx` / `overview/page.tsx` → Misc single-purpose pages (some redirect/placeholder)
- `client/layout.tsx` (`ClientShell`) → Client navigation + header

### Admin Routes (Representative)

- `admin/overview`, `admin/projects`, `admin/projects/[id]`
- `admin/pipeline/*`, `admin/clients`, `admin/client-tasks`
- `admin/invoices`, `admin/finances`, `admin/maintenance`
- `admin/tasks`, `admin/todos`
- `admin/messages` (across `feed`, `links`, `resources`, etc.)
- Learning/Training tools, analytics, executive dashboards

## 2. Identified Gaps & Pain Points

| Area | Client State | Admin Counterpart | Notes |
| --- | --- | --- | --- |
| Access control | Many pages/APIs only check `lead.email` | Admin uses richer org membership | Need shared helper so org members and leads both resolve projects/invoices/files/tasks |
| Tasks | Client pages expect `/api/client/tasks` (missing) | Admin `client-tasks` + `todos` use Prisma Todo | Implement client tasks API that surfaces project `ClientTask` + questionnaire progress |
| Requests | `RequestsPanel` offers AI-based suggestions | Admin uses manual request workflows | Keep manual submission, hide/label AI as “Optional” or move under “Advanced” |
| Invoices | `/api/client/invoices` tied to `lead.organizationId` only | Admin billing handles org membership | Expand to include organization members + aggregate stats (paid/pending) |
| Subscriptions | Uses `db.project.subscriptions` but unsimplified copy | Admin `maintenance` handles resets/change requests | Present read-only summary; hide change-request counters unless available |
| Navigation | `ClientShell` + `ClientSidebar` both exist (duplication) | Admin uses `AdminAppShell` | Consolidate on single `ClientShell`; remove duplicate sidebar implementation |
| Messages | `/api/messages` returns threads but UI has gaps (no create) | Admin manages threads fully | Provide read-only conversation + “Contact support” CTA; optionally expose `POST` for replies |
| Misc pages | GitHub / progress placeholders route to AI features | Admin surfaces internal tools | Hide or merge into project detail (“Progress”) with minimal copy |

## 3. Decisions & Simplification Guidelines

1. **Core Navigation for Clients**
   - Keep: Dashboard, Projects, Tasks, Files, Requests, Invoices, Messages, Support, Settings/Profile.
   - Optional / hide behind flags: GitHub integration, AI auto-requests, raw subscription metrics unless populated.

2. **Data Consistency**
   - Introduce `lib/client-access.ts` with helpers:
     - `getClientOrganizations(userId, email)`
     - `getAccessibleProjectIds(userId, email)`
     - `assertProjectAccess(projectId, user)`
   - Refactor client-facing API routes/components to consume these helpers instead of direct `lead.email` checks.

3. **Todo / Task Experience**
   - Surface `ClientTask` items (questionnaires, approvals) via `/api/client/tasks` with statuses `pending`, `in_progress`, `completed`.
   - If no tasks, show simple empty state encouraging contact/support.

4. **Invoices & Billing**
   - Ensure invoice totals and pay links appear even when the client is added via `OrganizationMember`.
   - Merge `/client/invoices` and `/client/billing` so clients see a single payment centre; admin-style payout fields remain internal.

5. **Requests & AI**
   - Keep manual request creation straightforward: title, details.
   - Reframe AI suggestions as “Team Recommendations” and provide context or hide if no GitHub repo configured.

6. **Remove/Hide Confusing Elements**
   - Drop or hide direct links to `/client/github`, `/client/progress`, `/client/overview` duplicate routes.
   - Replace jargon-heavy copy (“AI-powered request generation”) with plain guidance (“Submit a change request to the SeeZee team.”).

## 4. Next Steps (Feeds Remaining Todos)

- Proceed with helper introduction + API refactors (todo: `access-helpers`).
- Build client tasks/messages APIs (todo: `client-apis`).
- Update navigation and UI copy while pruning confusing pages (todo: `ux-polish`).
- QA the entire flow with seed data and document updates (todo: `qa-handoff`).

This audit should be kept alongside the integration plan (`client.plan.md`) to track coverage as implementation progresses.



