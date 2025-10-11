// src/middleware.ts
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = new Set([
  "/", "/start", "/privacy", "/terms", "/login",
  "/favicon.ico", "/robots.txt", "/sitemap.xml",
  "/about", "/services", "/contact", "/register",
  "/register/client", "/register/staff", "/verify-request"
]);

export function middleware(req: NextRequest) {
  const { nextUrl: url, headers, method } = req;

  // 0) Never interfere with preflight or Next.js data fetches
  if (method === "OPTIONS") return NextResponse.next();
  if (url.searchParams.has("_rsc")) return NextResponse.next();
  if (headers.get("next-router-prefetch") === "1") return NextResponse.next();

  // 1) Let Next.js serve assets/data without auth redirects
  const p = url.pathname;
  if (
    p.startsWith("/_next") ||
    p.startsWith("/assets") ||
    p.startsWith("/images") ||
    p.startsWith("/fonts") ||
    p.startsWith("/og") ||
    p.startsWith("/api/auth")
  ) {
    return NextResponse.next();
  }

  // 2) Public routes should never bounce to /login
  if (PUBLIC_PATHS.has(p)) return NextResponse.next();

  // 3) Protected routes - let server components handle auth() checks
  // Don't redirect here; SSR will handle redirects based on auth state
  if (p.startsWith("/admin") || p.startsWith("/client") || p.startsWith("/onboarding")) {
    return NextResponse.next();
  }

  // 4) Default allow
  return NextResponse.next();
}

// Only run middleware where it matters; exclude static and auth by default
export const config = {
  matcher: [
    "/((?!_next/|assets/|images/|fonts/|og/|favicon.ico|robots.txt|sitemap.xml|api/auth/).*)"
  ]
};
