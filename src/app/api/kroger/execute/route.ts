import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { krogerFetchForUser } from "@/lib/kroger";

const commandSchema = z.object({
  items: z.array(z.object({
    query: z.string().trim().min(1).max(120),
    quantity: z.number().int().positive().max(20).default(1),
    modality: z.enum(["PICKUP", "DELIVERY", "SHIP"]).default("PICKUP"),
  })).min(1).max(10),
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

async function resolveProduct(userId: string, query: string) {
  const params = new URLSearchParams({
    "filter.term": query,
    "filter.limit": "5",
  });

  const response = await krogerFetchForUser(userId, `/products?${params.toString()}`);
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(body?.errors?.[0]?.reason || `Kroger search failed (${response.status})`);
  }

  const products = Array.isArray(body?.data) ? body.data : [];
  if (!products.length) throw new Error(`No Kroger product match for ${query}`);
  return products[0];
}

export async function GET(request: NextRequest) {
  const nonce = request.nextUrl.searchParams.get("nonce")?.trim() || "";
  if (!/^[a-f0-9]{64}$/i.test(nonce)) {
    return NextResponse.json({ error: "Invalid command token" }, { status: 400 });
  }

  try {
    const ownerId = await ownerUserId();

    const delegated = await prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider: "kroger-command",
          providerAccountId: nonce,
        },
      },
    });

    const nowSeconds = Math.floor(Date.now() / 1000);
    if (
      !delegated ||
      delegated.userId !== ownerId ||
      !delegated.session_state ||
      !delegated.expires_at ||
      delegated.expires_at < nowSeconds
    ) {
      return NextResponse.json({ error: "Command token is invalid or expired" }, { status: 401 });
    }

    const parsed = commandSchema.safeParse(JSON.parse(delegated.session_state));
    if (!parsed.success) {
      await prisma.account.delete({ where: { id: delegated.id } });
      return NextResponse.json({ error: "Stored command is invalid" }, { status: 400 });
    }

    await prisma.account.delete({ where: { id: delegated.id } });

    const resolved = [] as Array<{
      query: string;
      quantity: number;
      modality: "PICKUP" | "DELIVERY" | "SHIP";
      upc: string;
      description?: string;
      brand?: string;
      size?: string;
    }>;

    for (const item of parsed.data.items) {
      const product = await resolveProduct(ownerId, item.query);
      if (!product?.upc) throw new Error(`Resolved product for ${item.query} had no UPC`);
      resolved.push({
        query: item.query,
        quantity: item.quantity,
        modality: item.modality,
        upc: product.upc,
        description: product.description,
        brand: product.brand,
        size: product.items?.[0]?.size,
      });
    }

    const response = await krogerFetchForUser(ownerId, "/cart/add", {
      method: "PUT",
      body: JSON.stringify({
        items: resolved.map((item) => ({
          upc: item.upc,
          quantity: item.quantity,
          modality: item.modality,
        })),
      }),
    });

    if (!response.ok && response.status !== 204) {
      const body = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: "Kroger cart update failed", kroger: body, resolved },
        { status: response.status },
      );
    }

    return NextResponse.json({
      ok: true,
      added: resolved.map(({ upc, ...item }) => ({ ...item, upc })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Kroger command failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
