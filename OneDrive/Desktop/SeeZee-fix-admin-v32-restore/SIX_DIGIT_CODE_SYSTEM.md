# 6-Digit Staff Invitation Code System

## Overview
Replaced link-based invitations with **6-digit one-time codes** sent via email. Workers enter the code during onboarding to upgrade from CLIENT to STAFF with assigned role.

## System Flow

### 1. CEO Creates Invitation
**Location**: `/admin/team`

1. Click "Invite Staff"
2. Enter email and select role (ADMIN, DEV, DESIGNER, OUTREACH, INTERN, STAFF)
3. System generates random 6-digit code (000000-999999)
4. Code is hashed with bcrypt (10 rounds) and stored in database
5. **Email automatically sent** with:
   - Beautiful HTML template
   - 6-digit code displayed prominently
   - Sign-in button linking to `/login`
   - Expiration date (7 days default)
   - Instructions

### 2. Worker Receives Email
- Email contains the 6-digit code
- Click "Sign in with Google" button
- Or manually visit the site

### 3. Account Type Selection
**Location**: `/onboarding/account-type`

**Two options**:
1. **Client**: Direct selection → becomes CLIENT/CLIENT
2. **Worker**: Click → shows 6-digit code input form

### 4. Code Verification
**Worker flow**:
1. Click "Worker" card
2. See 6-digit OTP input (6 separate boxes)
3. Enter code from email (auto-advance on type, paste handling)
4. Click "Verify Code"

**Backend validation** (`/api/onboarding/verify-code`):
- Finds active invite for user's email
- Checks expiration
- Checks attempt limit (max 5)
- Verifies code with bcrypt.compare()
- If valid:
  - Upgrade user: `accountType = STAFF`, `role = invited role`
  - Set `invitedById`
  - Mark code as redeemed
  - Log event in SystemLog
  - Force re-auth to refresh JWT
- If invalid:
  - Increment attempts
  - Show remaining attempts
  - Log failed attempt

### 5. Post-Verification
- User redirected to `/api/auth/signout?callbackUrl=/login?invited=success`
- Fresh JWT with STAFF accountType and assigned role
- Access to `/admin` dashboard
- Onboarding (TOS + Profile) still required but with STAFF privileges

## Database Schema

### StaffInviteCode Model
```prisma
model StaffInviteCode {
  id           String    @id @default(cuid())
  email        String
  role         UserRole
  codeHash     String    // Bcrypt hash of 6-digit code
  
  createdById  String
  createdBy    User      @relation("InviteCodeCreator")
  
  expiresAt    DateTime
  redeemedAt   DateTime?
  attempts     Int       @default(0)
  maxAttempts  Int       @default(5)
  
  createdAt    DateTime  @default(now())

  @@index([email])
}
```

## API Endpoints

### POST `/api/invitations/code`
**Auth**: CEO only  
**Body**: `{ email, role, expiresDays? }`  
**Process**:
- Generate 6-digit code
- Hash with bcrypt
- Store in database
- Send email via nodemailer
- Return success (code NOT included in response)

### POST `/api/onboarding/verify-code`
**Auth**: Authenticated user  
**Body**: `{ code: "123456" }`  
**Returns**:
- Success: `{ success: true, role }`
- Invalid: `{ error, message, remainingAttempts }`
- Locked: `{ error: "locked" }` (after 5 attempts)

### POST `/api/onboarding/account-type`
**Auth**: Authenticated user  
**Body**: `{ accountType: "CLIENT" }`  
**Note**: Only CLIENT allowed here. STAFF upgrade via verify-code endpoint.

## Security Features

✅ **Bcrypt Hashing**: Codes hashed with 10 rounds, never stored in plain text  
✅ **Rate Limiting**: Max 5 attempts per code  
✅ **Expiration**: 7-day default expiration  
✅ **One-Time Use**: Code marked as redeemed after successful verification  
✅ **Email Matching**: Code must be used by the invited email address  
✅ **Audit Trail**: All events logged in SystemLog (create, redeem, fail, lock)  
✅ **Node Runtime**: All Prisma/Nodemailer code runs in Node.js runtime (Edge-safe)

## Email Configuration

### Environment Variables Required
```env
EMAIL_FROM=your-email@gmail.com
EMAIL_PASS=your-app-password
NEXTAUTH_URL=http://localhost:3000
```

### Gmail App Password Setup
1. Enable 2FA on Google account
2. Visit https://myaccount.google.com/apppasswords
3. Generate app password for "Mail"
4. Use that password in `EMAIL_PASS`

## UI Components

### InviteStaffButton
- Simplified to show success message after sending
- No link display (email sent automatically)
- Auto-closes modal after 3 seconds on success

### Account Type Page
- Two states: selection and code entry
- **Selection**: Client vs Worker cards
- **Code Entry**: 6-digit OTP input with:
  - Auto-advance on keystroke
  - Paste handling
  - Backspace navigation
  - Error messages with remaining attempts
  - Back button to return to selection

## Migration

### Applied Migration
`20251011031638_add_staff_invite_codes`

Changes:
- Dropped `invitations` table
- Created `staff_invite_codes` table
- Updated User relations

## Testing

1. **CEO creates invitation**:
   ```
   POST /api/invitations/code
   { "email": "worker@example.com", "role": "DEV" }
   ```

2. **Worker receives email** with 6-digit code

3. **Worker signs in** with Google (any email)

4. **Account type page** → Choose "Worker"

5. **Enter code** from email

6. **Verification**:
   - Valid code → redirect to re-auth → STAFF with DEV role
   - Invalid code → error + remaining attempts

## Error Handling

| Error | Status | Message |
|-------|--------|---------|
| No active invite | 404 | "No active invitation found" |
| Code locked (5+ attempts) | 423 | "Too many failed attempts. Please request a new code." |
| Invalid code | 400 | "Invalid code. X attempts remaining." |
| Expired code | 404 | "No active invitation found" (expired codes filtered out) |

## System Logs

All events tracked in `SystemLog`:
- `invite_create`: Code generation
- `invite_redeem`: Successful verification
- `invite_fail`: Failed attempt
- `invite_locked`: Code locked after max attempts

## Future Enhancements

- [ ] `/api/invitations/resend` - Regenerate and resend code
- [ ] Admin table showing active/expired/redeemed codes
- [ ] Revoke code functionality
- [ ] Custom expiration times in UI
- [ ] SMS delivery option (Twilio)
- [ ] Bulk invitations

## Files Modified/Created

**New Files**:
- `src/lib/mailer.ts` - Nodemailer email sending
- `src/app/api/invitations/code/route.ts` - Code generation API
- `src/app/api/onboarding/verify-code/route.ts` - Code verification API

**Modified Files**:
- `prisma/schema.prisma` - New StaffInviteCode model
- `src/app\(admin)\admin\team\components\InviteStaffButton.tsx` - Simplified for email sending
- `src/app\onboarding\account-type\page.tsx` - Added 6-digit code input
- `src/app\api\onboarding\account-type\route.ts` - Removed STAFF logic (now in verify-code)

**Dependencies Added**:
- `nodemailer` - Email sending
- `bcryptjs` - Password hashing
- `@types/nodemailer` - TypeScript types
- `@types/bcryptjs` - TypeScript types
