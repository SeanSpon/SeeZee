# Qwiz Feature-Builder Questionnaire - Implementation Guide

## Overview

The feature-builder questionnaire is a modern, single-page onboarding experience that replaces the previous 29-step multi-page flow. It combines visual service/feature selection with structured questions to generate quotes or redirect to Stripe checkout.

## Architecture

### Tech Stack
- **State Management**: Zustand 4.x with persist middleware
- **Animations**: Framer Motion 12.23.24
- **Database**: Prisma ORM with PostgreSQL
- **Payments**: Stripe Checkout (optional)
- **Persistence**: SessionStorage + Server-side sync

### File Structure

```
src/
├── lib/qwiz/
│   ├── config.ts          # Services, features, pricing configuration
│   ├── pricing.ts         # Price calculation logic
│   ├── store.ts           # Zustand client state store
│   ├── questions.ts       # Questionnaire config (8 questions)
│   └── actions.ts         # Server actions (init, update, get)
├── components/qwiz/
│   ├── ServiceSelector.tsx    # Step 1: Service selection
│   ├── FeatureGrid.tsx        # Step 2: Feature selection
│   ├── QuestionnaireForm.tsx  # Step 3: Structured questions
│   ├── ContactForm.tsx        # Step 4: Contact info + rush
│   ├── PriceCounter.tsx       # Sticky bottom price display
│   └── StepNav.tsx            # Back/Continue navigation
├── app/(public)/start/
│   ├── page.tsx           # Main 5-step container
│   └── success/
│       └── page.tsx       # Post-submission success page
└── app/api/
    ├── checkout/create-session/
    │   └── route.ts       # Stripe checkout session
    ├── leads/submit/
    │   └── route.ts       # Quote submission
    └── webhooks/stripe-questionnaire/
        └── route.ts       # Stripe webhook handler
```

## User Flow

### 5-Step Process

1. **Service Selection** (`/start?step=1`)
   - Choose: Website, App, AI Features, or Maintenance
   - Price counter updates with base price
   
2. **Feature Builder** (`/start?step=2`)
   - Visual grid of 14 add-on features
   - Grouped by category: Design, Functionality, Integrations
   - Multi-select with checkboxes
   - Price counter shows running total

3. **Questionnaire** (`/start?step=3`)
   - 8 structured questions from simplified flow:
     * Goals (multiselect)
     * Target audience (multiselect)
     * Inspiration URLs (text)
     * Timeline (select)
     * Budget (select)
     * Content ready? (boolean)
     * Design preferences (multiselect)
     * Additional notes (textarea)

4. **Contact Info** (`/start?step=4`)
   - Name, email (required)
   - Phone, company, website (optional)
   - Rush delivery checkbox (+15% fee)

5. **Review & Submit** (`/start?step=5`)
   - Summary of all selections
   - Total price breakdown
   - Deposit amount
   - Submit button (mode-dependent)

### State Persistence

**Client-Side (Zustand + SessionStorage)**:
- Survives page refresh
- Tab-specific (doesn't sync across tabs)
- Keys: step, service, features, totals, questionnaire, contact, status

**Server-Side (Prisma Database)**:
- Auto-syncs on state changes (debounced)
- Uses `qid` cookie for session tracking
- Resumes via URL parameter: `/start?q={qid}`
- Stores full data as JSON in `questionnaires.data` field

### Submission Modes

#### Quote Mode (Default)
```typescript
// .env
QWIZ_MODE=quote

// Behavior:
1. User clicks "Get Quote"
2. POST to /api/leads/submit
3. Creates Lead record with metadata
4. Sets questionnaire status to SUBMITTED
5. Redirects to /start/success
6. (TODO) Sends confirmation emails
```

#### Checkout Mode
```typescript
// .env
QWIZ_MODE=checkout

// Behavior:
1. User clicks "Proceed to Checkout"
2. POST to /api/checkout/create-session
3. Creates Stripe Checkout session
4. Sets questionnaire status to CHECKOUT_INITIATED
5. Redirects to Stripe payment page
6. On success → Webhook creates Project + User
7. Redirects to /start/success?session_id={...}
```

## API Routes

### POST /api/checkout/create-session

**Request**:
```json
{
  "qid": "clxxx..."
}
```

**Response**:
```json
{
  "url": "https://checkout.stripe.com/..."
}
```

**Logic**:
1. Get questionnaire by qid
2. Create/retrieve Stripe customer by email
3. Build line items (base, addons, rush, recurring)
4. Create Stripe Checkout session
5. Save session ID to questionnaire
6. Update status to CHECKOUT_INITIATED
7. Return checkout URL

### POST /api/leads/submit

**Request**:
```json
{
  "qid": "clxxx..."
}
```

**Response**:
```json
{
  "success": true,
  "leadId": "clyyy..."
}
```

**Logic**:
1. Get questionnaire by qid
2. Update status to SUBMITTED
3. Create Lead record with metadata
4. (TODO) Send admin notification email
5. (TODO) Send client confirmation email
6. Return success

### POST /api/webhooks/stripe-questionnaire

**Stripe Webhook Events**:
- `checkout.session.completed`: Payment successful
- `checkout.session.expired`: Session expired
- `checkout.session.async_payment_failed`: Payment failed

**checkout.session.completed Logic**:
1. Get qid from client_reference_id
2. Update questionnaire status to PAYMENT_COMPLETE
3. Create/find User by email
4. Create Organization if company provided
5. Add user as organization owner
6. Create Project linked to questionnaire
7. (TODO) Send confirmation emails

## Database Schema

### Questionnaire Model

```prisma
model Questionnaire {
  id           String   @id @default(cuid())
  userEmail    String
  data         Json     // All questionnaire data
  estimate     Int?     // Total in cents
  deposit      Int?     // Deposit in cents
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  project      Project?
}
```

### Data JSON Structure

```typescript
{
  // State
  step: 1-5,
  qid: "clxxx...",
  status: "DRAFT" | "SUBMITTED" | "CHECKOUT_INITIATED" | "PAYMENT_COMPLETE" | "PAYMENT_FAILED",
  
  // Selections
  service: "Website" | "App" | "AI Features" | "Maintenance",
  features: ["premium_design", "user_auth", ...],
  
  // Pricing
  totals: {
    base: 200000,
    addons: 150000,
    rush: 52500,
    monthly: 0,
    subtotal: 402500,
    total: 402500,
    deposit: 100625,
    recurring: 0
  },
  
  // Questionnaire answers
  questionnaire: {
    goals: ["build_brand", "generate_leads"],
    targetAudience: ["b2b", "tech_professionals"],
    inspirationUrls: "https://example.com, ...",
    timeline: "1-3_months",
    budget: "$5k-$10k",
    contentReady: true,
    designPreference: ["modern", "minimalist"],
    notes: "Additional requirements..."
  },
  
  // Contact
  contact: {
    name: "John Doe",
    email: "john@example.com",
    phone: "+1234567890",
    company: "Acme Inc",
    website: "https://acme.com",
    rushDelivery: false
  },
  
  // Timestamps
  submittedAt: "2024-01-01T00:00:00Z",
  paidAt: "2024-01-01T01:00:00Z",
  failedAt: "2024-01-01T02:00:00Z"
}
```

### Lead Model (for quote mode)

```prisma
model Lead {
  id             String     @id @default(cuid())
  name           String
  email          String
  phone          String?
  company        String?
  message        String?
  source         String?    @default("website")
  status         LeadStatus @default(NEW)
  
  serviceType    String?
  timeline       String?
  budget         String?
  requirements   Json?
  metadata       Json?      // Questionnaire data
  
  organizationId String?
  convertedAt    DateTime?
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

## Pricing System

### Configuration

All prices in `lib/qwiz/config.ts` pull from environment variables:

```typescript
const getEnvPrice = (key: string, fallback: number) => 
  parseInt(process.env[key] || '') || fallback;

export const SERVICES = {
  website: {
    id: 'website',
    name: 'Website',
    price: getEnvPrice('SEEZEE_PRICE_WEBSITE', 200000), // $2,000
    // ...
  },
  // ...
};

export const FEATURES = [
  {
    id: 'premium_design',
    name: 'Premium UI/UX Design',
    price: getEnvPrice('F_PREMIUM_DESIGN', 50000), // $500
    category: 'design',
  },
  // ...
];
```

### Calculation Logic

```typescript
// lib/qwiz/pricing.ts
export function calculateTotals(
  service: Service | null,
  features: string[],
  rushDelivery: boolean
): Totals {
  // 1. Base price
  const base = service?.price || 0;
  
  // 2. Add-ons
  const addons = features.reduce((sum, id) => {
    const feature = FEATURES.find(f => f.id === id);
    return sum + (feature?.price || 0);
  }, 0);
  
  // 3. Subtotal before rush
  const subtotal = base + addons;
  
  // 4. Rush fee (15%)
  const rush = rushDelivery ? Math.round(subtotal * 0.15) : 0;
  
  // 5. Total
  const total = subtotal + rush;
  
  // 6. Deposit (25% or $250 minimum)
  const deposit = Math.max(Math.round(total * 0.25), 25000);
  
  // 7. Recurring (monthly)
  const recurring = service?.monthly || 0;
  
  return { base, addons, rush, monthly: recurring, subtotal, total, deposit, recurring };
}
```

## Component Details

### ServiceSelector.tsx

**Purpose**: Step 1 - Service selection

**Features**:
- 2-column grid (1-column on mobile)
- Selected state: Cyan border + bg
- Framer Motion hover/tap animations
- Price display per service
- Monthly indicator for maintenance

**Props**:
```typescript
{
  selected: Service | null;
  onSelect: (service: Service) => void;
}
```

### FeatureGrid.tsx

**Purpose**: Step 2 - Feature selection

**Features**:
- 3-column grid grouped by category
- Checkbox-style multi-select
- Check icon when selected
- Price display per feature
- Categories: Design, Functionality, Integrations

**Props**:
```typescript
{
  selected: string[];
  onToggle: (featureId: string) => void;
}
```

### QuestionnaireForm.tsx

**Purpose**: Step 3 - Structured questions

**Features**:
- Dynamic rendering from QUESTIONS config
- Input types: multiselect chips, select dropdown, text, textarea, boolean
- Framer Motion stagger animations
- Validation states

**Props**:
```typescript
{
  values: Record<string, any>;
  onChange: (field: string, value: any) => void;
}
```

### ContactForm.tsx

**Purpose**: Step 4 - Contact information

**Features**:
- Name, email (required)
- Phone, company, website (optional)
- Rush delivery checkbox (+15% warning)
- Lucide icons for inputs
- Framer Motion stagger delays

**Props**:
```typescript
{
  values: ContactInfo;
  onChange: (values: Partial<ContactInfo>) => void;
}
```

### PriceCounter.tsx

**Purpose**: Sticky bottom price display

**Features**:
- Fixed position at bottom (z-50)
- Auto-recalculates on state changes
- Breakdown: Base + Add-ons + Rush Fee
- Total, deposit, monthly (if recurring)
- AnimatePresence slide-in animation

**Props**: None (reads from Zustand store)

### StepNav.tsx

**Purpose**: Navigation buttons

**Features**:
- Back button (only if step > 1)
- Continue/Submit button with loading spinner
- Disabled states based on validation
- Dynamic text per step

**Props**:
```typescript
{
  step: 1-5;
  canProceed: boolean;
  isSubmitting: boolean;
  onBack: () => void;
  onNext: () => void;
}
```

## Testing

### Local Development

1. **Start dev server**:
   ```bash
   npm run dev
   ```

2. **Navigate to `/start`**

3. **Test quote mode** (default):
   - Complete all 5 steps
   - Submit quote
   - Check database for Lead record
   - Verify redirect to success page

4. **Test state persistence**:
   - Fill out step 1-2
   - Refresh page
   - Verify state restored
   - Check `qid` cookie
   - Test resume via URL: `/start?q={qid}`

5. **Test checkout mode**:
   ```bash
   # .env.local
   QWIZ_MODE=checkout
   STRIPE_SECRET_KEY=sk_test_...
   ```
   - Complete questionnaire
   - Click "Proceed to Checkout"
   - Redirects to Stripe (test mode)
   - Use test card: 4242 4242 4242 4242
   - Complete payment
   - Webhook triggers (use Stripe CLI for local):
     ```bash
     stripe listen --forward-to localhost:3000/api/webhooks/stripe-questionnaire
     ```

### Stripe Webhook Testing

**Install Stripe CLI**:
```bash
brew install stripe/stripe-cli/stripe  # macOS
# or download from https://stripe.com/docs/stripe-cli
```

**Forward webhooks locally**:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe-questionnaire
```

**Trigger test events**:
```bash
stripe trigger checkout.session.completed
```

**Verify**:
- Check logs for webhook event
- Verify questionnaire status updated
- Verify Project + User created
- Check database records

## Future Enhancements

### TODO: Email Notifications

1. **Install email service**:
   ```bash
   npm install @sendgrid/mail
   # or
   npm install nodemailer
   ```

2. **Create email templates** (`lib/emails/`):
   - `quote-confirmation.tsx` (client)
   - `quote-admin-notification.tsx` (admin)
   - `payment-confirmation.tsx` (client)

3. **Add to API routes**:
   ```typescript
   // In /api/leads/submit
   await sendEmail({
     to: contact.email,
     template: 'quote-confirmation',
     data: { ...questionnaire }
   });
   
   await sendEmail({
     to: process.env.EMAIL_ADMIN,
     template: 'quote-admin-notification',
     data: { ...questionnaire }
   });
   ```

### TODO: Admin Dashboard Integration

1. **Create admin views** (`app/(admin)/questionnaires/`):
   - List page with filters (service, status, date)
   - Detail page showing full questionnaire
   - Actions: Convert to project, Mark as contacted

2. **Add to sidebar navigation**:
   ```typescript
   {
     name: 'Questionnaires',
     href: '/admin/questionnaires',
     icon: ClipboardList
   }
   ```

3. **Create API endpoints**:
   - `GET /api/admin/questionnaires` (list with pagination)
   - `GET /api/admin/questionnaires/[id]` (detail)
   - `PATCH /api/admin/questionnaires/[id]` (update status)

### TODO: Analytics & Reporting

1. **Track metrics**:
   - Conversion rate (submitted → paid)
   - Average quote value
   - Most popular services/features
   - Drop-off points (which step users abandon)

2. **Dashboard widgets**:
   - Total quotes this month
   - Total revenue from questionnaires
   - Pending quotes (needs follow-up)

3. **Export functionality**:
   - CSV export of all quotes
   - PDF quote generator
   - Email quote as PDF attachment

## Troubleshooting

### Common Issues

**1. State not persisting**:
- Check sessionStorage in DevTools
- Verify Zustand persist middleware configured
- Check cookie for `qid` value

**2. Prisma client not updated**:
```bash
npx prisma generate
npx prisma db push
```

**3. Stripe webhook not receiving events**:
- Verify webhook secret in `.env`
- Check Stripe CLI is running
- Verify endpoint URL in Stripe dashboard

**4. TypeScript errors**:
```bash
# Restart TypeScript server in VS Code
Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
```

**5. Price counter not updating**:
- Check Zustand store updates in React DevTools
- Verify `useEffect` in PriceCounter running
- Check `calculateTotals` function logic

## Deployment Checklist

- [ ] Set environment variables in Vercel/production
- [ ] Configure Stripe webhook endpoint in dashboard
- [ ] Test end-to-end flow in production
- [ ] Set up email service (SendGrid/Mailgun)
- [ ] Create email templates
- [ ] Configure CORS for API routes
- [ ] Set up monitoring (Sentry/LogRocket)
- [ ] Create admin views for questionnaires
- [ ] Document pricing configuration
- [ ] Train team on quote follow-up process
- [ ] Set up automated reminders for pending quotes

## Summary

The feature-builder questionnaire system provides a modern, streamlined onboarding experience that:

✅ Replaces 29-step multi-page flow with 5-step single-page UX  
✅ Persists state across refresh via sessionStorage + server sync  
✅ Supports both quote and checkout modes  
✅ Calculates pricing dynamically from environment variables  
✅ Integrates with Stripe for payment processing  
✅ Creates structured data for admin follow-up  
✅ Uses Framer Motion for polished animations  
✅ Provides clear pricing transparency to users  

**Next Steps**: Email notifications, admin dashboard integration, analytics tracking.
