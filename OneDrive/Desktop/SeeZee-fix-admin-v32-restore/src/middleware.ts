// src/middleware.ts
import { NextResponse, type NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { method, nextUrl: url, headers } = req;
  
  // Never interfere with preflight or Next.js data fetches
  if (method === "OPTIONS") return NextResponse.next();
  if (url.searchParams.has("_rsc")) return NextResponse.next();
  if (headers.get("next-router-prefetch") === "1") return NextResponse.next();
  
  const p = url.pathname;
  
  // Let Next.js serve assets/auth without interference
  if (p.startsWith("/_next") || p.startsWith("/api/auth")) {
    return NextResponse.next();
  }
  
  // Default allow - let server components handle auth
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/|favicon.ico|robots.txt|sitemap.xml|api/auth/).*)"]
};
