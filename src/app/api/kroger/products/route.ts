import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { krogerFetch } from "@/lib/kroger";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const term = request.nextUrl.searchParams.get("q")?.trim();
  const locationId = request.nextUrl.searchParams.get("locationId")?.trim();
  if (!term) return NextResponse.json({ error: "q is required" }, { status: 400 });

  const params = new URLSearchParams({ "filter.term": term, "filter.limit": "10" });
  if (locationId) params.set("filter.locationId", locationId);

  try {
    const response = await krogerFetch(`/products?${params.toString()}`);
    const body = await response.json().catch(() => ({}));
    return NextResponse.json(body, { status: response.status });
  } catch (err) {
    if (err instanceof Error && err.message === "KROGER_NOT_CONNECTED") {
      return NextResponse.json({ error: "Kroger account is not connected" }, { status: 401 });
    }
    return NextResponse.json({ error: "Kroger product search failed" }, { status: 500 });
  }
}
