import crypto from "crypto";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { buildKrogerAuthorizationUrl } from "@/lib/kroger";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const state = crypto.randomBytes(24).toString("base64url");
  const store = await cookies();
  store.set("seezee_kroger_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 10 * 60,
  });

  return NextResponse.redirect(buildKrogerAuthorizationUrl(state));
}
