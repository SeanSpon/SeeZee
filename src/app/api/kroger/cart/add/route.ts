import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { krogerFetch } from "@/lib/kroger";
import { z } from "zod";

const schema = z.object({
  items: z.array(z.object({
    upc: z.string().min(1),
    quantity: z.number().int().positive().max(99).default(1),
    modality: z.enum(["PICKUP", "DELIVERY", "SHIP"]).default("PICKUP"),
  })).min(1).max(50),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid cart items", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const response = await krogerFetch("/cart/add", {
      method: "PUT",
      body: JSON.stringify({ items: parsed.data.items }),
    });

    if (response.status === 204) return new NextResponse(null, { status: 204 });
    const body = await response.json().catch(() => ({}));
    return NextResponse.json(body, { status: response.status });
  } catch (err) {
    if (err instanceof Error && err.message === "KROGER_NOT_CONNECTED") {
      return NextResponse.json({ error: "Kroger account is not connected" }, { status: 401 });
    }
    return NextResponse.json({ error: "Could not add items to Kroger cart" }, { status: 500 });
  }
}
