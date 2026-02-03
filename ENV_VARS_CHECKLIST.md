# Environment Variables Checklist for Production

## ⚠️ CRITICAL - Required for Site to Function

These MUST be set in Vercel production environment:

### Database & Auth
- [ ] `DATABASE_URL` - PostgreSQL connection string
  - **Format**: `postgresql://username:password@host:5432/database`
  - **Where**: Vercel → Project Settings → Environment Variables
  - **Test**: Site loads without 500 errors

- [ ] `NEXTAUTH_URL` - Production domain
  - **Value**: `https://seezeestudios.com` (or your production domain)
  - **Important**: NO trailing slash
  
- [ ] `NEXTAUTH_SECRET` - Random secret string
  - **Generate**: `openssl rand -base64 32`
  - **Important**: Keep this secret, never commit to Git

- [ ] `AUTH_SECRET` - Same as NEXTAUTH_SECRET
  - **Value**: Copy the same value from NEXTAUTH_SECRET
  - **Why**: Next-Auth v5 uses AUTH_SECRET instead

### Google OAuth (Required for Login)
- [ ] `GOOGLE_CLIENT_ID`
  - **Where**: Google Cloud Console → APIs & Services → Credentials
  - **Test**: Google login button works

- [ ] `GOOGLE_CLIENT_SECRET`
  - **Where**: Google Cloud Console → APIs & Services → Credentials
  - **Keep**: This secret secure

## 🔧 IMPORTANT - Required for Features

### Stripe (Payment Processing)
- [ ] `STRIPE_SECRET_KEY`
  - **Format**: `sk_live_...` for production, `sk_test_...` for development
  - **Where**: Stripe Dashboard → Developers → API Keys

- [ ] `STRIPE_WEBHOOK_SECRET`
  - **Format**: `whsec_...`
  - **Where**: Stripe Dashboard → Developers → Webhooks → Add endpoint
  - **Endpoint**: `https://seezeestudios.com/api/stripe/webhook`

### Email (Resend)
- [ ] `RESEND_API_KEY`
  - **Format**: `re_...`
  - **Where**: Resend Dashboard → API Keys

- [ ] `RESEND_FROM_EMAIL`
  - **Value**: `sean@seezeestudios.com` or verified domain email
  - **Important**: Domain must be verified in Resend

### File Uploads (Recordings)
- [ ] `UPLOADTHING_TOKEN`
  - **Where**: UploadThing Dashboard → API Keys
  - **Required For**: Recordings upload feature
  - **Test**: Upload recording works

## 🤖 AI Features (Required for Chatbot)

Choose ONE of these:

- [ ] `ANTHROPIC_API_KEY`
  - **Format**: `sk-ant-...`
  - **Where**: Anthropic Console → API Keys
  - **OR**

- [ ] `OPENAI_API_KEY`
  - **Format**: `sk-proj-...`
  - **Where**: OpenAI Dashboard → API Keys

- [ ] `GOOGLE_MAPS_API_KEY` (Optional - for lead geocoding)
  - **Where**: Google Cloud Console → APIs & Services → Credentials

## 🔌 Integrations (Optional but Recommended)

### Vercel Deployments Panel
- [ ] `VERCEL_TOKEN`
  - **Where**: Vercel → Account Settings → Tokens
  - **Create**: Personal Access Token with "Read" scope
  - **Test**: Deployments panel shows data

- [ ] `VERCEL_PROJECT_ID`
  - **Where**: Vercel → Project → Settings → General → Project ID
  - **Format**: `prj_...`

### Marketing & Outreach (Optional)
- [ ] `GOOGLE_PLACES_API_KEY` (for lead finder)
- [ ] `APOLLO_API_KEY` (for email enrichment)
- [ ] `HUNTER_API_KEY` (for email finding)

### GitHub Integration (Optional)
- [ ] `GITHUB_TOKEN` (for commit feed)
  - **Format**: `ghp_...`
  - **Where**: GitHub → Settings → Developer settings → Personal access tokens

- [ ] `GITHUB_REPO_SLUG` (for commit feed)
  - **Format**: `owner/repository-name`
  - **Example**: `seezeestudios/seezee`

## 📋 How to Set Environment Variables in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (`seezee`)
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Enter the variable name and value
6. Select environments: **Production**, **Preview**, **Development**
7. Click **Save**
8. **Redeploy** the site to apply changes

## 🧪 Testing After Setting Variables

After setting environment variables, you MUST redeploy for changes to take effect:

```bash
# Option 1: Via Vercel Dashboard
# Go to Deployments → Click "..." → Redeploy

# Option 2: Via CLI
vercel --prod

# Option 3: Push to Git (triggers auto-deploy)
git commit --allow-empty -m "Redeploy after env vars update"
git push
```

### Test Checklist After Deploy:

1. **Auth Test**
   - [ ] Visit `/login` - page loads
   - [ ] Click "Sign in with Google" - redirects to Google
   - [ ] After login - redirects to dashboard (not error)

2. **Database Test**
   - [ ] Visit `/admin/hours` - page loads without "something went wrong"
   - [ ] Visit `/admin/maintenance` - data displays
   - [ ] Visit `/admin/clients` - clients list loads

3. **Features Test**
   - [ ] AI Chatbot appears in bottom-right corner
   - [ ] Type a message - gets response (not error)
   - [ ] Upload recording - processes successfully
   - [ ] Create todo - saves successfully

4. **Integrations Test**
   - [ ] Visit project page - Vercel deployments panel shows data
   - [ ] Stripe payments work (if applicable)

## 🚨 Common Issues & Fixes

### Issue: "something went wrong" on /admin/hours
**Cause**: Missing `DATABASE_URL` or database unreachable
**Fix**: 
1. Check Vercel env vars has `DATABASE_URL`
2. Test database connection from local
3. Check database host allows Vercel IPs

### Issue: Login redirects to /login in loop
**Cause**: Missing `NEXTAUTH_SECRET` or `AUTH_SECRET`
**Fix**:
1. Generate new secret: `openssl rand -base64 32`
2. Set both `NEXTAUTH_SECRET` and `AUTH_SECRET` to same value
3. Redeploy

### Issue: AI Chatbot doesn't respond
**Cause**: Missing `ANTHROPIC_API_KEY` or `OPENAI_API_KEY`
**Fix**:
1. Get API key from Anthropic or OpenAI
2. Set in Vercel env vars
3. Redeploy
4. Check `/api/chat/ai` endpoint exists

### Issue: Recordings upload fails
**Cause**: Missing `UPLOADTHING_TOKEN`
**Fix**:
1. Sign up at uploadthing.com
2. Get API token
3. Set `UPLOADTHING_TOKEN` in Vercel
4. Redeploy

### Issue: Vercel deployments panel shows "not configured"
**Cause**: Missing `VERCEL_TOKEN` or `VERCEL_PROJECT_ID`
**Fix**:
1. Create Vercel personal access token
2. Get project ID from Vercel dashboard
3. Set both variables
4. Redeploy

## 📝 Production Readiness Checklist

Before marking site as "production ready":

- [ ] All CRITICAL env vars are set
- [ ] All IMPORTANT env vars are set (for features you use)
- [ ] Tested login/logout flow
- [ ] Tested database connections
- [ ] Tested AI chatbot
- [ ] Tested file uploads
- [ ] No console errors on main pages
- [ ] No 500 errors in Vercel logs
- [ ] Mobile responsive (admin dashboard)

## 🔐 Security Best Practices

1. **Never commit secrets to Git**
   - Use `.env.local` for local development
   - `.env.example` should have placeholders only

2. **Rotate secrets regularly**
   - Database passwords
   - API keys
   - Auth secrets

3. **Use environment-specific values**
   - Development: `sk_test_...`
   - Production: `sk_live_...`

4. **Limit API key permissions**
   - Only grant necessary scopes
   - Use read-only when possible

5. **Monitor API usage**
   - Set up billing alerts
   - Check for unusual activity
