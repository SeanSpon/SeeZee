import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isValidKrogerApiKey, krogerFetchForUser } from "@/lib/kroger";

const itemSchema = z.object({
  query: z.string().trim().min(1).optional(),
  upc: z.string().trim().min(1).optional(),
  quantity: z.number().int().positive().max(99).default(1),
  modality: z.enum(["PICKUP", "DELIVERY", "SHIP"]).default("PICKUP"),
}).refine((item) => item.query || item.upc, {
  message: "Each item needs query or upc",
});

const schema = z.object({
  action: z.enum(["search", "add"]).default("add"),
  locationId: z.string().trim().min(1).optional(),
  items: z.array(itemSchema).min(1).max(25),
});

async function ownerUserId() {
  const email = process.env.KROGER_OWNER_EMAIL?.trim();
  if (email) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("KROGER_OWNER_NOT_FOUND");
    return user.id;
  }

  const accounts = await prisma.account.findMany({
    where: { provider: "kroger" },
    select: { userId: true },
    take: 2,
  });

  if (accounts.length === 1) return accounts[0].userId;
  if (accounts.length === 0) throw new Error("KROGER_NOT_CONNECTED");
  throw new Error("KROGER_OWNER_AMBIGUOUS");
}

async function searchProduct(userId: string, query: string, locationId?: string) {
  const params = new URLSearchParams({
    "filter.term": query,
    "filter.limit": "5",
  });
  if (locationId) params.set("filter.locationId", locationId);

  const response = await krogerFetchForUser(userId, `/products?${params.toString()}`);
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body?.errors?.[0]?.reason || `Kroger search failed (${response.status})`);
  }

  return Array.isArray(body?.data) ? body.data : [];
}

function summarizeProduct(product: any) {
  return {
    upc: product?.upc,
    description: product?.description,
    brand: product?.brand,
    size: product?.items?.[0]?.size,
    price: product?.items?.[0]?.price,
    fulfillment: product?.items?.[0]?.fulfillment,
  };
}

export async function POST(request: NextRequest) {
  if (!isValidKrogerApiKey(request.headers.get("x-kroger-api-key"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const userId = await ownerUserId();
    const resolved: Array<{
      requested: string;
      quantity: number;
      modality: "PICKUP" | "DELIVERY" | "SHIP";
      selected: ReturnType<typeof summarizeProduct>;
      alternatives?: ReturnType<typeof summarizeProduct>[];
    }> = [];

    for (const item of parsed.data.items) {
      if (item.upc) {
        resolved.push({
          requested: item.upc,
          quantity: item.quantity,
          modality: item.modality,
          selected: { upc: item.upc, description: undefined, brand: undefined, size: undefined, price: undefined, fulfillment: undefined },
        });
        continue;
      }

      const products = await searchProduct(userId, item.query!, parsed.data.locationId);
      if (!products.length) {
        return NextResponse.json({
          error: "No Kroger product match",
          query: item.query,
        }, { status: 404 });
      }

      resolved.push({
        requested: item.query!,
        quantity: item.quantity,
        modality: item.modality,
        selected: summarizeProduct(products[0]),
        alternatives: products.slice(1, 5).map(summarizeProduct),
      });
    }

    if (parsed.data.action === "search") {
      return NextResponse.json({ action: "search", resolved });
    }

    const cartItems = resolved.map((item) => ({
      upc: item.selected.upc,
      quantity: item.quantity,
      modality: item.modality,
    }));

    if (cartItems.some((item) => !item.upc)) {
      return NextResponse.json({ error: "A resolved item did not include a UPC", resolved }, { status: 502 });
    }

    const response = await krogerFetchForUser(userId, "/cart/add", {
      method: "PUT",
      body: JSON.stringify({ items: cartItems }),
    });

    if (!response.ok && response.status !== 204) {
      const body = await response.json().catch(() => ({}));
      return NextResponse.json({ error: "Kroger cart update failed", kroger: body, resolved }, { status: response.status });
    }

    return NextResponse.json({
      ok: true,
      action: "add",
      added: resolved.map(({ alternatives, ...item }) => item),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Kroger command failed";
    if (message === "KROGER_NOT_CONNECTED") {
      return NextResponse.json({ error: "Kroger account has not completed OAuth yet" }, { status: 409 });
    }
    if (message === "KROGER_OWNER_NOT_FOUND" || message === "KROGER_OWNER_AMBIGUOUS") {
      return NextResponse.json({ error: message }, { status: 500 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
