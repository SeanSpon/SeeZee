import { auth } from "@/auth";
import { NextResponse } from "next/server";

// CEO email for role-based access control
const CEO_EMAIL = "seanspm1007@gmail.com";

// Routes that require CEO access
const CEO_ONLY_ROUTES = [
  "/admin/team",
  "/admin/analytics",
  "/admin/finances",
];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const user = req.auth?.user;

  // Public routes - allow access
  const publicRoutes = [
    "/",
    "/login",
    "/register",
    "/register/client",
    "/register/staff",
    "/verify-request",
    "/about",
    "/services",
    "/contact",
  ];
  
  if (publicRoutes.includes(pathname) || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Require authentication for all other routes
  if (!user) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // Check if user needs to complete onboarding
  const needsTos = !user.tosAcceptedAt;
  const needsProfile = user.tosAcceptedAt && !user.profileDoneAt; // Only need profile if TOS is done
  const isOnboardingRoute = pathname.startsWith("/onboarding");

  // Only redirect to onboarding if actually needed
  if (!isOnboardingRoute && (needsTos || needsProfile)) {
    // First step: accept ToS
    if (needsTos) {
      return NextResponse.redirect(new URL("/onboarding/tos", req.url));
    }
    // Second step: complete profile (only if TOS is done)
    if (needsProfile) {
      return NextResponse.redirect(new URL("/onboarding/profile", req.url));
    }
  }

  // Prevent going back to onboarding if already completed
  if (isOnboardingRoute && user.tosAcceptedAt && user.profileDoneAt) {
    // Redirect to appropriate dashboard based on account type
    const redirectUrl = user.accountType === "STAFF" ? "/admin" : "/client";
    return NextResponse.redirect(new URL(redirectUrl, req.url));
  }

  // Admin route protection - STAFF only
  if (pathname.startsWith("/admin")) {
    // If accountType is undefined, assume they need to re-authenticate
    if (!user.accountType) {
      return NextResponse.redirect(new URL("/api/auth/signout?callbackUrl=/login", req.url));
    }
    
    if (user.accountType !== "STAFF") {
      return NextResponse.redirect(new URL("/client", req.url));
    }

    // CEO-only routes
    const isCeoRoute = CEO_ONLY_ROUTES.some((route) => pathname.startsWith(route));
    if (isCeoRoute && user.email !== CEO_EMAIL) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }

  // Client portal protection - CLIENT only
  if (pathname.startsWith("/client")) {
    // If accountType is undefined, assume they need to re-authenticate
    if (!user.accountType) {
      return NextResponse.redirect(new URL("/api/auth/signout?callbackUrl=/login", req.url));
    }
    
    if (user.accountType !== "CLIENT") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|assets|images|fonts|og).*)",
  ],
};
