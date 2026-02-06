import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { isStaffRole } from '@/lib/role';

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
        console.error('Middleware: AUTH_SECRET or NEXTAUTH_SECRET is missing');
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
    if (!isLoggedIn || !token) {      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('returnUrl', pathname + searchParams.toString());
      return NextResponse.redirect(loginUrl);
    }

    // Define special route types
    const isSetPasswordRoute = pathname.startsWith('/set-password');
    
    // Check onboarding completion flags
    // CRITICAL FIX: Token values are booleans (true/false/undefined)
    // Only treat as "accepted" if explicitly true, everything else is "not accepted"
    const tosAccepted = token.tosAccepted === true;
    const profileDone = token.profileDone === true;    
    // CRITICAL FIX: If user is on onboarding route, be lenient with stale tokens
    // The JWT callback will refresh the token when the page loads and calls /api/auth/session
    // So if they're already on onboarding, let them through even if token seems stale
    // This prevents redirect loops when DB is updated but token hasn't refreshed yet
    if (isOnboardingRoute) {      
      // If token shows onboarding is complete, redirect to dashboard (handles case where token was refreshed)
      if (tosAccepted && profileDone) {
        const role = token.role as string;
        const dashboardUrl = role === 'CEO' || role === 'ADMIN' ? '/admin' : '/client';        return NextResponse.redirect(new URL(dashboardUrl, req.url));
      }
      
      // Otherwise, allow access - the page will call /api/auth/session which triggers JWT callback to refresh token
      return NextResponse.next();
    }
    
    // CRITICAL FIX: If logged in BUT not onboarded, redirect DIRECTLY to onboarding (NOT via login)
    // This prevents the redirect loop where logged-in users get sent to login with returnUrl=/onboarding/tos
    // Only check this for protected routes that require onboarding (client routes, not onboarding routes themselves)
    if (!isOnboardingRoute && !isSetPasswordRoute) {      if (!tosAccepted) {        // User is logged in but hasn't accepted TOS - redirect DIRECTLY to onboarding
        return NextResponse.redirect(new URL('/onboarding/tos', req.url));
      }
      
      if (!profileDone) {        // User is logged in, TOS accepted, but profile not done - redirect DIRECTLY to profile
        return NextResponse.redirect(new URL('/onboarding/profile', req.url));
      }
    }    
    // NOTE: Onboarding route check moved above to handle stale tokens
    // This section is now unreachable for onboarding routes, but kept for safety
    if (false && isOnboardingRoute) {      // If user is on /onboarding/tos and has already accepted TOS, redirect to next step
      if (pathname.startsWith('/onboarding/tos') && tosAccepted) {        if (profileDone) {
          // Onboarding complete - redirect to dashboard
          const role = token.role as string;
          const dashboardUrl = role === 'CEO' || role === 'ADMIN' ? '/admin' : '/client';          return NextResponse.redirect(new URL(dashboardUrl, req.url));
        } else {
          // TOS done but profile not done - redirect to profile          return NextResponse.redirect(new URL('/onboarding/profile', req.url));
        }
      }
      
      // If user is on /onboarding/profile and hasn't accepted TOS, redirect to TOS
      if (pathname.startsWith('/onboarding/profile') && !tosAccepted) {        return NextResponse.redirect(new URL('/onboarding/tos', req.url));
      }
      
      // If user is on /onboarding/profile and has completed profile, redirect to dashboard
      if (pathname.startsWith('/onboarding/profile') && tosAccepted && profileDone) {
        const role = token.role as string;
        const dashboardUrl = role === 'CEO' || role === 'ADMIN' ? '/admin' : '/client';        return NextResponse.redirect(new URL(dashboardUrl, req.url));
      }
      
      // Otherwise, allow access to onboarding routes      return NextResponse.next();
    }
    
    // Email verification has been removed - all users are auto-verified on signup

    // Check if user needs to set a password (OAuth-only users)
    // Skip this check for set-password route and onboarding (password is optional for OAuth)
    if (!isSetPasswordRoute && !isOnboardingRoute && token.needsPassword === true) {      const setPasswordUrl = new URL('/set-password', req.url);
      return NextResponse.redirect(setPasswordUrl);
    }
    
    // Role-based route protection
    if (isAdminRoute) {
      const role = token.role as string;
      // Allow staff and admin roles to access admin routes using isStaffRole() helper
      if (!isStaffRole(role)) {
        return NextResponse.redirect(new URL('/client', req.url));
      }
    }
    
    if (isClientRoute) {
      const role = token.role as string;
      // Only CLIENT role should be restricted to client routes
      // All other roles should access admin dashboard
      if (role === 'CLIENT') {
        // CLIENT users should stay on client routes
        return NextResponse.next();
      }
      // Non-CLIENT users (staff/admin) trying to access client routes should be redirected to admin
      return NextResponse.redirect(new URL('/admin', req.url));
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
    '/set-password',  // Allow access to set password page
    '/api/((?!auth).*)',  // All API routes except auth
    // NOTE: /clear-cookies is explicitly excluded in the middleware code above
  ],
};
