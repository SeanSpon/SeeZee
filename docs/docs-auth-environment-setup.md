# Production Environment Variables Setup

## Issue: NextAuth Missing Secret in Production

The application is failing because NextAuth.js requires a `NEXTAUTH_SECRET` environment variable in production.

## Required Environment Variables for Vercel:

### 1. NEXTAUTH_SECRET
```
Value: 515546cd7937f580c385eaf823912cd180b2de751d2fe419612064d22c97565d
```

### 2. NEXTAUTH_URL  
```
Value: https://see-fhi6ouvvd-seanspons-projects.vercel.app
```

### 3. GOOGLE_CLIENT_ID
```
Value: [YOUR_GOOGLE_CLIENT_ID_FROM_GOOGLE_CLOUD_CONSOLE]
```

### 4. GOOGLE_CLIENT_SECRET
```
Value: [YOUR_GOOGLE_CLIENT_SECRET_FROM_GOOGLE_CLOUD_CONSOLE]
```

### 5. DATABASE_URL
```
Value: postgresql://neondb_owner:npg_T5W7XjuVgboq@ep-late-mountain-ad7vzwd2.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
```

## Setup Instructions:

1. Go to https://vercel.com/dashboard
2. Select your SeeZee project
3. Go to Settings → Environment Variables
4. Add each variable above for the "Production" environment
5. Redeploy the project

## Alternative: Use Vercel CLI

```bash
# Production Environment
npx vercel env add NEXTAUTH_SECRET production
npx vercel env add NEXTAUTH_URL production  
npx vercel env add GOOGLE_CLIENT_ID production
npx vercel env add GOOGLE_CLIENT_SECRET production
npx vercel env add DATABASE_URL production

# Then redeploy
npx vercel --prod
```

## What was Fixed in Code:

- ✅ Added `secret: process.env.NEXTAUTH_SECRET` to NextAuth configuration
- ✅ Added `pages` configuration for custom sign-in/out pages  
- ✅ Updated production URL in local .env
- ✅ Generated secure random secret for authentication

## Once Environment Variables are Set:

The admin dashboard will work properly with authentication, and all NextAuth.js errors will be resolved.