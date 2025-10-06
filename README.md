# SeeZee - Next.js Full-Stack Application

## Environment Variables

Copy `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
```

## Required Environment Variables

### Next.js & NextAuth
- `NEXTAUTH_URL` - Your application URL (e.g., http://localhost:3000)
- `NEXTAUTH_SECRET` - Random string for JWT encryption

### Google OAuth (NextAuth)
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret

### Database
- `DATABASE_URL` - PostgreSQL connection string

### Stripe
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook endpoint secret

### Email (Resend)
- `RESEND_API_KEY` - Resend API key for sending emails

### File Upload (UploadThing)
- `UPLOADTHING_TOKEN` - UploadThing token for file uploads

## Setup Instructions

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set up your environment variables:**
   - Copy `.env.example` to `.env`
   - Fill in all required environment variables

3. **Set up the database:**
   ```bash
   npx prisma migrate dev
   ```

4. **Generate Prisma client:**
   ```bash
   npx prisma generate
   ```

5. **Start the development server:**
   ```bash
   pnpm dev
   ```

The application will be available at `http://localhost:3000`.

## Project Structure

```
src/
├── app/                   # Next.js App Router
│   ├── (public)/         # Public routes
│   ├── (auth)/           # Authentication routes
│   └── (admin)/          # Protected admin routes
├── components/           # Reusable components
│   ├── ui/              # UI components
│   ├── forms/           # Form components
│   └── layout/          # Layout components
├── lib/                 # Utility functions
├── server/              # Server-side code
│   ├── db/             # Database utilities
│   ├── auth/           # Authentication logic
│   └── webhooks/       # Webhook handlers
└── styles/             # Global styles
```

## Features

- ✅ Next.js 15 with App Router
- ✅ TypeScript
- ✅ Tailwind CSS
- ✅ Prisma ORM with PostgreSQL
- ✅ NextAuth.js authentication
- ✅ Stripe payment integration
- ✅ File upload with UploadThing
- ✅ Email with Resend
- ✅ ESLint configuration

## Database Models

- **User** - User accounts with authentication
- **Lead** - Customer inquiries and leads
- **Service** - Available services with pricing
- **Project** - Client projects linked to leads

## Deployment

This project is ready for deployment on Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set up environment variables in Vercel dashboard
4. Deploy!