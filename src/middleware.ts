import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const session = await auth();
  const isAuthed = !!session?.user;
  const url = req.nextUrl;

  // Redirect /dashboard to /dashboard/overview
  if (url.pathname === "/dashboard" && isAuthed) {
    url.pathname = "/dashboard/overview";
    return NextResponse.redirect(url);
  }

  if (url.pathname.startsWith("/dashboard") && !isAuthed) {
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
