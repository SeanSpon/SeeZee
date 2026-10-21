# SeeZee admin reorganization review

Review branch: `codex/admin-workflow-cleanup`  
Base: `main` at `7d9012dc04caeaec2ceb11331b2ae00722ac8068`  
Review date: October 15, 2026

## Review access and deployment

- Draft PR: https://github.com/SeanSpon/SeeZee/pull/46
- Vercel Preview (READY, build succeeded in about 2 minutes): https://seezeestudios-3iulxrqkz-seezee-studios.vercel.app
- Preview login fetch returned HTTP 200 and stayed on the preview hostname.
- Deployment: `dpl_92mMF5t66to9unWvZgktmMjYWwB6`, commit `62c0fa1`.
- Vercel database environment configuration remains blocked by 403. A deployed build is not confirmation that authentication or client submissions work end to end. Follow the setup checklist below.

## What was there

The app already contained a substantial business workspace: lead qualification, project creation and boards, client organizations, internal tasks, client deliverables, maintenance and hours, invoices, recurring billing, expenses, banking, team management, learning, documents, recordings, blog, repositories, analytics, database tooling and several CEO/executive versions of screens.

Three saved navigation modes existed: sidebar, folder Explorer, and dashboard. The sidebar flattened five groups to their first link, then showed Dev Tools and System. Leads, tasks, calendar, maintenance and most billing tools were reachable mainly through dashboard cards or a URL. The default overview placed revenue charts and Git activity ahead of delivery work. Multiple old URLs redirect to other versions of tools.

### Original navigation

| Label | Destination |
|---|---|
| Command | `/admin` |
| Projects | `/admin/projects` |
| Clients | `/admin/clients` |
| Finance | `/admin/finance` |
| Blog | `/admin/blog` |
| Git | `/admin/git` |
| Database | `/admin/database` |
| AI Chat | `/admin/chat` |
| Analytics | `/admin/analytics` |
| Settings | `/settings` |
| Recordings | `/admin/recordings` |
| Resources | `/admin/resources` |
| Links | `/admin/links` |

## What changed

| Area | Before | Review branch |
|---|---|---|
| Navigation | 5 primary links; tools scattered across cards and folders | Shared directory grouped by Start here, Clients & intake, Projects & delivery, Billing & finance, Team & resources, Development, Administration |
| Finding tools | Hidden pages and ambiguous sections | Searchable sidebar, current section/page labels, workspace directory with descriptions and four-step workflow |
| Daily overview | Charts and passive Git activity first | Review submissions, move tasks forward and follow up on invoices first; trends/activity available in an expandable section |
| New project action | “New Project” opened the general project list | Opens the existing project creation screen |
| Submission review | Leads and request types spread across tables | Searchable inbox across inquiries, unlinked intake records, maintenance, project support and unified requests; linked pairs appear once |
| Intake saves | Lead, organization and project request saved in separate operations | One serializable transaction; failed request creation rolls back the lead and organization |
| Retry handling | Email/service matching could return an unrelated request | Unique submission identity; retries return the same explicitly linked pair |
| Ownership | Anonymous email could find/create an existing account and organization | Anonymous inquiries remain unclaimed; signed-in submissions bind to the authenticated account; verified owners can view unclaimed history |
| Request API | POST created Todo; GET read ProjectRequest | Both persist/read ProjectRequest; optional project association requires access verification |
| Linking projects | Picked a lead/project by matching email | Direct request → lead/project relationships; ambiguous historical records remain unlinked |
| Conversion | Project, lead status and membership writes could partially succeed | Transaction includes project creation, lead conversion, memberships and linked request approval |
| Cancellation | Removed the intake record while leaving the lead | Archives the request, retires a still-new linked lead, preserves history |
| Attachments | File picker logged files and submitted an empty URL list | Signed-in uploads must succeed before submitting; retry retains uploaded URLs; anonymous users get clear guidance |
| Structured details | Several nonprofit/maintenance fields were discarded | Validated details preserved in lead metadata and readable in the inbox |
| Client totals | Projects/invoices counted both from organizations and separate queries | Each project/invoice counted once, with paid revenue accumulated once |
| Dashboard trends | Fixed +2/+23%/+5 labels looked like real growth | Descriptive labels instead of invented trends |
| Database clients | Three modules could initialize independent clients | Shared Prisma singleton and common preview guard |
| Preview routing | Every non-primary hostname redirected to the live site | Production aliases handled by existing Next config; preview stays on its hostname |
| Preview auth | Hardcoded production URL values in vercel.json | Removed hardcoded values; preview auth uses the Vercel deployment hostname |
| Loading/errors | Inconsistent page failures | Shared loading skeleton and retry error boundary |

Existing screens and saved navigation modes are retained. The Explorer now also renders the daily overview at its root. The shared directory keeps destinations consistent across modes. This is a navigation/intake cleanup, not a rewrite of every individual finance, automation, AI, or CEO tool.

## Database review and migration

Neon project: `morning-voice-69472218` (SeeZee).  
Production branch: `br-soft-tree-ad8514n3`.  
Isolated review branch: `preview/admin-workflow-cleanup` / `br-royal-hill-add4y42j`.

The review copy contained 8 leads, 4 project requests, and 0 rows each in unified_requests, requests, change_requests and client_tasks at audit time. No production migration or data modification was performed.

| Model | Responsibility / decision |
|---|---|
| Lead | Sales/contact inquiry; owns structured intake metadata and optional unique submission key |
| ProjectRequest | Client-visible intake/review record; now explicitly linked to Lead and optionally Project |
| Request | Existing-project support workflow; retained for current consumers |
| ChangeRequest | Maintenance work with approval, time deduction and billing semantics; retained |
| ClientTask | Admin-assigned deliverable the client must complete; retained, because it is a different direction of work |
| UnifiedRequest | Previous consolidation scaffold; empty in this snapshot and not used by current API handlers; retained for compatibility |
| Todo | Internal team execution task; no longer silently used as the storage for the client intake API |

Migration `20261015183000_link_client_intake` adds nullable `ProjectRequest.leadId` (unique FK), nullable `ProjectRequest.projectId` (FK), nullable unique `Lead.submissionKey`, plus user/date, contact, status/date and project indexes. It attempts an automatic historical link only when email plus a 60-second timestamp window gives one unambiguous candidate on both sides. It then marks matched converted intake approved. In this snapshot zero historical pairs met the criteria; they were deliberately left intact. One shared email across records was separated by months and must not be treated as a relationship.

The migration was applied transactionally only to the isolated review branch. No tables or columns were dropped. Broad destructive consolidation is deferred until consumers are migrated and representative historical records are reconciled.

## Validation and limits

- Prisma schema validation passes.
- TypeScript `tsc --noEmit` passes.
- Seven focused tests pass: input validation, anonymous ownership, linked persistence and retained details, duplicate retry/distinct request handling, rollback, authenticated ownership, navigation path matching and preview guard (some assertions share a test).
- Neon confirms the migration applied successfully on the isolated branch; all existing records were retained.
- The workspace guide rendered HTTP 200 locally using a synthetic local-only session. Desktop/mobile screenshots were visually inspected. After waiting for hydration, sidebar collapse/expand, filtering to a single “Invoices” result, mobile menu open, and Escape close all passed browser automation. Screenshots are included in `docs/previews/`.
- Workspace cannot open direct TCP connections to Neon, so real Prisma persistence and full browser → API → database verification remain unconfirmed here. Test transaction behavior uses an in-memory transaction harness; it is not a replacement for integration testing.
- Full Vercel build succeeded and the preview reached READY. Locally, Webpack compilation and TypeScript passed; full local page-data collection hit missing provider credentials. Default local Turbopack hit a Google Fonts network fetch restriction. Missing email configuration now initializes lazily in the outreach modules rather than crashing at import time.
- Resend, UploadThing delivery and Google OAuth on a preview domain have not been verified with real provider credentials. Preview intake email is suppressed. Signed-in file uploads use the existing UploadThing integration.
- Public contact form and legacy contact server action still create Lead inquiries and appear in the inbox; they are not project-request intake. The dormant package questionnaire callers still send retired payloads; the current service intake remains the supported path.
- Inbox loads at most the newest 200 entries per source and states that limit. It is a review queue, not an unlimited export.

## How to review safely

1. Open this branch's pull request and read this review document.
2. In Vercel, choose **SeeZee Studios → seezeestudios**, and select the **Preview** environment for Git branch `codex/admin-workflow-cleanup`.
3. Add branch-specific `DATABASE_URL` using the connection string for Neon branch `preview/admin-workflow-cleanup`. Get it directly from the Neon console; no password belongs in GitHub or chat.
4. Confirm the preview has its own working auth configuration. Google OAuth needs an allowed callback for the preview hostname; existing password sign-in can be tested separately.
5. Redeploy this branch as a Preview. Do not promote or merge it for this review.
6. Sign in as your normal admin and check `/admin`, `/admin/workspace`, `/admin/requests`, clients, projects, tasks and billing navigation on desktop and phone.
7. Submit a uniquely labeled test brief from `/start`; check its inbox entry, linked request in the client's dashboard, retained optional fields and attachment links. Retry it and verify only one pair exists.
8. Approve it from the lead screen; confirm project creation and the same client's request moves to approved. Test another distinct request from the same account and cancel it; verify it is archived.
9. Check ownership using a second test account and verify that it cannot view or associate another client's project.
10. Verify contact email, UploadThing and Google sign-in with the real preview provider configuration before considering a production release.

Vercel denied both listing and creating project environment variables (HTTP 403); the CLI is logged out. The agent therefore could not finish remote preview configuration. The branch contains a database-host guard so Preview database operations fail closed until the isolated review connection is configured. That guard is intentionally tied to this review branch's Neon endpoint; review its lifecycle before merging to support future preview branches. The review branch and database can be kept while feedback is incorporated.

## Original route inventory

Every pre-existing admin page is listed below, including aliases and specialized tools. Retained does not mean every interaction has been tested.

| Route | Existing implementation |
|---|---|
| `/admin` | Existing screen (retained) |
| `/admin/analytics` | Redirect → /login |
| `/admin/blog` | Existing screen (retained) |
| `/admin/blog/[id]` | Existing screen (retained) |
| `/admin/blog/new` | Existing screen (retained) |
| `/admin/calendar` | Existing screen (retained) |
| `/admin/ceo` | Existing screen (retained) |
| `/admin/ceo/analytics` | Existing screen (retained) |
| `/admin/ceo/finances` | Redirect → /admin/finance |
| `/admin/ceo/learning-hub` | Redirect → /admin/learning |
| `/admin/ceo/map` | Existing screen (retained) |
| `/admin/ceo/systems` | Existing screen (retained) |
| `/admin/ceo/systems/automations` | Existing screen (retained) |
| `/admin/ceo/systems/logs` | Existing screen (retained) |
| `/admin/ceo/tasks` | Existing screen (retained) |
| `/admin/ceo/team-management` | Existing screen (retained) |
| `/admin/ceo/vault` | Existing screen (retained) |
| `/admin/chat` | Existing screen (retained) |
| `/admin/chat/[id]` | Existing screen (retained) |
| `/admin/client-tasks` | Existing screen (retained) |
| `/admin/clients` | Existing screen (retained) |
| `/admin/clients/[id]` | Existing screen (retained) |
| `/admin/command-center` | Existing screen (retained) |
| `/admin/database` | Existing screen (retained) |
| `/admin/executive/analytics` | Redirect → /admin/ceo/analytics |
| `/admin/executive/finances` | Redirect → /admin/ceo/finances |
| `/admin/executive/systems` | Redirect → /admin/ceo/systems |
| `/admin/executive/systems/automations` | Redirect → /admin/ceo/systems/automations |
| `/admin/executive/systems/logs` | Redirect → /admin/ceo/systems/logs |
| `/admin/feed` | Existing screen (retained) |
| `/admin/finance` | Redirect → /login |
| `/admin/finance/bank` | Existing screen (retained) |
| `/admin/finance/expenses` | Existing screen (retained) |
| `/admin/finance/transactions` | Redirect → /login |
| `/admin/finances` | Redirect → /admin/ceo/finances |
| `/admin/git` | Existing screen (retained) |
| `/admin/goals` | Existing screen (retained) |
| `/admin/hours` | Redirect → /admin/service-plans |
| `/admin/invoices` | Redirect → /admin/finance/transactions?tab=invoices |
| `/admin/learning` | Redirect → /login |
| `/admin/learning/resources` | Existing screen (retained) |
| `/admin/learning/tools` | Existing screen (retained) |
| `/admin/learning/training` | Existing screen (retained) |
| `/admin/links` | Existing screen (retained) |
| `/admin/maintenance` | Redirect → /admin/service-plans |
| `/admin/overview` | Redirect → /admin |
| `/admin/pipeline` | Existing screen (retained) |
| `/admin/pipeline/invoices` | Redirect → /admin/finance/transactions?tab=invoices |
| `/admin/pipeline/invoices/[id]` | Redirect → /login |
| `/admin/pipeline/leads` | Existing screen (retained) |
| `/admin/pipeline/leads/[id]` | Redirect → /login |
| `/admin/pipeline/projects` | Existing screen (retained) |
| `/admin/pipeline/projects/[id]` | Redirect → /login |
| `/admin/pipeline/view` | Existing screen (retained) |
| `/admin/profile` | Redirect → / |
| `/admin/projects` | Existing screen (retained) |
| `/admin/projects/[id]` | Redirect → /login |
| `/admin/projects/[id]/board` | Redirect → /auth/login |
| `/admin/projects/create` | Existing screen (retained) |
| `/admin/purchases` | Redirect → /admin/hours |
| `/admin/recordings` | Existing screen (retained) |
| `/admin/recordings/[id]` | Existing screen (retained) |
| `/admin/reports` | Redirect → /login |
| `/admin/requests` | Existing screen (retained) |
| `/admin/resources` | Existing screen (retained) |
| `/admin/service-plans` | Existing screen (retained) |
| `/admin/settings` | Redirect → /settings |
| `/admin/subscriptions` | Redirect → /admin/hours |
| `/admin/super` | Existing screen (retained) |
| `/admin/systems` | Redirect → /admin/ceo/systems |
| `/admin/tasks` | Existing screen (retained) |
| `/admin/tasks/[id]` | Existing screen (retained) |
| `/admin/team` | Redirect → /login |
| `/admin/team/[userId]` | Redirect → /login |
| `/admin/templates` | Existing screen (retained) |
| `/admin/test-vercel` | Existing screen (retained) |
| `/admin/todos` | Redirect → /login |
| `/admin/tools` | Existing screen (retained) |
| `/admin/tools/revenue-calculator` | Redirect → /login?returnUrl=/admin/tools/revenue-calculator |
| `/admin/training` | Existing screen (retained) |
| `/admin/workspace` | Existing screen (retained) |
