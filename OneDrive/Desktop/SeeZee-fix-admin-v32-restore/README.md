# SeeZee - Digital Excellence Delivered

A modern full-stack Next.js application with authentication, contact forms, and admin dashboard.

## 🚀 Features

- **Modern Design**: Dark theme with glass morphism effects and responsive design
- **Authentication**: Google OAuth with NextAuth.js
- **Protected Admin Area**: Server-side route protection
- **Contact Form**: Lead generation with database storage
- **Admin Dashboard**: Lead management and analytics
- **Database**: PostgreSQL with Prisma ORM
- **Deployment Ready**: Optimized for Vercel

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js
- **Database**: PostgreSQL + Prisma
- **Deployment**: Vercel

## 📦 Installation & Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/SeanSpon/SeeZee.git
   cd SeeZee
   ```
   
   Fill in your environment variables:
   ```env
   # Next.js Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-nextauth-secret-here
   
   # Google OAuth Configuration
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   
   # Database Configuration
   DATABASE_URL=postgresql://username:password@localhost:5432/seezee
   ```

4. **Set up the database**
   ```bash
   pnpm prisma migrate dev
   pnpm prisma generate
   ```

5. **Start development server**
   ```bash
   pnpm dev
   ```

## 🌐 Deployment to Vercel

### 1. Prepare Repository
Ensure all changes are committed and pushed to GitHub.

### 2. Import to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure project settings:
   - Framework Preset: Next.js
   - Build Command: `pnpm run build`
   - Output Directory: `.next`

### 3. Environment Variables
Add these environment variables in Vercel → Settings → Environment Variables:

**Required for Production:**
```env
NEXTAUTH_URL=https://your-vercel-url.vercel.app
NEXTAUTH_SECRET=your-production-nextauth-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
DATABASE_URL=your-production-database-url
```

### 4. Database Setup
1. Set up a production PostgreSQL database (recommend: Neon, Supabase, or PlanetScale)
2. Update `DATABASE_URL` in Vercel environment variables
3. Run migrations in production

### 5. Google OAuth Setup
Add production redirect URI to your Google OAuth app:
```
https://your-vercel-url.vercel.app/api/auth/callback/google
```

## 🎯 Testing the Deployment

1. **Visit your deployed site**: `https://your-vercel-url.vercel.app`
2. **Test contact form**: Submit a message at `/contact`
3. **Test admin access**: Visit `/admin` (should redirect to login)
4. **Test authentication**: Login with Google
5. **Check leads**: View submitted leads in `/admin/leads`

## 📱 Key Routes

- `/` - Homepage with hero and services
- `/contact` - Contact form for lead generation
- `/admin` - Protected admin dashboard
- `/admin/leads` - Lead management interface
- `/login` - Google OAuth login
- `/logout` - Logout confirmation

## 🔧 Project Structure

```
src/
├── app/
│   ├── (admin)/admin/          # Protected admin routes
│   ├── (auth)/                 # Authentication pages
│   ├── (public)/               # Public pages
│   └── api/auth/               # NextAuth API routes
├── components/
│   ├── ui/                     # Reusable UI components
│   ├── layout/                 # Layout components
│   └── sections/               # Page sections
├── lib/                        # Utilities and configurations
└── server/                     # Server-side utilities
```

## 🚀 Next Steps

After successful deployment, consider implementing:

1. **Stripe Integration**: Payment processing for services
2. **Email Notifications**: Resend integration for lead notifications
3. **File Uploads**: UploadThing for document management
4. **Analytics**: Track user interactions and conversions
5. **SEO Optimization**: Meta tags and structured data

## 🐛 Troubleshooting

**Build Issues:**
- Ensure all environment variables are set
- Check for TypeScript errors
- Verify database connection

**Authentication Issues:**
- Verify Google OAuth configuration
- Check NEXTAUTH_URL matches your domain
- Ensure NEXTAUTH_SECRET is set

**Database Issues:**
- Verify DATABASE_URL format
- Run `prisma generate` after schema changes
- Check database permissions

## 📄 License

MIT License - feel free to use this project as a template for your own applications.

---

Built with ❤️ using Next.js, TypeScript, and Tailwind CSS

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