import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { clearKrogerTokens, getKrogerAccessToken } from "@/lib/kroger";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const token = await getKrogerAccessToken();
    return NextResponse.json({ connected: Boolean(token) });
  } catch {
    return NextResponse.json({ connected: false });
  }
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await clearKrogerTokens();
  return NextResponse.json({ connected: false });
}
