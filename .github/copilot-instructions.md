# SeeZee - Enterprise Web Agency Platform

SeeZee is a comprehensive Next.js 15 web agency platform with multi-tenant architecture, role-based access control, client/admin portals, subscription management, and integrated marketing/CRM systems.

## 🏗️ Architecture Overview

### Route Organization (Critical Pattern)
Routes use Next.js **route groups** to organize by access level - parentheses folders don't appear in URLs:
- `(public)/` - Landing pages, marketing pages (no auth required)
- `(client)/` - Client portal (CLIENT role required)
- `(admin)/` - Admin dashboard (ADMIN/CEO role required)  
- `(portal)/` - Shared authenticated routes
- `api/` - API routes and webhooks

**Key Files:**
- [middleware.ts](middleware.ts) - 418 lines of auth routing, CORS, and access control logic
- [src/auth.ts](src/auth.ts) - NextAuth v5 configuration with Google OAuth and Credentials
- [src/lib/authz.ts](src/lib/authz.ts) - Role-based guards: `requireUser()`, `requireAdmin()`, `requireStaff()`

### Authentication System (NextAuth v5)
**Multi-provider setup** with Google OAuth + Credentials (email/password):
```typescript
// Always use auth guards in server components/actions
import { requireAdmin } from "@/lib/authz";

export default async function AdminPage() {
  const session = await requireAdmin(); // Throws if not admin
  // Your page code
}
```

**Environment variables** (multiple naming schemes supported):
- `AUTH_SECRET` or `NEXTAUTH_SECRET` - Required for JWT signing
- `AUTH_GOOGLE_ID` or `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `AUTH_GOOGLE_SECRET` or `GOOGLE_CLIENT_SECRET` - Google OAuth secret
- `AUTH_URL` or `NEXTAUTH_URL` - Base URL (auto-detected in dev as `http://localhost:3000`)

**OAuth callback** URL must be registered in Google Console: `https://your-domain.com/api/auth/callback/google`

### Database Architecture (Prisma + PostgreSQL)
**Massive schema** with 2100+ lines in [prisma/schema.prisma](prisma/schema.prisma) - core models:
- `User` with `UserRole` enum (CLIENT, ADMIN, CEO, STAFF, DEVELOPER, DESIGNER)
- `Organization` - Multi-tenant support with `OrganizationMember` relationships
- `Project`, `ProjectRequest` - Client project management
- `Lead`, `Prospect` - CRM and marketing outreach
- `MaintenanceSubscription`, `Invoice`, `FinanceTransaction` - Billing
- `Training`, `Resource`, `Assignment` - Learning management system
- `BriefQuestionnaire`, `Questionnaire` - Client onboarding flows
- `Recording`, `CalendarEvent`, `ChatMessage` - Rich media and collaboration

**Database client singleton:** [src/lib/prisma.ts](src/lib/prisma.ts) exports `prisma` instance with health checks and retry logic

### Data Flow Patterns
1. **Server Components** → Direct Prisma queries (preferred for reads)
2. **Client Components** → Call API routes or server actions
3. **Forms** → Use server actions (`"use server"` directive) for mutations
4. **API Routes** → REST endpoints in `app/api/` using Next.js route handlers

**Example server action pattern:**
```typescript
"use server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authz";

export async function updateLead(id: string, data: any) {
  await requireAdmin();
  return await prisma.lead.update({ where: { id }, data });
}
```

## 🎨 Design System

**Glass Morphism Theme** with Tailwind CSS custom configuration:
- Dark theme with `bg-black` base and gradient overlays
- Glass effects: `backdrop-blur-lg` + `bg-white/5` + `border border-white/10`
- Glow shadows: `shadow-glow-blue`, `shadow-glow-red` (see [tailwind.config.js](tailwind.config.js))
- Primary red palette: `#dc2626` (matching Big Red Bus brand)
- Dynamic accent system via CSS variables: `var(--color-accent-primary)`

**Component patterns:**
- Shared UI in [src/components/ui/](src/components/ui/)
- Admin-specific in [src/components/admin/](src/components/admin/)
- Client-specific in [src/components/client/](src/components/client/)

## 🔧 Development Workflow

### Essential Commands
```bash
npm run dev              # Start dev server on :3000 (configured in package.json)
npm run build            # Production build (fails on type/build errors)
npm run db:push          # Push Prisma schema changes (dev)
npm run db:migrate       # Create migration files (production)
npm run db:generate      # Regenerate Prisma client (auto-runs on postinstall)
npm run db:studio        # Open Prisma Studio GUI
```

### Database Scripts
Custom scripts in [scripts/](scripts/) for data operations:
- `populate-leads.ts` - Generate test lead data
- `seed-templates.ts` - Seed email templates
- `clear-test-stripe-customers.ts` - Clean up Stripe test data

Run with: `npm run <script-name>` (ts-node configured in package.json)

### Building & Debugging
**Common build errors:**
1. **Prisma types outdated** → Run `npm run db:generate`
2. **Missing env vars** → Check [.env.local.example](docs/auth-environment-setup.md)
3. **Auth errors** → Review [middleware.ts](middleware.ts) logs (search for `#region agent log`)
4. **Type errors in route handlers** → Ensure `NextRequest`/`NextResponse` imports

**Middleware debugging:** All middleware logs prefixed with `[MIDDLEWARE]` - search codebase for these

## 💼 Key Business Logic

### Role-Based Access Control
Four primary roles with hierarchical permissions:
- `CEO` - Full system access (superadmin)
- `ADMIN` - Administrative access to most features
- `STAFF` - Internal team members (DEVELOPER, DESIGNER variants)
- `CLIENT` - Customer portal access only

**Check patterns in code:**
```typescript
// Example from src/lib/authz.ts
if (user.role === "CLIENT") {
  throw new Error("Forbidden: Staff access required");
}
```

### Subscription & Billing
Integrated Stripe payment system:
- [src/lib/stripe.ts](src/lib/stripe.ts) - Stripe API wrapper
- [src/lib/subscriptionPlans.ts](src/lib/subscriptionPlans.ts) - Plan definitions
- [src/app/api/webhooks/stripe/route.ts](src/app/api/webhooks/stripe/route.ts) - Webhook handler for payment events
- `MaintenanceSubscription` model - Recurring billing for maintenance contracts

### Marketing Outreach System
Comprehensive CRM in [src/lib/outreach/](src/lib/outreach/):
- `database-integrations.ts` - Prospect data management
- `email-campaigns.ts` - Bulk email sending with Resend
- `bulk-operations.ts` - Batch prospect operations

### AI Integrations
Multiple AI providers configured:
- **Anthropic Claude** - Code generation and analysis
- **OpenAI GPT** - Content generation and chat
- See [src/lib/ai/](src/lib/ai/) for provider wrappers

## 🚨 Critical Patterns to Follow

### Never Break These Rules
1. **Server/Client Boundary**: Never import Prisma or `"use server"` code in client components
2. **Auth Guards**: Always use `requireUser()`/`requireAdmin()` in protected routes
3. **Middleware**: Never modify `/api/auth` paths in middleware (line 37-39 in [middleware.ts](middleware.ts))
4. **Environment Variables**: Use both legacy (`NEXTAUTH_*`) and new (`AUTH_*`) naming for compatibility
5. **Type Safety**: Prisma types are generated - never manually create database types

### File Deletion Safety
**Before removing any admin page**, verify it's not referenced in:
- [src/components/admin/AdminNav.tsx](src/components/admin/AdminNav.tsx) - Admin navigation menu
- [src/app/admin/layout.tsx](src/app/admin/layout.tsx) - Admin layout wrapper
- Any redirect logic in [middleware.ts](middleware.ts)

Recent cleanup: Removed unused pages (recordings/upload, finance, purchases, marketing/campaigns, marketing/templates) - see terminal history

## 📚 Documentation Reference

Extensive docs in [docs/](docs/) and root `.md` files:
- [AUTH_SYSTEM_IMPLEMENTATION.md](AUTH_SYSTEM_IMPLEMENTATION.md) - Auth setup guide
- [PRODUCTION_READINESS_CHECKLIST.md](PRODUCTION_READINESS_CHECKLIST.md) - Deployment checklist
- [STRIPE_TEST_GUIDE.md](STRIPE_TEST_GUIDE.md) - Testing payments
- [docs/google-oauth-configuration.md](docs/google-oauth-configuration.md) - OAuth setup steps

**When stuck**, search for `.md` files with keywords - many debugging guides and implementation summaries exist.

## 🌐 Deployment

**Vercel Configuration:**
- Framework: Next.js (auto-detected)
- Build: `npm run build`
- Output: `.next` directory
- Node: 18.x or 20.x

**Critical env vars for production:**
```env
DATABASE_URL=postgresql://... (use connection pooling)
AUTH_SECRET=<random-64-char-string>
AUTH_URL=https://your-domain.com
AUTH_GOOGLE_ID=<from-google-console>
AUTH_GOOGLE_SECRET=<GOCSPX-format-secret>
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...
```

**Deployment scripts** (PowerShell):
- [deploy-now.ps1](deploy-now.ps1) - Quick deploy
- [deploy-with-log.ps1](deploy-with-log.ps1) - Deploy with logging
- [check-deployment.ps1](check-deployment.ps1) - Health check