# SeeZee Auth Upgrade - Implementation Progress

## ✅ COMPLETED

### 1. Prisma Schema Updates
**File:** `prisma/schema.prisma`

- ✅ Updated `UserRole` enum: CEO, ADMIN, DESIGNER, DEV, OUTREACH, INTERN, STAFF, CLIENT
- ✅ Added `AccountType` enum: CLIENT, STAFF
- ✅ Updated `User` model with:
  - `accountType` (CLIENT/STAFF)
  - `tosAcceptedAt`, `tosVersion` (compliance tracking)
  - `profileDoneAt` (onboarding completion)
  - `phone`, `company` (profile fields)
  - `twofaEnabled`, `twofaSecret` (2FA support)
  - `invitedById`, `invitedBy` (invitation tracking)
  - `createdInvitations` relation
- ✅ Created `Invitation` model:
  - `email`, `role`, `token`
  - `createdById`, `createdBy`
  - `expiresAt`, `redeemedAt`
  - Indexed on email and token

### 2. NextAuth Configuration
**File:** `src/auth.ts`

- ✅ Added Email provider (magic link support)
- ✅ Added signIn callback with invitation validation
- ✅ Added session callback to include role, accountType, onboarding status
- ✅ Configured custom pages (login, verify)
- ✅ Re-enabled Prisma Adapter

**Note:** TypeScript errors are expected until migration runs

---

## 📋 NEXT STEPS (Ready to Implement)

### 3. Run Database Migration
```bash
npx prisma migrate dev --name auth_upgrade
npx prisma generate
```

### 4. Environment Variables
Add to `.env.local`:
```env
# Email Provider (for magic links)
EMAIL_SERVER_HOST=smtp.resend.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=resend
EMAIL_SERVER_PASSWORD=re_your_api_key
EMAIL_FROM=noreply@seezee.dev

# Existing (keep as-is)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
AUTH_SECRET=...
```

### 5. Update Middleware
**File:** `src/middleware.ts`

- Protect `/admin/*` routes (STAFF accountType required)
- Redirect to `/onboarding/tos` if `tosAcceptedAt` is null
- Redirect to `/onboarding/profile` if `profileDoneAt` is null
- CEO-only route protection for `/admin/analytics`, `/admin/finances`, `/admin/systems`

### 6. Build Public Auth Pages

#### `/login` page
- "Continue with Google" button
- "Continue with Email" form
- Link to "Create account" (`/register`)

#### `/register` page
- Choice: "I'm a Client" → `/register/client`
- Choice: "I'm Staff" → requires invite link

#### `/register/client` page
- Email magic link or Google OAuth
- Sets `accountType: CLIENT`
- After auth → `/onboarding/tos`

#### `/register/staff?token=xxx` page
- Validates invitation token
- Shows minimal profile form
- After auth → redeem invitation, set role/accountType
- Redirect to `/onboarding/tos`

#### `/verify` page
- Magic link sent confirmation
- Check your email message

### 7. Build Onboarding Flow

#### `/onboarding/tos` page
- Display Terms of Service
- Checkbox: "I accept the Terms & Privacy Policy"
- Button: "Continue"
- Server action sets `tosAcceptedAt`, `tosVersion`

#### `/onboarding/profile` page
- Form fields: Name, Phone, Company (optional for staff)
- Button: "Complete Profile"
- Server action sets `profileDoneAt`
- If `accountType: CLIENT` → create Lead with `source: 'signup'`
- Redirect based on accountType:
  - CLIENT → `/portal` (future)
  - STAFF → `/admin/dashboard`

### 8. Build Invitation System (CEO-only)

#### API Routes
**POST `/api/invitations`** (CEO-only)
- Body: `{ email, role }`
- Generates random token
- Creates Invitation record
- Sends email with link: `/register/staff?token=xxx`
- Returns: `{ ok: true, token }`

**GET `/api/invitations/:token`**
- Validates token exists and not expired
- Returns: `{ valid: true, email, role }`

#### Admin UI
**`/admin/team` page enhancement**
- Add "Invite Staff Member" button (CEO-only)
- Modal form: email + role dropdown
- Shows pending invitations list
- Shows redeemed invitations

### 9. Email Templates

#### Magic Link Template
```html
<h2>Sign in to SeeZee</h2>
<p>Click the link below to sign in:</p>
<a href="{url}">Sign In</a>
<p>This link expires in 24 hours.</p>
```

#### Invitation Template
```html
<h2>You've been invited to SeeZee</h2>
<p>You've been invited to join as {role}.</p>
<a href="{url}">Accept Invitation</a>
<p>This invitation expires in 7 days.</p>
```

### 10. Type Definitions

**File:** `src/types/next-auth.d.ts`
```typescript
import { UserRole, AccountType } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string;
      image?: string;
      role: UserRole;
      accountType: AccountType;
      tosAcceptedAt?: Date;
      profileDoneAt?: Date;
    };
  }
}
```

---

## 🔐 Security Features (Phase 2)

### 11. 2FA Implementation
- Install `speakeasy` package
- Generate TOTP secret on enrollment
- Display QR code for authenticator apps
- Store encrypted `twofaSecret`
- Add verification step in signIn callback
- Build `/settings/security` page

### 12. Rate Limiting & CAPTCHA
- Install `@upstash/ratelimit`
- Add rate limiting to `/api/invitations`
- Add Cloudflare Turnstile to `/register/client`
- Add Turnstile to `/login` form

### 13. Session Management
- Build `/settings/sessions` page
- Show active sessions with device info
- Add "Revoke" button per session
- Log session revocations in SystemLog

---

## 📊 Current Status

**Schema:** ✅ Ready for migration  
**Auth Config:** ✅ Updated with Email provider  
**Routes:** ⏳ Not started  
**UI:** ⏳ Not started  
**Email:** ⏳ Not configured  
**Migration:** ⚠️ Pending

## 🚀 Quick Start Command

```bash
# 1. Run migration
npx prisma migrate dev --name auth_upgrade

# 2. Generate client
npx prisma generate

# 3. Add environment variables (see section 4)

# 4. Start building auth pages (section 6)
```

---

**Last Updated:** October 10, 2025  
**Implementation:** Phase 1 Complete (Schema + Auth Config)  
**Next Phase:** UI Development (Auth Pages + Onboarding)
