# SeeZee - Full-Stack Web Agency Platform

SeeZee is a modern, full-stack web agency platform built with Next.js 15, featuring a sleek dark glass morphism design, secure authentication, and comprehensive lead management system.

## ✅ Project Complete

All development phases have been successfully completed:

1. **Project Scaffolding** - Next.js 15 App Router with TypeScript
2. **Authentication System** - NextAuth.js with Google OAuth
3. **Contact Form & Lead Generation** - Server actions with Prisma ORM
4. **Admin Dashboard** - Protected routes with lead management
5. **Production Deployment** - Successfully deployed to Vercel

## 🚀 Live Application

- **Production URL**: https://see-388f970j6-seanspons-projects.vercel.app
- **Admin Dashboard**: Available at `/admin` (requires Google authentication)
- **Contact Form**: Available at `/contact` for lead generation

## 🛠 Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom glass morphism design
- **Authentication**: NextAuth.js with Google OAuth provider
- **Database**: PostgreSQL with Prisma ORM
- **Deployment**: Vercel with automatic SSL certificates
- **UI Components**: Custom components with shadcn/ui patterns

## 📁 Project Structure

```
src/
├── app/
│   ├── (admin)/        # Protected admin routes
│   ├── (auth)/         # Authentication routes
│   ├── (public)/       # Public routes
│   └── api/            # API routes
├── components/
│   └── ui/             # Reusable UI components
├── lib/                # Shared utilities and configurations
├── server/             # Server-side utilities
└── styles/             # Global styles and CSS
```

## 🔐 Environment Variables

Required environment variables for production:

```env
# Database
DATABASE_URL="postgresql://..."

# NextAuth.js
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-secret-key"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

## 🎨 Design Features

- **Glass Morphism UI**: Modern frosted glass effects with backdrop blur
- **Dark Theme**: Elegant dark color scheme throughout
- **Responsive Design**: Mobile-first responsive layout
- **Interactive Elements**: Hover effects and smooth transitions
- **Professional Typography**: Optimized text hierarchy and spacing

## 📊 Features

### Public Features
- **Landing Page**: Hero section with company branding
- **Services Page**: Showcase of web development services
- **Contact Form**: Lead generation with form validation
- **About Page**: Company information and team details

### Admin Features
- **Dashboard**: Overview of leads and business metrics
- **Lead Management**: View, filter, and manage customer inquiries
- **Protected Access**: Secure authentication required for admin area
- **Real-time Data**: Live updates from the database

## 🚀 Development Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Database operations
npm run db:generate    # Generate Prisma client
npm run db:push        # Push schema to database
npm run db:migrate     # Run database migrations
npm run db:studio      # Open Prisma Studio

# Deployment
npx vercel --prod      # Deploy to production
```

## 📝 Implementation Notes

- Authentication uses JWT sessions for optimal performance
- Database schema includes NextAuth tables and custom Lead model
- Server actions handle form submissions and data mutations
- Route groups organize application structure by access level
- Custom UI components follow consistent design patterns