# CEO Vault Seed Script - Documentation

## Overview
All API keys and secrets from the `.env` file have been securely stored in the CEO Vault using AES-256 encryption.

## What Was Seeded

### Script Location
- **File**: [scripts/seed-vault.ts](../scripts/seed-vault.ts)
- **Command**: `npm run seed:vault`

### Total Keys Added: 22

#### Authentication (2 keys)
- `NEXTAUTH_SECRET` - NextAuth JWT signing secret
- `AUTH_SECRET` - NextAuth v5 authentication secret

#### Google OAuth (2 keys)
- `GOOGLE_CLIENT_ID` - Google OAuth 2.0 Client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth 2.0 Client Secret

#### Database (2 keys)
- `DATABASE_URL` - Neon PostgreSQL connection string (pooled)
- `DIRECT_URL` - Direct PostgreSQL connection (non-pooled)

#### Stripe Payment Processing (3 keys)
- `STRIPE_SECRET_KEY` - Server-side secret key (test mode)
- `STRIPE_PUBLISHABLE_KEY` - Client-side publishable key (test mode)
- `STRIPE_WEBHOOK_SECRET` - Webhook signature verification

#### File Upload Service (2 keys)
- `UPLOADTHING_TOKEN` - UploadThing API token
- `UPLOADTHING_APP_ID` - UploadThing application ID

#### Email Service (1 key)
- `RESEND_API_KEY` - Resend transactional email API key

#### AI Services (2 keys)
- `OPENAI_API_KEY` - OpenAI GPT models access
- `ANTHROPIC_API_KEY` - Anthropic Claude API access

#### GitHub Integration (1 key)
- `GITHUB_TOKEN` - GitHub Personal Access Token (PAT)

#### Google Services (3 keys)
- `GOOGLE_MAPS_API_KEY` - Google Maps geocoding and mapping
- `RECAPTCHA_SECRET_KEY` - Google reCAPTCHA v3 secret
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` - reCAPTCHA site key

#### Vercel Integration (3 keys)
- `VERCEL_TOKEN` - Vercel API access token
- `VERCEL_TEAM_ID` - Zach RoBards team account ID
- `VERCEL_WEBHOOK_SECRET` - Vercel webhook signature verification

#### Security & Automation (1 key)
- `CRON_SECRET` - Secure cron job endpoint token

## How It Works

### Encryption
All values are encrypted using **AES-256-CBC** encryption with:
- **Key Derivation**: scrypt with salt
- **Encryption Key**: Uses `VAULT_ENCRYPTION_KEY` or falls back to `AUTH_SECRET`
- **Storage**: Only encrypted value and last 4 characters stored

### Security Features
1. **Never returns full values** - API only shows last 4 characters
2. **Unique constraint** - Prevents duplicate keys per scope
3. **Audit trail** - Tracks creator and timestamps
4. **Scope-based access** - GLOBAL, PROJECT, or REPO scoping

### Database Model
```prisma
model VaultEntry {
  id             String     @id @default(cuid())
  key            String
  encryptedValue String     @db.Text
  lastFour       String
  scope          VaultScope @default(GLOBAL)
  scopeRef       String?
  notes          String?
  createdById    String
  createdBy      User       @relation("VaultCreator")
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt

  @@unique([key, scope, scopeRef])
}
```

## Accessing the Vault

### Web UI
Navigate to: **Admin → CEO → Vault**
- URL: `/admin/ceo/vault`
- Component: [src/components/admin/VaultClient.tsx](../src/components/admin/VaultClient.tsx)

### API Endpoints
- `GET /api/ceo/vault` - List all entries (masked values)
- `POST /api/ceo/vault` - Create new entry
- `PATCH /api/ceo/vault/[id]` - Update entry metadata
- `DELETE /api/ceo/vault/[id]` - Delete entry

### Re-running the Script
The script is **safe to re-run**:
- Updates existing entries with new values
- Creates missing entries
- Skips entries with no environment value

```bash
npm run seed:vault
```

## Production Deployment

### Environment Variables Required
Ensure production environment has:
- `VAULT_ENCRYPTION_KEY` (recommended) or `AUTH_SECRET` (fallback)
- All other API keys from `.env` file

### Migration Steps
1. Set all environment variables in Vercel/production
2. Run `npm run seed:vault` in production environment
3. Verify entries in CEO vault UI

## Maintenance

### Adding New Keys
1. Add key to `.env` file
2. Add entry to `vaultEntries` array in [scripts/seed-vault.ts](../scripts/seed-vault.ts)
3. Run `npm run seed:vault`

### Rotating Keys
1. Update value in `.env` file
2. Run `npm run seed:vault` (will update existing entry)
3. Or manually update via vault UI

### Removing Keys
- Use the vault UI delete button
- Or use API: `DELETE /api/ceo/vault/[id]`

## Security Best Practices

✅ **DO:**
- Keep `VAULT_ENCRYPTION_KEY`/`AUTH_SECRET` secure
- Regularly rotate API keys
- Use the vault for all sensitive credentials
- Audit vault access logs

❌ **DON'T:**
- Commit `.env` file to git
- Share encryption keys via insecure channels
- Hard-code API keys in source code
- Share vault access with non-CEO roles

## Notes
- Only CEO role can access the vault by default
- Values are encrypted at rest and in transit
- Last 4 characters help identify keys without exposing them
- All operations are logged with user attribution
