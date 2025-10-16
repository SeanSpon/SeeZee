# Staff Invitation Flow

## Overview
The staff invitation system allows the CEO to invite team members who will be automatically upgraded to STAFF accounts with assigned roles when they sign in with Google.

## Flow Steps

### 1. CEO Creates Invitation
1. Navigate to `/admin/team`
2. Click "Invite Staff" button (CEO-only)
3. Enter staff member's email and select their role:
   - ADMIN
   - DESIGNER
   - DEV (Developer)
   - OUTREACH
   - INTERN
   - STAFF
4. Click "Create Invitation"

### 2. Get Manual Sharing Link
- After creating the invitation, a unique link is generated
- Format: `http://localhost:3000/join?token=XXXXX`
- **Copy the link** using the "📋 Copy Link to Clipboard" button
- **Email this link** to the staff member manually

### 3. Staff Member Receives Link
- Staff member receives email with invitation link
- Link expires in 7 days
- Can only be used once

### 4. Staff Member Joins
1. Click the invitation link → redirects to `/join?token=XXXXX`
2. Page validates the token and shows:
   - ✅ Valid invitation
   - Email address they were invited with
   - Role they'll be assigned
3. Click "Sign in with Google"
4. **IMPORTANT**: Must sign in with the EXACT email that was invited

### 5. Auto-Upgrade Process
After Google sign-in, the system automatically:
1. Verifies the Google email matches the invited email
2. Upgrades the user account:
   - `accountType` → `STAFF`
   - `role` → Assigned role (ADMIN, DEV, etc.)
   - `tosAcceptedAt` → Current timestamp (skips onboarding)
   - `profileDoneAt` → Current timestamp (skips profile setup)
3. Marks the invitation as redeemed
4. Forces re-authentication to refresh the JWT token
5. Redirects to `/login` with success message

### 6. Staff Member Access
- After re-signing in, staff member has full access to:
  - `/admin` dashboard (STAFF-only areas)
  - Their assigned role permissions
  - No onboarding screens (automatically skipped)

## Technical Details

### Database Models
**Invitation**:
- `email`: Staff member's email
- `role`: Assigned role
- `token`: Unique 48-character hex token
- `createdById`: CEO's user ID
- `expiresAt`: 7 days from creation
- `redeemedAt`: Timestamp when used (null if unused)

### API Endpoints
- **POST** `/api/invitations` - Create invitation (CEO-only)
- **GET** `/api/invitations/validate?token=XXX` - Validate token
- **GET** `/api/invitations/redeem?token=XXX` - Redeem after Google sign-in

### Security
✅ Only CEO can create invitations
✅ Tokens are cryptographically secure (24 random bytes)
✅ Invitations expire after 7 days
✅ Can only be used once
✅ Email must match exactly
✅ Wrong email shows error

## Example Invitation Link
```
http://localhost:3000/join?token=a1b2c3d4e5f6789012345678901234567890abcdef1234
```

## Testing
1. As CEO, go to `/admin/team`
2. Click "Invite Staff"
3. Enter: `test@example.com`, Role: `DEV`
4. Copy the generated link
5. Open in incognito/private window
6. Sign in with `test@example.com` Google account
7. Check that user is now STAFF with DEV role

## Error Handling
- ❌ Invalid token → "Invalid Invitation" page
- ❌ Expired token → "Invitation Expired" page  
- ❌ Wrong email → Redirects back to `/join` with error
- ❌ Already redeemed → "Invalid Invitation"

## Future Enhancements
- [ ] Add email sending (Resend, SendGrid, etc.)
- [ ] Add invitation management (revoke, resend)
- [ ] Add bulk invitations
- [ ] Add custom expiration times
- [ ] Add invitation templates
