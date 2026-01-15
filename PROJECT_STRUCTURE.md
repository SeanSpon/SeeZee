# 📋 SeeZee Project Structure - Complete Documentation

**Last Updated:** January 1, 2026  
**Status:** Comprehensive project inventory with feature gap analysis

---

## 📑 Table of Contents

1. [Project Overview](#project-overview)
2. [File Tree Structure](#file-tree-structure)
3. [Feature Inventory & Status](#feature-inventory--status)
4. [Database Schema Overview](#database-schema-overview)
5. [API Routes Inventory](#api-routes-inventory)
6. [Components Library](#components-library)
7. [Integrations & Services](#integrations--services)
8. [Known Issues & Bugs](#known-issues--bugs)
9. [Missing Features](#missing-features)
10. [Environment Variables](#environment-variables)
11. [Deployment Information](#deployment-information)

---

## 🎯 Project Overview

**SeeZee** is a comprehensive full-stack web agency platform built with:
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (via Neon)
- **Auth**: NextAuth.js v5 with Google OAuth
- **Styling**: Tailwind CSS + Glass Morphism
- **Hosting**: Vercel (Production)

The platform manages client relationships, projects, invoicing, maintenance plans, lead discovery, and team collaboration across admin and client dashboards.

---

## 📂 File Tree Structure

```
src/
├── app/
│   ├── (admin)/                           # Protected admin routes
│   │   └── layout.tsx                     [✅ Main admin layout]
│   ├── (client)/                          # Protected client portal
│   │   ├── client/
│   │   ├── layout.tsx                     [✅ Client layout]
│   │   └── onboarding/                    [⚠️ Onboarding flow]
│   ├── (public)/                          # Public website routes
│   │   └── layout.tsx                     [✅ Public layout]
│   ├── (portal)/                          # Portal routes
│   ├── admin/                             # MAIN ADMIN DASHBOARD
│   │   ├── page.tsx                       [✅ WORKING - Main overview]
│   │   ├── overview/                      [✅ Dashboard overview]
│   │   ├── clients/
│   │   │   ├── page.tsx                   [⚠️ ISSUE - Clients list not displaying]
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx               [❓ UNTESTED - Client detail]
│   │   ├── projects/
│   │   │   ├── page.tsx                   [⚠️ ISSUE - Visual glitches]
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx               [❓ UNTESTED - Project detail]
│   │   ├── settings/
│   │   │   ├── page.tsx                   [❓ EXISTS - Status unknown]
│   │   │   └── layout.tsx
│   │   ├── leads/
│   │   │   └── page.tsx                   [⚠️ WORKING - UI clutter with old prospects]
│   │   ├── invoices/
│   │   │   ├── page.tsx                   [✅ MOSTLY WORKING]
│   │   │   └── [id]/
│   │   │       └── page.tsx               [✅ Invoice detail]
│   │   ├── tasks/
│   │   │   └── page.tsx                   [✅ WORKING]
│   │   ├── finance/
│   │   │   └── page.tsx                   [✅ WORKING]
│   │   ├── analytics/
│   │   │   └── page.tsx                   [✅ WORKING]
│   │   ├── calendar/
│   │   │   └── page.tsx                   [✅ WORKING]
│   │   ├── team/
│   │   │   └── page.tsx                   [✅ WORKING]
│   │   ├── maintenance/
│   │   │   └── page.tsx                   [✅ WORKING]
│   │   ├── resources/
│   │   │   └── page.tsx                   [✅ WORKING]
│   │   ├── training/
│   │   │   └── page.tsx                   [✅ WORKING]
│   │   ├── tools/
│   │   │   └── page.tsx                   [✅ WORKING]
│   │   ├── links/
│   │   │   └── page.tsx                   [✅ WORKING]
│   │   ├── learning/
│   │   │   └── page.tsx                   [✅ WORKING]
│   │   ├── chat/
│   │   │   └── page.tsx                   [✅ WORKING]
│   │   ├── database/
│   │   │   └── page.tsx                   [✅ ADMIN ONLY - DB management]
│   │   ├── ceo/
│   │   │   ├── page.tsx                   [✅ CEO dashboard]
│   │   │   └── [section]/page.tsx         [✅ CEO sections]
│   │   ├── executive/
│   │   │   └── page.tsx                   [✅ Executive dashboard]
│   │   ├── subscriptions/
│   │   │   └── page.tsx                   [✅ WORKING]
│   │   ├── client-tasks/
│   │   │   └── page.tsx                   [✅ WORKING]
│   │   ├── project-requests/
│   │   │   └── page.tsx                   [✅ WORKING]
│   │   ├── purchases/
│   │   │   └── page.tsx                   [✅ WORKING]
│   │   ├── pipeline/
│   │   │   └── page.tsx                   [✅ WORKING]
│   │   ├── templates/
│   │   │   └── page.tsx                   [✅ WORKING]
│   │   ├── recordings/
│   │   │   └── page.tsx                   [✅ WORKING]
│   │   ├── feed/
│   │   │   └── page.tsx                   [✅ WORKING]
│   │   ├── marketing/
│   │   │   └── page.tsx                   [✅ WORKING]
│   │   └── layout.tsx                     [✅ Admin layout with nav]
│   ├── client/                            # CLIENT PORTAL
│   │   ├── page.tsx                       [✅ Client dashboard overview]
│   │   ├── projects/
│   │   │   ├── page.tsx                   [✅ WORKING]
│   │   │   └── [id]/page.tsx              [✅ Project detail]
│   │   ├── invoices/
│   │   │   └── page.tsx                   [✅ WORKING]
│   │   ├── messages/
│   │   │   └── page.tsx                   [✅ WORKING]
│   │   ├── tasks/
│   │   │   └── page.tsx                   [✅ WORKING]
│   │   ├── files/
│   │   │   └── page.tsx                   [✅ WORKING]
│   │   ├── billing/
│   │   │   └── page.tsx                   [✅ WORKING]
│   │   └── settings/
│   │       └── page.tsx                   [✅ WORKING]
│   ├── api/                               # API ROUTES
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.ts    [✅ NextAuth handler]
│   │   │   ├── register/route.ts          [✅ User registration]
│   │   │   └── verify-email/route.ts      [✅ Email verification]
│   │   ├── admin/
│   │   │   ├── clients/route.ts           [✅ GET/POST clients]
│   │   │   ├── projects/route.ts          [✅ GET/POST projects]
│   │   │   ├── invoices/route.ts          [✅ Invoice management]
│   │   │   ├── tasks/route.ts             [✅ Task management]
│   │   │   ├── leads/
│   │   │   │   ├── route.ts               [✅ Lead management]
│   │   │   │   ├── discover-places/      [⚠️ Google Places integration - working]
│   │   │   │   ├── analyze/              [✅ Lead analysis with Claude]
│   │   │   │   └── enrich/               [✅ Lead enrichment]
│   │   │   └── analytics/route.ts         [✅ Analytics data]
│   │   ├── projects/route.ts              [✅ Project API]
│   │   ├── invoices/route.ts              [✅ Invoice API]
│   │   ├── leads/route.ts                 [✅ Lead API]
│   │   ├── prospects/route.ts             [✅ Prospect discovery]
│   │   ├── templates/route.ts             [✅ Email templates]
│   │   ├── tasks/route.ts                 [✅ Task management]
│   │   ├── notifications/route.ts         [✅ Notifications]
│   │   ├── messages/route.ts              [✅ Messaging]
│   │   ├── profile/route.ts               [✅ User profile]
│   │   ├── billing/route.ts               [✅ Billing management]
│   │   ├── calendar/route.ts              [✅ Calendar events]
│   │   ├── subscriptions/route.ts         [✅ Subscription management]
│   │   ├── stripe/
│   │   │   ├── webhook/route.ts           [✅ Stripe webhooks]
│   │   │   └── checkout/route.ts          [✅ Stripe checkout]
│   │   ├── stripe/
│   │   │   └── webhook/route.ts           [✅ Stripe webhooks]
│   │   ├── webhooks/
│   │   │   └── stripe/route.ts            [✅ Stripe webhook handler]
│   │   ├── emails/route.ts                [✅ Email sending]
│   │   ├── start-project/route.ts         [✅ Project creation]
│   │   ├── env-check/route.ts             [✅ Debug - Env vars check]
│   │   ├── debug-auth/route.ts            [✅ Debug - Auth checking]
│   │   ├── test-*/route.ts                [🧪 TEST ROUTES - multiple]
│   │   └── cron/route.ts                  [✅ Scheduled tasks]
│   ├── auth/                              # AUTH PAGES
│   │   ├── signin/page.tsx                [✅ Sign in page]
│   │   ├── signup/page.tsx                [✅ Sign up page]
│   │   ├── register/page.tsx              [✅ Register page]
│   │   ├── forgot-password/page.tsx       [✅ Forgot password]
│   │   ├── reset-password/page.tsx        [✅ Password reset]
│   │   ├── verify-email/page.tsx          [✅ Email verification]
│   │   ├── set-password/page.tsx          [✅ Set password]
│   │   └── [...error]/page.tsx            [✅ Auth error handling]
│   ├── (public)/                          # PUBLIC PAGES
│   │   ├── page.tsx                       [✅ Homepage]
│   │   ├── services/page.tsx              [✅ Services page]
│   │   ├── about/page.tsx                 [✅ About page]
│   │   └── legal/                         [✅ Legal pages]
│   ├── login/page.tsx                     [✅ Login]
│   ├── signup/page.tsx                    [✅ Sign up]
│   ├── contact/page.tsx                   [✅ Contact form]
│   ├── onboarding/                        [⚠️ Onboarding flow - redirect issues]
│   ├── questionnaire/                     [✅ Project questionnaire]
│   ├── billing/page.tsx                   [✅ Billing]
│   ├── settings/page.tsx                  [✅ User settings]
│   ├── ceo/page.tsx                       [✅ CEO dashboard]
│   ├── projects/page.tsx                  [✅ Projects list]
│   ├── legal/                             [✅ Legal documents]
│   └── layout.tsx                         [✅ Root layout]
├── components/
│   ├── admin/
│   │   ├── AdminNav.tsx                   [✅ Admin navigation]
│   │   ├── AnalyticsClient.tsx            [✅ Analytics display]
│   │   ├── CalendarClient.tsx             [✅ Calendar widget]
│   │   ├── ClientDetailClient.tsx         [✅ Client detail view]
│   │   ├── ClientModal.tsx                [✅ Create/edit client modal]
│   │   ├── ClientTasksClient.tsx          [✅ Client tasks]
│   │   ├── CommandPalette.tsx             [✅ Command palette]
│   │   ├── DataTable.tsx                  [✅ Generic data table]
│   │   ├── EditUserModal.tsx              [✅ User editing]
│   │   ├── FinancesClient.tsx             [✅ Finance dashboard]
│   │   ├── InvoiceDetailClient.tsx        [✅ Invoice detail]
│   │   ├── InvoiceModal.tsx               [✅ Invoice creation]
│   │   ├── invoices-list.tsx              [✅ Invoice list]
│   │   ├── messages-feed.tsx              [✅ Message feed]
│   │   ├── NotificationsBell.tsx          [✅ Notifications]
│   │   ├── ProjectDetailClient.tsx        [⚠️ Project detail - visual issues]
│   │   ├── ProjectsClient.tsx             [⚠️ Projects list - glitches]
│   │   ├── projects-list.tsx              [⚠️ Projects list component]
│   │   ├── TodosClient.tsx                [✅ Todo management]
│   │   ├── TrainingClient.tsx             [✅ Training display]
│   │   ├── CreateProjectModal.tsx         [✅ Create project modal]
│   │   ├── SidebarNav.tsx                 [✅ Sidebar navigation]
│   │   └── (other components)             [✅ Multiple UI components]
│   ├── client/
│   │   ├── ClientDashboard.tsx            [✅ Client main dashboard]
│   │   ├── ProjectCard.tsx                [✅ Project card]
│   │   ├── InvoiceCard.tsx                [✅ Invoice card]
│   │   └── (other components)             [✅ Client-specific UI]
│   ├── public/
│   │   ├── Navbar.tsx                     [✅ Public navbar]
│   │   ├── Footer.tsx                     [✅ Footer]
│   │   ├── Hero.tsx                       [✅ Hero section]
│   │   └── (other components)             [✅ Public page components]
│   ├── ui/
│   │   ├── Button.tsx                     [✅ shadcn Button]
│   │   ├── Card.tsx                       [✅ shadcn Card]
│   │   ├── Dialog.tsx                     [✅ shadcn Dialog]
│   │   ├── Input.tsx                      [✅ shadcn Input]
│   │   ├── Table.tsx                      [✅ shadcn Table]
│   │   ├── Tabs.tsx                       [✅ shadcn Tabs]
│   │   ├── Select.tsx                     [✅ shadcn Select]
│   │   ├── Checkbox.tsx                   [✅ shadcn Checkbox]
│   │   ├── Label.tsx                      [✅ shadcn Label]
│   │   └── (other UI components)          [✅ All shadcn/ui components]
│   ├── settings/
│   │   ├── ProfileSettings.tsx            [❓ May not exist]
│   │   ├── AccountSettings.tsx            [❓ May not exist]
│   │   ├── SecuritySettings.tsx           [❓ May not exist]
│   │   └── (other settings)               [❓ Incomplete]
│   ├── shared/
│   │   ├── Header.tsx                     [✅ Shared header]
│   │   ├── Sidebar.tsx                    [✅ Shared sidebar]
│   │   └── (common components)            [✅ Shared UI]
│   ├── layout/
│   │   ├── MainLayout.tsx                 [✅ Main layout]
│   │   └── AuthLayout.tsx                 [✅ Auth layout]
│   ├── profile/
│   │   └── (profile components)           [✅ Profile-related]
│   ├── questionnaire/
│   │   └── (questionnaire components)     [✅ Questionnaire UI]
│   ├── navbar/
│   │   └── (navbar components)            [✅ Navigation components]
│   ├── auth/
│   │   └── (auth components)              [✅ Authentication UI]
│   ├── chat/
│   │   └── (chat components)              [✅ Chat/messaging UI]
│   └── (other feature folders)
├── server/
│   ├── actions/
│   │   ├── admin.ts                       [✅ Admin server actions]
│   │   ├── client.ts                      [✅ Client actions]
│   │   ├── ceo.ts                         [✅ CEO dashboard actions]
│   │   ├── database.ts                    [✅ Database operations]
│   │   ├── invoice.ts                     [✅ Invoice operations]
│   │   ├── leads.ts                       [✅ Lead management]
│   │   ├── payouts.ts                     [⚠️ TODO - taskPayout model missing]
│   │   ├── projects.ts                    [✅ Project operations]
│   │   ├── prospects.ts                   [✅ Prospect discovery]
│   │   ├── stripe.ts                      [✅ Stripe integration]
│   │   ├── team.ts                        [✅ Team management]
│   │   ├── test.ts                        [🧪 Test data creation]
│   │   └── (other actions)                [✅ Various operations]
│   ├── db.ts                              [✅ Prisma client]
│   └── utils/
│       ├── (helper functions)             [✅ Utilities]
│       └── validators.ts                  [✅ Data validation]
├── lib/
│   ├── auth.ts                            [✅ Auth configuration]
│   ├── prisma.ts                          [✅ Prisma utilities]
│   ├── utils.ts                           [✅ General utilities]
│   ├── constants.ts                       [✅ App constants]
│   └── (other helpers)                    [✅ Various utilities]
├── hooks/
│   ├── useSession.ts                      [✅ Session hook]
│   ├── useAuth.ts                         [✅ Auth hook]
│   └── (other custom hooks)               [✅ React hooks]
├── types/
│   ├── next-auth.d.ts                     [✅ NextAuth types]
│   ├── index.ts                           [✅ TypeScript types]
│   └── (other type definitions)           [✅ TS definitions]
├── styles/
│   ├── globals.css                        [✅ Global styles]
│   └── (component styles)                 [✅ Tailwind CSS]
├── providers/
│   ├── AuthProvider.tsx                   [✅ Auth context]
│   ├── ToastProvider.tsx                  [✅ Toast notifications]
│   └── (other providers)                  [✅ Context providers]
├── stores/
│   └── (state management)                 [✅ Zustand/Redux stores]
└── features/
    ├── auth/                              [✅ Auth feature module]
    ├── admin/                             [✅ Admin feature module]
    └── (other feature modules)            [✅ Feature-based organization]

prisma/
├── schema.prisma                          [✅ Database schema - 2144 lines]
├── migrations/                            [✅ Database migrations]
└── seed.ts                                [✅ Database seeding]

public/
├── icons/                                 [✅ Icon assets]
├── images/                                [✅ Image assets]
└── (static assets)                        [✅ Public files]

scripts/
├── seed-templates.ts                      [✅ Seed email templates]
├── populate-leads.ts                      [✅ Populate lead data]
└── (utility scripts)                      [✅ Build/utility scripts]

docs/
├── api-documentation.md                   [✅ API docs]
├── deployment-guide.md                    [✅ Deployment info]
├── google-oauth-configuration.md          [✅ OAuth setup]
└── (other documentation)                  [✅ Various docs]

.env.example                               [✅ Environment template]
package.json                               [✅ Dependencies]
tsconfig.json                              [✅ TypeScript config]
next.config.js                             [✅ Next.js config]
tailwind.config.js                         [✅ Tailwind config]
postcss.config.js                          [✅ PostCSS config]
vercel.json                                [✅ Vercel config]
middleware.ts                              [✅ Next.js middleware]
```

---

## ✨ Feature Inventory & Status

### 🎛️ ADMIN DASHBOARD

#### Main Features
- [x] **Main Dashboard** - ✅ WORKING - Statistics & overview cards
- [x] **Clients Page** - ⚠️ BROKEN - Created clients not displaying in list
- [x] **Client Detail** - ❓ UNTESTED - Client detail page exists
- [x] **Projects Page** - ⚠️ VISUAL ISSUES - Layout glitches & missing features
- [x] **Project Detail** - ❓ UNTESTED - May have issues
- [x] **Invoices** - ✅ MOSTLY WORKING - List & detail views functional
- [x] **Tasks/Todos** - ✅ WORKING - Full task management
- [x] **Finance Dashboard** - ✅ WORKING - Revenue tracking
- [x] **Analytics** - ✅ WORKING - Performance metrics
- [x] **Calendar** - ✅ WORKING - Event scheduling
- [x] **Activity Feed** - ✅ WORKING - Activity logging
- [x] **Messages** - ✅ WORKING - Communication thread
- [x] **Leads/Prospects** - ⚠️ PARTIALLY - Lead discovery working, UI cluttered
- [x] **Email Templates** - ✅ WORKING - Manage email templates
- [x] **Maintenance Plans** - ✅ WORKING - Subscription management

#### Admin Settings (Status: Incomplete)
- [ ] **Profile Settings** - ❓ May exist in components
- [ ] **Account Settings** - ❓ May exist in components
- [ ] **Security Settings** - ❓ 2FA settings not implemented
- [ ] **Notification Preferences** - ❓ Database model exists, UI missing
- [ ] **API Keys Management** - ❌ NOT IMPLEMENTED
- [ ] **Integrations Settings** - ❓ Database exists, UI unknown
- [ ] **Billing Settings** - ✅ In main billing route
- [ ] **Team Management** - ✅ WORKING - Add/manage staff

#### Special Admin Features
- [x] **Database Management** - ✅ Admin-only database interface
- [x] **CEO Dashboard** - ✅ WORKING - Executive overview
- [x] **Executive Dashboard** - ✅ WORKING - Management metrics
- [x] **Staff/Team Training** - ✅ WORKING - Training assignments
- [x] **Resources Library** - ✅ WORKING - Knowledge base
- [x] **Tools Directory** - ✅ WORKING - Tech stack tools
- [x] **Links Manager** - ✅ WORKING - Quick links
- [x] **Learning Center** - ✅ WORKING - Educational content

---

### 👥 CLIENT DASHBOARD (Portal)

- [x] **Client Overview** - ✅ WORKING - Dashboard view
- [x] **My Projects** - ✅ WORKING - View assigned projects
- [x] **Project Details** - ✅ WORKING - Detailed project view
- [x] **Invoices** - ✅ WORKING - View & pay invoices
- [x] **Messages** - ✅ WORKING - Communication with agency
- [x] **Tasks** - ✅ WORKING - View assigned tasks
- [x] **Files** - ✅ WORKING - Access project files
- [x] **Billing/Subscriptions** - ✅ WORKING - Manage subscriptions
- [x] **Settings** - ✅ WORKING - Profile & preferences
- [x] **Onboarding** - ⚠️ REDIRECT ISSUES - May not complete properly

---

### 🌐 PUBLIC WEBSITE

- [x] **Homepage** - ✅ WORKING - Landing page
- [x] **Services Page** - ✅ WORKING - Service offerings
- [x] **About Page** - ✅ WORKING - Company info
- [x] **Contact Form** - ✅ WORKING - Lead generation
- [x] **Legal Pages** - ✅ WORKING - Terms, Privacy, etc.
- [x] **Portfolio** - ❓ Not verified

---

### 🔐 AUTHENTICATION SYSTEM

- [x] **Email/Password Sign In** - ✅ WORKING
- [x] **Email/Password Registration** - ✅ WORKING
- [x] **Google OAuth** - ✅ WORKING
- [x] **GitHub OAuth** - ❓ Code exists, not active
- [x] **LinkedIn OAuth** - ❓ Code exists, not active
- [x] **Password Reset** - ✅ WORKING
- [x] **Email Verification** - ✅ WORKING
- [x] **Two-Factor Auth (2FA)** - ❌ DATABASE MODEL EXISTS - UI NOT IMPLEMENTED
- [x] **Session Management** - ✅ WORKING - JWT-based

---

## 🗄️ Database Schema Overview

### Core Models (35+ Prisma Models)

#### User & Organization
- **User** - User accounts with roles (ADMIN, STAFF, CLIENT, CEO, CFO, DESIGNER, DEV, etc.)
- **Organization** - Client companies/organizations
- **OrganizationMember** - Team membership with roles
- **UserProfile** - Extended user info (business, professional, social)
- **UserSession** - Device session tracking
- **UserPreferences** - User preferences (in schema)
- **NotificationPreferences** - Email/notification settings
- **LoginHistory** - Login audit trail
- **TwoFactorAuth** - 2FA configuration (UI NOT IMPLEMENTED)
- **TosAcceptance** - Terms of service tracking

#### Lead Generation & Prospects
- **Lead** - Converted leads/prospects from discovery
- **Prospect** - Discovered prospects (not yet converted)
- **ProspectActivity** - Activity tracking for prospects
- **SentEmail** - Email campaign tracking with Resend integration
- **EmailTemplate** - Email template storage
- **EmailCampaign** - Email campaign management

#### Projects & Tasks
- **Project** - Client projects with full lifecycle tracking
- **ProjectMilestone** - Project milestones
- **ProjectQuestionnaire** - Project questionnaire responses
- **ClientTask** - Tasks assigned to clients
- **Todo** - Internal task management with kanban board
- **TimeLog** - Time tracking for tasks
- **ChangeRequest** - Change requests for maintenance plans
- **Request** - Project requests

#### Billing & Invoicing
- **Invoice** - Invoice generation and tracking
- **InvoiceItem** - Line items for invoices
- **Payment** - Payment processing and tracking
- **Quote** - Price quotes for services
- **PricingRule** - Pricing configuration
- **FinanceTransaction** - General finance tracking
- **RevenueSplit** - Revenue sharing configuration

#### Subscriptions & Maintenance
- **MaintenancePlan** - Monthly maintenance subscriptions (3 tiers: ESSENTIALS, DIRECTOR, COO)
- **MaintenanceSubscription** - Old subscription model
- **MaintenanceLog** - Maintenance activity logging
- **MaintenanceSchedule** - Scheduled maintenance
- **Subscription** - Addon subscriptions
- **HourPack** - Purchasable hour packs for overage
- **RolloverHours** - Rollover hour tracking
- **OverageNotification** - Usage warnings

#### Communication
- **ChatMessage** - Chat messages
- **Channel** - Chat channels (GENERAL, PROJECT, SUPPORT, etc.)
- **ChannelMember** - Channel membership
- **MessageThread** - Message thread conversations
- **ThreadMessage** - Messages in threads
- **Notification** - In-app notifications
- **Message** - General message model

#### Content & Resources
- **Training** - Training materials (DOC, VIDEO, QUIZ, LINK)
- **Assignment** - Training assignments
- **Completion** - Training completion tracking
- **Resource** - Knowledge base resources
- **LearningResource** - Learning materials
- **Tool** - Tools directory
- **ToolEntry** - Tool entries
- **Link** - Quick links
- **File** - File uploads

#### Recordings & Media
- **Recording** - Video/screen recordings

#### Activity & Audit
- **Activity** - General activity logging
- **FeedEvent** - Project feed events
- **SystemLog** - System activity audit
- **AISuggestion** - AI recommendations

#### Utility
- **Account** - NextAuth OAuth accounts
- **Session** - NextAuth sessions
- **VerificationToken** - Email verification tokens
- **Signature** - Document signatures
- **WebhookEvent** - Webhook event tracking
- **StaffInviteCode** - Staff invitation codes
- **BriefQuestionnaire** - Initial project brief
- **Automation** - Workflow automation

### Enums (20+ Enums)
- UserRole, OrgRole, LeadStatus, ProjectStatus, InvoiceStatus, PaymentStatus
- TodoStatus, TodoPriority, ActivityType, MaintenanceStatus, NotificationType
- WebsiteQuality, ProjectStage, TransactionType, MaintenanceTier, NonprofitTier
- HourPackType, ChangeRequestCategory, ChangeRequestPriority, UsageWarningLevel
- EmailCategory, CampaignStatus, EventStatus, ChatStatus, AIMessageRole
- And more...

### Known Database Issues
- ⚠️ **Decimal Serialization** - Warnings on invoice/payment amounts
- ⚠️ **Missing TaskPayout Model** - Referenced in payouts.ts but not in schema (TODO comments)
- ⚠️ **ProspectActivity** - Complex activity tracking may need optimization
- ⚠️ **EmailCampaign** - Model may exist but not fully utilized

---

## 📡 API Routes Inventory

### Authentication Routes
```
POST /api/auth/[...nextauth]         [✅] NextAuth endpoint
POST /api/auth/register               [✅] User registration
POST /api/auth/verify-email           [✅] Email verification
```

### Admin API Routes
```
GET/POST  /api/admin/clients           [✅] Client management
GET/POST  /api/admin/projects          [✅] Project management
GET/POST  /api/admin/invoices          [✅] Invoice management
GET/POST  /api/admin/tasks             [✅] Task management
GET       /api/admin/analytics         [✅] Analytics data
```

### Lead & Prospect Routes
```
GET/POST  /api/leads                   [✅] Lead management
GET/POST  /api/prospects               [✅] Prospect management
POST      /api/leads/discover-places   [⚠️] Google Places discovery (working, UI issues)
POST      /api/leads/analyze           [✅] Claude AI analysis
POST      /api/leads/enrich            [✅] Lead data enrichment
```

### Project Routes
```
GET/POST  /api/projects                [✅] Project CRUD
POST      /api/projects/[id]           [✅] Update project
GET       /api/projects/[id]           [✅] Get project
```

### Invoicing & Billing
```
GET/POST  /api/invoices                [✅] Invoice management
POST      /api/invoices/[id]           [✅] Invoice operations
POST      /api/billing                 [✅] Billing operations
GET       /api/subscriptions           [✅] Subscription list
POST      /api/stripe/checkout         [✅] Stripe checkout
POST      /api/webhooks/stripe         [✅] Stripe webhooks
```

### Communication
```
GET/POST  /api/messages                [✅] Message CRUD
GET/POST  /api/notifications           [✅] Notification management
GET/POST  /api/templates               [✅] Email template CRUD
```

### User Management
```
GET/POST  /api/profile                 [✅] User profile
POST      /api/users                   [✅] User operations
```

### Utility Routes
```
POST      /api/start-project           [✅] Project creation wizard
POST      /api/emails                  [✅] Email sending (Resend)
GET       /api/env-check               [✅] DEBUG - Env var checker
GET       /api/debug-auth              [✅] DEBUG - Auth debugger
GET       /api/cron                    [✅] Scheduled tasks
POST      /api/uploadthing             [✅] File upload handling
```

### Test Routes
```
GET       /api/test-db                 [🧪] Database connection test
GET       /api/test-auth-direct        [🧪] Auth test
GET       /api/test-email              [🧪] Email sending test
GET       /api/test-google-direct      [🧪] Google OAuth test
GET       /api/test-google-callback    [🧪] OAuth callback test
```

---

## 🧩 Components Library

### UI Components (shadcn/ui based)
- Button, Card, Dialog, Input, Table, Tabs, Select
- Checkbox, Label, Textarea, Toast, Tooltip, Badge
- Dropdown, Modal, Sidebar, Skeleton, Alert
- And many more shadcn/ui components

### Admin Custom Components
- `AdminNav` - Navigation bar
- `DataTable` - Generic sortable/filterable table
- `ClientModal` - Create/edit client modal
- `ProjectsClient` - Projects list with filtering
- `ProjectDetailClient` - Project detail view
- `InvoiceModal` - Invoice creation/editing
- `InvoiceDetailClient` - Invoice detail view
- `TodosClient` - Todo management interface
- `FinancesClient` - Finance dashboard
- `AnalyticsClient` - Analytics display
- `CalendarClient` - Calendar widget
- `CommandPalette` - Command palette (Ctrl+K)
- `NotificationsBell` - Notification dropdown
- `TrainingClient` - Training display
- `ClientTasksClient` - Client task management
- `EditUserModal` - User editing modal

### Client Portal Components
- `ClientDashboard` - Main client dashboard
- `ProjectCard` - Project card display
- `InvoiceCard` - Invoice card display
- Various client-specific UI components

### Settings Components
- Status: ❓ INCOMPLETE - Settings pages may not have dedicated components
- Basic settings in main pages

### Shared Components
- `Header` - Page header
- `Sidebar` - Navigation sidebar
- `PageShell` - Page container
- `Background` - Background styling
- `ParticlesBackground` - Animated particles

---

## 🔌 Integrations & Services

### ✅ ACTIVELY CONFIGURED & WORKING

1. **NextAuth.js v5 (Beta)**
   - Google OAuth provider
   - Email/password authentication
   - JWT sessions
   - Database adapter for Prisma
   - API: `/api/auth/[...nextauth]`

2. **Prisma ORM + PostgreSQL**
   - Database: Neon (PostgreSQL)
   - Schema: 35+ models, 2144 lines
   - Migrations: Automatic with Prisma

3. **Google Places API**
   - Route: `/api/leads/discover-places`
   - Usage: Discover prospects by location/category
   - Status: ⚠️ Working but UI needs improvement

4. **Anthropic Claude API**
   - Route: `/api/leads/analyze`
   - Usage: AI-powered lead analysis
   - Integration: Full implementation

5. **Resend Email Service**
   - Usage: Email sending for campaigns
   - Models: `SentEmail`, `EmailTemplate`
   - Status: ✅ Fully integrated

6. **Stripe (Partial)**
   - Webhooks: `/api/webhooks/stripe`
   - Checkout: `/api/stripe/checkout`
   - Status: ⚠️ Configured but needs testing
   - Models: Payment, Invoice, MaintenancePlan with stripeIds

7. **UploadThing**
   - File uploads for projects
   - Configuration exists
   - Status: ✅ Integrated

8. **Vercel**
   - Deployment platform
   - Environment: Production (deployed)
   - Integration: Vercel integration for projects

### ❓ PARTIALLY CONFIGURED

1. **GitHub OAuth**
   - Code exists in auth.config.ts
   - Status: ❌ Not active/tested
   - Would need activation in NextAuth

2. **LinkedIn OAuth**
   - Code exists in auth.config.ts
   - Status: ❌ Not active/tested
   - Would need activation in NextAuth

3. **OpenAI API**
   - Package included in package.json
   - Usage: Limited or not fully integrated
   - Status: ⚠️ Partially configured

### ❌ NOT CONFIGURED

1. **SMS Service** - Not configured
2. **Calendar Sync** - Database model exists, integration unknown
3. **Video Conferencing** - Not integrated
4. **Project Management Integration** - Not configured
5. **CRM Integration** - Database models for integration exist but not connected

---

## 🐛 Known Issues & Bugs

### CRITICAL (Blocking Functionality)

1. **Clients List Not Displaying** ⚠️ CRITICAL
   - Location: `/admin/clients/page.tsx`
   - Issue: Created clients are not showing in the list despite being in database
   - Impact: Cannot manage client relationships
   - Status: Needs investigation

2. **Projects Page Visual Glitches** ⚠️ CRITICAL
   - Location: `/admin/projects/page.tsx`
   - Issue: Layout issues, missing features, display problems
   - Impact: Projects difficult to manage
   - Status: Needs layout fix

3. **Onboarding Redirect Issues** ⚠️ CRITICAL
   - Location: `/onboarding/`
   - Issue: Redirect loops, session not persisting
   - Impact: New clients cannot complete onboarding
   - Status: Needs session/redirect fix

### MEDIUM (Degraded Experience)

1. **Lead Discovery UI Cluttered** ⚠️
   - Location: `/admin/leads/`
   - Issue: Old prospects still showing, UI needs cleanup
   - Impact: Difficult to navigate prospects
   - Status: UI improvement needed

2. **Decimal Serialization Warnings** ⚠️
   - Location: Invoice, Payment models
   - Issue: Decimal fields causing JSON serialization warnings
   - Impact: Console warnings during invoice operations
   - Status: Needs Decimal fix

3. **Project Detail Page Issues** ⚠️
   - Status: Untested, likely has issues related to projects page
   - Impact: Cannot view full project details
   - Status: Needs testing & fix

4. **Settings Pages Incomplete** ⚠️
   - Location: `/admin/settings/`, `/settings/`
   - Issue: Limited settings pages implemented
   - Impact: Users cannot configure all preferences
   - Status: Needs implementation

### LOW (Polish Needed)

1. **Mobile Responsiveness**
   - Some admin pages not fully responsive
   - Status: Could be improved

2. **Loading States**
   - Some pages missing loading indicators
   - Status: UX improvement

3. **Error Boundaries**
   - Limited error handling on some pages
   - Status: Needs more comprehensive error handling

4. **Console Spam**
   - Debug logging in invoice.ts (fetch calls)
   - Status: Clean up debug code

### TODO COMMENTS IN CODE

From codebase scan:
- `payouts.ts` (5 locations) - TODO: Add taskPayout model to Prisma schema
- Multiple debug/test comments

---

## 🚧 Missing Features

### Planned But Not Implemented

#### Settings & User Preferences
- [ ] Profile Settings Page UI
- [ ] Account Settings Page UI
- [ ] Security Settings Page UI (2FA not exposed)
- [ ] Notification Preferences UI (model exists)
- [ ] API Keys Management
- [ ] Integrations Configuration Page
- [ ] User Preferences UI (model exists)

#### Admin Features
- [ ] Advanced Reporting (foundation exists)
- [ ] Bulk Operations
- [ ] Custom Workflows
- [ ] Staff/Team Chat Integration
- [ ] Advanced Export Options
- [ ] Dashboard Customization

#### Client Portal
- [ ] File Collaboration Tools
- [ ] Real-time Updates
- [ ] Custom Client Portal Branding
- [ ] Client Document Signing (model exists)
- [ ] Advanced Permissions System

#### Project Management
- [ ] Kanban Board (foundation exists in Todo)
- [ ] Gantt Chart
- [ ] Resource Allocation
- [ ] Capacity Planning
- [ ] Team Collaboration Features

#### Financial
- [ ] Recurring Invoice Automation
- [ ] Multi-currency Support
- [ ] Tax Calculation
- [ ] Expense Tracking
- [ ] Budget vs Actual Reporting

#### Lead Discovery & Outreach
- [ ] Email Sequence Automation
- [ ] CRM Field Mapping
- [ ] Advanced Lead Scoring
- [ ] Duplicate Detection
- [ ] Batch Email Operations
- [ ] A/B Testing for Campaigns

#### Marketing & Sales
- [ ] Marketing Calendar
- [ ] Campaign Performance Analytics
- [ ] Lead Attribution
- [ ] Sales Pipeline Analytics
- [ ] Forecast Modeling

#### Knowledge Base
- [ ] AI-Powered Search
- [ ] Content Versioning
- [ ] Permission-based Content
- [ ] Search Analytics

#### Security & Compliance
- [ ] Role-based Access Control (RBAC) - Partial
- [ ] Audit Logs - Partial
- [ ] Data Encryption at Rest
- [ ] IP Whitelist
- [ ] Compliance Dashboard

---

## ⚙️ Environment Variables

### REQUIRED FOR PRODUCTION

```env
# Next.js & Hosting
NEXTAUTH_URL=https://your-production-domain.com
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32

# Database (PostgreSQL)
DATABASE_URL=postgresql://username:password@neon-host/database

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# API Keys - AI & Services
ANTHROPIC_API_KEY=sk-ant-your-key
OPENAI_API_KEY=sk-proj-your-key
GOOGLE_MAPS_API_KEY=your-google-maps-key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-public-maps-key (if using)

# Email Service (Resend)
RESEND_API_KEY=re_your-resend-key

# Payment Processing (Stripe)
STRIPE_SECRET_KEY=sk_test_or_sk_live_key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# File Uploads (UploadThing)
UPLOADTHING_TOKEN=your-uploadthing-token

# Optional - GitHub Integration
GITHUB_TOKEN=ghp_your-github-token (optional)
GITHUB_REPO_SLUG=owner/repo-name (optional)

# Feature Flags
SEEZEE_FEATURE_FEED=true
SEEZEE_FEATURE_MESSAGES=true
SEEZEE_FEATURE_INVOICES=true
SEEZEE_FEATURE_BILLING=true
```

### OPTIONAL FEATURES

```env
# LinkedIn OAuth (not currently active)
LINKEDIN_CLIENT_ID=your-linkedin-id
LINKEDIN_CLIENT_SECRET=your-linkedin-secret

# GitHub OAuth (not currently active)
GITHUB_CLIENT_ID=your-github-id
GITHUB_CLIENT_SECRET=your-github-secret

# Additional integrations
SLACK_WEBHOOK_URL=your-slack-webhook
ZAPIER_WEBHOOK_URL=your-zapier-webhook
```

### DEPLOYMENT NOTES

- ✅ Vercel deployment configured
- ✅ Auto environment variables sync
- ⚠️ Ensure all REQUIRED vars set before deployment
- ⚠️ Use `.env.local` for local development
- ⚠️ Never commit `.env` files to git

---

## 🚀 Deployment Information

### Current Production Status
- **URL**: https://see-388f970j6-seanspons-projects.vercel.app
- **Platform**: Vercel
- **Database**: Neon (PostgreSQL)
- **Status**: ✅ DEPLOYED & LIVE

### Vercel Configuration
- Automatic SSL certificates ✅
- Auto-builds on push ✅
- Environment variables synced ✅
- Serverless functions ✅
- Vercel Analytics integrated ✅

### Domain Configuration
- Main domain: see-zee.com (if configured)
- Production domain: Vercel auto-assigned
- DNS: CNAME pointing to Vercel

### Database Status
- Provider: Neon (PostgreSQL)
- Prisma Migrations: ✅ Applied
- Seeding: ✅ Seed scripts available
- Backups: ✅ Neon handles daily backups

### Build & Runtime
- Node.js version: ^20.x
- Build time: ~2-3 minutes
- Runtime: Node.js with Next.js serverless functions
- Memory: Standard Vercel allocation

### Recent Deployments
- ✅ Production deployment active
- ⚠️ Some features may need testing
- ⚠️ Known issues documented above

---

## 📊 Code Statistics

- **Total Prisma Models**: 35+
- **Prisma Schema Size**: 2,144 lines
- **Admin Pages**: 30+
- **Client Pages**: 10+
- **API Routes**: 40+
- **Components**: 100+
- **Server Actions**: 15+

---

## 🎯 Priority Issues for Resolution

### 🔴 HIGH PRIORITY (Do First)
1. Fix clients list not displaying
2. Fix projects page visual issues
3. Fix onboarding redirect problems

### 🟡 MEDIUM PRIORITY (Do Next)
1. Implement missing settings pages
2. Clean up lead discovery UI
3. Fix Decimal serialization warnings
4. Implement 2FA UI

### 🟢 LOW PRIORITY (Polish)
1. Improve mobile responsiveness
2. Add missing loading states
3. Enhance error boundaries
4. Clean up test routes

---

## 📝 Notes for Development

- All components use shadcn/ui patterns
- Database uses Prisma with automatic migrations
- Authentication is NextAuth.js v5 (beta)
- Server actions handle database operations
- API routes are RESTful
- Tailwind CSS with custom glass morphism
- Dark theme by default

---

**Document Version**: 1.0  
**Last Updated**: January 1, 2026  
**Created by**: Project Analysis Agent
