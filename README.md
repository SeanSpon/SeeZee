# SeeZee - Enterprise Web Agency Platform

A comprehensive Next.js 15 enterprise platform for digital agencies, featuring multi-tenant architecture, client/admin portals, AI-powered lead generation, subscription management, and integrated CRM/marketing systems.

## 🎯 Overview

SeeZee is a full-featured digital agency management platform that bridges the gap between clients and agency operations. It provides distinct portals for clients to manage their projects and subscriptions, while giving agency staff powerful tools for lead generation, project management, marketing automation, and business operations.

## ✨ Key Features

### Client Portal
- **Project Dashboard**: Real-time project progress tracking and milestones
- **Subscription Management**: Tiered maintenance plans (Essentials, Director, COO)
- **Hour Bank System**: Track included hours, rollover limits, and purchase hour packs
- **Invoice & Payments**: Integrated Stripe payment processing
- **Change Requests**: Submit and track project modifications
- **Meeting Scheduling**: Calendar integration and meeting management
- **Support Center**: Tickets, resources, and file management

### Admin & CEO Portal
- **Lead Discovery**: AI-powered prospecting via Google Places API with lead scoring
- **Marketing Automation**: Email campaigns, drip sequences, and call script generation
- **Project Management**: Full project lifecycle with task assignment and time tracking
- **Finance Dashboard**: Invoicing, expenses, revenue splits, and monthly budgets
- **Team Management**: Task boards, training resources, and learning materials
- **Meeting Intelligence**: Record, transcribe, and extract action items from meetings
- **AI Assistant**: Chat integration with context-aware project support

### Marketing & Outreach
- **Prospect Pipeline**: Lead scoring, enrichment, and automated outreach
- **Email Campaigns**: Bulk email sending with Resend integration
- **Drip Campaigns**: Multi-step automated follow-up sequences
- **Template Library**: Customizable email and call script templates
- **Activity Tracking**: Monitor opens, clicks, and engagement

## 🛠 Tech Stack

### Core Framework
- **Framework**: Next.js 15 (App Router with Route Groups)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with Glass Morphism theme
- **Authentication**: NextAuth.js v5 (Google OAuth + Credentials)
- **Database**: PostgreSQL with Prisma ORM
- **Deployment**: Vercel

### Integrations
- **Payments**: Stripe (Subscriptions, Invoices, Webhooks)
- **Email**: Resend (Transactional + Marketing)
- **AI**: OpenAI GPT + Anthropic Claude (Lead scoring, content generation)
- **Lead Discovery**: Google Places API + Google Maps API
- **File Storage**: UploadThing
- **Caching**: Upstash Redis (Rate limiting)
- **Version Control**: GitHub API integration
- **Deployment Tracking**: Vercel API

## 📦 Installation & Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/SeanSpon/SeeZee.git
   cd SeeZee
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file (see `.env.example` for reference):
   
   ```env
   # Authentication (NextAuth v5)
   AUTH_SECRET=your-secret-here-minimum-32-characters
   AUTH_URL=http://localhost:3000
   AUTH_GOOGLE_ID=your-google-client-id
   AUTH_GOOGLE_SECRET=your-google-client-secret
   
   # Database
   DATABASE_URL=postgresql://username:password@localhost:5432/seezee
   
   # Stripe
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   
   # Resend Email
   RESEND_API_KEY=re_...
   
   # OpenAI & Anthropic (optional for AI features)
   OPENAI_API_KEY=sk-...
   ANTHROPIC_API_KEY=sk-ant-...
   
   # Google Maps (for lead discovery)
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-maps-key
   ```

4. **Set up the database**
   ```bash
   npm run db:push       # Push schema to database
   npm run db:generate   # Generate Prisma client
   npm run db:studio     # Open Prisma Studio (optional)
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🌐 Deployment

### Production Deployment (Vercel)

1. **Database Setup**
   - Create a PostgreSQL database (recommended: Neon, Supabase, or Vercel Postgres)
   - Note your connection string with connection pooling enabled

2. **Import to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project" and import your GitHub repository
   - Framework: Next.js (auto-detected)
   - Build Command: `npm run build`
   - Output Directory: `.next`

3. **Environment Variables**
   
   Add all environment variables in Vercel → Settings → Environment Variables:
   
   ```env
   # Authentication
   AUTH_SECRET=<random-string-min-32-chars>
   AUTH_URL=https://your-domain.vercel.app
   AUTH_GOOGLE_ID=<from-google-console>
   AUTH_GOOGLE_SECRET=<GOCSPX-format-secret>
   
   # Database (use connection pooling URL)
   DATABASE_URL=postgresql://...
   
   # Stripe
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_PUBLISHABLE_KEY=pk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   
   # Email
   RESEND_API_KEY=re_...
   
   # AI Services (optional)
   OPENAI_API_KEY=sk-...
   ANTHROPIC_API_KEY=sk-ant-...
   
   # Google Maps
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...
   ```

4. **Post-Deployment Setup**
   - Run database migrations: `npm run db:migrate`
   - Configure Google OAuth callback: `https://your-domain.vercel.app/api/auth/callback/google`
   - Set up Stripe webhook endpoint: `https://your-domain.vercel.app/api/webhooks/stripe`
   - Test authentication and payment flows

### Deployment Scripts

For quick deployment and monitoring:

```bash
# PowerShell scripts (Windows)
.\deploy-now.ps1              # Quick deploy
.\deploy-with-log.ps1         # Deploy with detailed logging
.\check-deployment.ps1        # Health check and validation
```

## 🗺️ Route Organization

SeeZee uses Next.js **route groups** (parentheses folders) to organize routes by access level. These folders don't appear in URLs:

### Public Routes (`(public)/`)
- `/` - Homepage and landing pages
- `/start` - Client onboarding questionnaire
- `/contact` - Contact form
- `/about`, `/services`, `/partners`, `/case-studies` - Marketing pages

### Client Routes (`(client)/client/`)
**Authentication Required** - CLIENT role
- `/client/dashboard` - Client project overview
- `/client/projects` - Project list and details
- `/client/invoices` - Invoice management
- `/client/subscriptions` - Maintenance plan management
- `/client/hours` - Hour bank and hour pack purchases
- `/client/requests` - Change requests and support tickets
- `/client/meetings` - Calendar and meeting scheduling
- `/client/files` - Document storage

### Admin Routes (`(admin)/admin/`)
**Authentication Required** - ADMIN/CEO/STAFF roles
- `/admin/projects` - Project management
- `/admin/pipeline` - Sales pipeline (leads → clients)
- `/admin/leads` - Lead discovery and scoring
- `/admin/marketing` - Email campaigns and templates
- `/admin/finance` - Invoices, expenses, budgets
- `/admin/tasks` - Team task board (Kanban)
- `/admin/team` - Team management
- `/admin/recordings` - Meeting transcriptions
- `/admin/learning` - Training resources

### CEO Routes (`admin/ceo/`)
**Authentication Required** - CEO role only
- `/admin/ceo/dashboard` - Executive analytics
- `/admin/ceo/cloud-api` - System automation and logs

### API Routes (`api/`)
- `/api/auth/*` - NextAuth authentication
- `/api/stripe/*` - Payment webhooks
- `/api/chat/*` - AI chatbot
- `/api/prospects/*` - Lead management
- `/api/checkout/*` - Subscription purchase flows

## 🏗️ Architecture & Project Structure

### Authentication & Authorization

**Multi-provider Authentication** (NextAuth v5):
- Google OAuth (primary)
- Email/Password (credentials)
- Role-based access control (RBAC)

**User Roles**:
- `CLIENT` - Project clients (limited to their own data)
- `ADMIN` - Full administrative access
- `CEO` - Executive access + analytics
- `STAFF` - Internal team (DEVELOPER, DESIGNER, OUTREACH_SPECIALIST variants)

**Auth Guards** (`src/lib/authz.ts`):
```typescript
import { requireAdmin, requireUser, requireStaff } from "@/lib/authz";

// Protect server components/actions
const session = await requireAdmin(); // Throws if not admin
```

### Project Structure

```
src/
├── app/                        # Next.js App Router
│   ├── (public)/              # Public marketing pages
│   ├── (client)/client/       # Client portal (CLIENT role)
│   ├── (admin)/admin/         # Admin dashboard (ADMIN/CEO role)
│   ├── (portal)/              # Shared authenticated routes
│   └── api/                   # API routes and webhooks
├── components/
│   ├── ui/                    # Shadcn UI components
│   ├── admin/                 # Admin-specific components
│   ├── client/                # Client-specific components
│   └── shared/                # Shared components
├── lib/
│   ├── authz.ts              # Role-based guards
│   ├── prisma.ts             # Database client singleton
│   ├── stripe.ts             # Stripe integration
│   ├── ai/                   # AI provider wrappers
│   └── outreach/             # Marketing automation
├── middleware.ts              # Auth routing & CORS (418 lines)
├── src/auth.ts               # NextAuth v5 configuration
└── prisma/
    └── schema.prisma         # Database schema (2100+ lines)
```

## 💾 Database Schema

### Core Models (Prisma)

**User Management**:
- `User`, `Organization`, `OrganizationMember` - Multi-tenant support
- `UserRole` enum - CLIENT, ADMIN, CEO, STAFF, DEVELOPER, DESIGNER

**Project & Workflow**:
- `Project`, `ProjectMilestone`, `ProjectRequest` - Project lifecycle
- `ClientTask`, `ChangeRequest` - Client-facing tasks
- `Todo` - Internal tasks with time tracking
- `UnifiedRequest` - Universal request system

**Lead/Sales Pipeline**:
- `Lead`, `Prospect`, `ProspectActivity` - Lead management
- `EmailCampaign`, `DripCampaign`, `DripCampaignStep` - Marketing automation
- `SentEmail`, `EmailTemplate` - Email tracking
- `Quote` - Pricing quotes

**Finance & Billing**:
- `Invoice`, `InvoiceItem`, `Payment` - Invoicing system
- `FinanceTransaction`, `BusinessExpense`, `MonthlyBudget` - Accounting
- `RevenueSplit` - Team payouts
- `MaintenancePlan` - Subscription tiers (Nonprofit: Essentials/Director/COO)
- `HourPack`, `RolloverHours`, `MaintenanceLog` - Hour tracking

**Communications**:
- `AIConversation`, `AIMessage` - AI chatbot
- `MessageThread`, `ThreadMessage` - Client messaging
- `CalendarEvent` - Meeting scheduling
- `Recording` - Meeting transcriptions with AI summaries

**Team & Learning**:
- `Training`, `Assignment`, `Completion` - Training system
- `Resource`, `ToolEntry`, `Link` - Knowledge base
- `TaskMaterial` - Learning materials

### Database Commands

```bash
npm run db:push          # Push schema changes (development)
npm run db:migrate       # Create migration files (production)
npm run db:generate      # Regenerate Prisma client
npm run db:studio        # Open Prisma Studio GUI
```

### Custom Scripts

Located in `scripts/` directory:
- `populate-leads.ts` - Generate test lead data
- `seed-templates.ts` - Seed email templates
- `clear-test-stripe-customers.ts` - Clean up Stripe test data

Run with: `npm run <script-name>` (ts-node configured)

## 🎨 Design System

**Glass Morphism Theme** with dark mode:
- Base: `bg-black` with gradient overlays
- Glass effects: `backdrop-blur-lg` + `bg-white/5` + `border border-white/10`
- Glow shadows: `shadow-glow-blue`, `shadow-glow-red` (see `tailwind.config.js`)
- Primary palette: Red `#dc2626` (Big Red Bus brand)
- Dynamic accents via CSS variables: `var(--color-accent-primary)`

**Component Libraries**:
- Shadcn UI (customized)
- Tailwind CSS utilities
- Custom glass morphism components

## 🚀 Unique Features

### 1. AI-Powered Lead Discovery
- Automated prospecting via Google Places API
- AI lead scoring and qualification
- Automated email and call script generation
- Multi-step drip campaign enrollment

### 2. Hour Bank System
- Monthly included hours per subscription tier
- Automatic rollover with caps
- Hour pack purchases (5, 10, 15, 20 hours)
- On-demand overages with flexible pricing

### 3. Meeting Intelligence
- Record meetings with automatic transcription
- AI-powered action item extraction
- Generate project briefs from meeting content
- Store and search historical recordings

### 4. Integrated Finance
- Stripe webhook automation
- Revenue split calculations
- Expense tracking and categorization
- Monthly budget monitoring

### 5. Multi-Tenant Architecture
- Organization-based data isolation
- Role-based access control (RBAC)
- Client and admin portal separation
- Secure middleware routing

## 🐛 Troubleshooting

### Common Issues

**Build Errors:**
```bash
# Prisma types outdated
npm run db:generate

# Check environment variables
cat .env.local

# Review logs
grep "\[MIDDLEWARE\]" logs/*.log
```

**Authentication Issues:**
- **Can't sign in?** See [CANT_SIGN_IN.md](./CANT_SIGN_IN.md) for user-friendly troubleshooting
- Verify `AUTH_SECRET` is set (minimum 32 characters, recommended 44+)
- Check `AUTH_URL` matches your domain
- Ensure Google OAuth callback URL is registered
- Review `middleware.ts` logs (search for `[MIDDLEWARE]` or `#region agent log` for auth flow details)
- For detailed debugging: See [docs/PRODUCTION_LOGIN_TROUBLESHOOTING.md](./docs/PRODUCTION_LOGIN_TROUBLESHOOTING.md)

**Database Errors:**
- Verify `DATABASE_URL` uses connection pooling
- Run `npm run db:push` to sync schema
- Check Prisma Client is generated: `npm run db:generate`
- For migrations: Use `npm run db:migrate` (production only)

**Type Errors in Route Handlers:**
- Ensure `NextRequest`/`NextResponse` imports are correct
- Check Prisma types are up to date
- Verify server/client component boundaries

## 📚 Documentation

Comprehensive documentation in `/docs` directory:
- `AUTH_SYSTEM_IMPLEMENTATION.md` - Authentication setup guide
- `PRODUCTION_READINESS_CHECKLIST.md` - Deployment checklist
- `STRIPE_TEST_GUIDE.md` - Testing payment flows
- `google-oauth-configuration.md` - OAuth setup steps

## 🔐 Security

### Critical Patterns to Follow

1. **Server/Client Boundary**: Never import Prisma or `"use server"` code in client components
2. **Auth Guards**: Always use `requireUser()`/`requireAdmin()` in protected routes
3. **Middleware**: Never modify `/api/auth` paths in middleware
4. **Environment Variables**: Use both legacy (`NEXTAUTH_*`) and new (`AUTH_*`) naming for compatibility
5. **Type Safety**: Prisma types are generated - never manually create database types

### Security Tools

Run before finalizing changes:
```bash
npm run lint              # ESLint checks
npm run build             # Type checking
```

## 🤝 Contributing

This is a production application. Contributions should follow:

1. Create feature branches from `main`
2. Make minimal, surgical changes
3. Write tests for new features
4. Ensure all checks pass before PR
5. Follow existing code patterns and style

## 📄 License

MIT License - feel free to use this project as a template for your own applications.

---

**Built with ❤️ by SeeZee Studios**  
Next.js 15 • TypeScript • Tailwind CSS • PostgreSQL • Prisma • Stripe • OpenAI

**Live Demo**: [https://see-zee-seanspons-projects.vercel.app](https://see-zee-seanspons-projects.vercel.app)