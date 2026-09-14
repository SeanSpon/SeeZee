import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { exchangeKrogerCode } from "@/lib/kroger";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const error = request.nextUrl.searchParams.get("error");
  const store = await cookies();
  const expectedState = store.get("seezee_kroger_oauth_state")?.value;
  store.delete("seezee_kroger_oauth_state");

  if (error) return NextResponse.redirect(new URL(`/admin?integration=kroger&error=${encodeURIComponent(error)}`, request.url));
  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.json({ error: "Invalid Kroger OAuth callback" }, { status: 400 });
  }

  try {
    await exchangeKrogerCode(code, user.id);
    return NextResponse.redirect(new URL("/admin?integration=kroger&connected=1", request.url));
  } catch (err) {
    const message = err instanceof Error ? err.message : "OAuth exchange failed";
    return NextResponse.redirect(new URL(`/admin?integration=kroger&error=${encodeURIComponent(message)}`, request.url));
  }
}
