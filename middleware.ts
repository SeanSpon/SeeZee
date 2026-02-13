// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://seezeestudios.com",
  "https://www.seezeestudios.com",
  "https://see-zee.com",
  "https://www.see-zee.com",
];

function getCorsHeaders(origin: string | null) {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Allow-Credentials": "true",
  };

  if (origin && allowedOrigins.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return headers;
}

export async function middleware(req: NextRequest) {
  try {
    const { pathname, searchParams } = req.nextUrl;
    const method = req.method;
    const origin = req.headers.get("origin");    // CRITICAL: Never interfere with auth routes or cookie clearing
    if (pathname.startsWith("/api/auth") || pathname === "/clear-cookies" || pathname === "/api/auth/clear-session") {
      return NextResponse.next();
    }

    // Handle CORS preflight requests (OPTIONS)
    if (method === "OPTIONS" && pathname.startsWith("/api")) {
      return new NextResponse(null, {
        status: 200,
        headers: getCorsHeaders(origin),
      });
    }

    // Add CORS headers to all API routes
    if (pathname.startsWith("/api")) {
      const response = NextResponse.next();
      const corsHeaders = getCorsHeaders(origin);
      
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      return response;
    }

    // Check if route requires authentication
    const isAdminRoute = pathname.startsWith('/admin');
    const isClientRoute = pathname.startsWith('/client');
    const isCEORoute = pathname.startsWith('/ceo');
    const isPortalRoute = pathname.startsWith('/portal');
    const isOnboardingRoute = pathname.startsWith('/onboarding');
    
    const isProtectedRoute = isAdminRoute || isClientRoute || isCEORoute || isPortalRoute || isOnboardingRoute;
    
    // Only check auth on protected routes
    if (!isProtectedRoute) {
      return NextResponse.next();
    }

    // Read NextAuth JWT (edge-safe, no Prisma)
    // Handle case where cookies are too large (431 error)
    let token = null;
    let isLoggedIn = false;
    
    try {
      const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
      if (!secret) {
        console.error('❌ [MIDDLEWARE] AUTH_SECRET or NEXTAUTH_SECRET is missing');
        console.error('💡 Set AUTH_SECRET in Vercel environment variables');
        console.error('   Without AUTH_SECRET, JWT tokens cannot be verified');
        // Redirect to a clear error page instead of failing silently
        if (isProtectedRoute) {
          const errorUrl = new URL('/login', req.url);
          errorUrl.searchParams.set('error', 'Configuration');
          return NextResponse.redirect(errorUrl);
        }
        return NextResponse.next();
      }      
      token = await getToken({
        req,
        secret: secret,
        secureCookie: process.env.NODE_ENV === 'production',
      });      isLoggedIn = !!token;
    } catch (error) {
      // If we can't read the token (likely due to oversized cookies), redirect to clear cookies
      console.error('Middleware: Failed to read token (likely oversized cookies):', error);
      // Only redirect if we're not already on a public route
      if (isProtectedRoute) {
        return NextResponse.redirect(new URL('/clear-cookies', req.url));
      }
      // For non-protected routes, just continue without auth
      return NextResponse.next();
    }

    // CRITICAL FIX: Check authentication first, then onboarding status
    // If NOT logged in → redirect to login with returnUrl = original path
    if (!isLoggedIn || !token) {
      const loginUrl = new URL('/login', req.url);
      const search = searchParams.toString();
      const returnUrl = search ? `${pathname}?${search}` : pathname;
      loginUrl.searchParams.set('returnUrl', returnUrl);
      return NextResponse.redirect(loginUrl);
    }

    // Check onboarding completion flags (used for onboarding route logic below)
    const tosAccepted = token.tosAccepted === true;
    const profileDone = token.profileDone === true;

    // If user voluntarily visits onboarding and has already completed it, redirect to dashboard
    if (isOnboardingRoute) {
      if (tosAccepted && profileDone) {
        const role = token.role as string;
        const dashboardUrl = role === 'CLIENT' ? '/client' : '/admin';
        return NextResponse.redirect(new URL(dashboardUrl, req.url));
      }
      return NextResponse.next();
    }
    
    // Role-based route protection
    // Allow all staff/team roles to access admin routes (not just CEO/ADMIN)
    if (isAdminRoute) {
      const role = token.role as string;
      const staffRoles = ['CEO', 'ADMIN', 'CFO', 'FRONTEND', 'BACKEND', 'OUTREACH', 'STAFF', 'DEV', 'DESIGNER', 'INTERN', 'PARTNER'];
      if (!staffRoles.includes(role)) {
        return NextResponse.redirect(new URL('/client', req.url));
      }
    }
    
    if (isClientRoute) {
      const role = token.role as string;
      if (role !== 'CLIENT') {
        return NextResponse.redirect(new URL('/admin', req.url));
      }
    }    return NextResponse.next();
  } catch (err) {
    console.error('Middleware error:', err);
    // Fail open instead of 500-ing the whole app
    return NextResponse.next();
  }
}

// 🎯 FIXED: Only match protected routes, NOT /login or other public pages
export const config = {
  matcher: [
    '/admin/:path*',
    '/client/:path*',
    '/ceo/:path*',
    '/portal/:path*',
    '/onboarding/:path*',
    '/api/((?!auth).*)',  // All API routes except auth
    // NOTE: /clear-cookies is explicitly excluded in the middleware code above
  ],
};
