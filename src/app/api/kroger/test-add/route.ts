import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { krogerFetchForUser } from "@/lib/kroger";

async function findFirstProduct(userId: string, query: string) {
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

export async function GET() {
  const session = await auth();
  const ownerEmail = process.env.KROGER_OWNER_EMAIL?.trim().toLowerCase();
  const sessionEmail = session?.user?.email?.trim().toLowerCase();

  if (!session?.user?.id || !sessionEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!ownerEmail || sessionEmail !== ownerEmail) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const milk = await findFirstProduct(session.user.id, "2% milk");
    const bagels = await findFirstProduct(session.user.id, "bagels");

    const items = [milk, bagels].map((product) => ({
      upc: product?.upc,
      quantity: 1,
      modality: "PICKUP" as const,
    }));

    if (items.some((item) => !item.upc)) {
      return NextResponse.json({ error: "A selected product did not include a UPC" }, { status: 502 });
    }

    const response = await krogerFetchForUser(session.user.id, "/cart/add", {
      method: "PUT",
      body: JSON.stringify({ items }),
    });

    if (!response.ok && response.status !== 204) {
      const body = await response.json().catch(() => ({}));
      return NextResponse.json({ error: "Kroger cart update failed", kroger: body }, { status: response.status });
    }

    return NextResponse.json({
      ok: true,
      added: [
        { query: "2% milk", description: milk?.description, brand: milk?.brand, size: milk?.items?.[0]?.size, upc: milk?.upc },
        { query: "bagels", description: bagels?.description, brand: bagels?.brand, size: bagels?.items?.[0]?.size, upc: bagels?.upc },
      ],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Kroger test add failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
