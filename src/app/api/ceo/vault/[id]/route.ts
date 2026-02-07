/**
 * CEO Vault Entry API
 * Delete individual vault entries. No full value retrieval.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authz";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const entry = await prisma.vaultEntry.findUnique({
      where: { id },
    });

    if (!entry) {
      return NextResponse.json(
        { error: "Vault entry not found" },
        { status: 404 }
      );
    }

    await prisma.vaultEntry.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.includes("Forbidden") || message.includes("Unauthorized") ? 403 : 500;
    console.error("[API /ceo/vault/:id] Error:", error);
    return NextResponse.json({ error: message }, { status });
  }
}

/**
 * PATCH: Update vault entry metadata (not the value itself for safety)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const body = await req.json();
    const { key, notes, scope, scopeRef } = body;

    const entry = await prisma.vaultEntry.findUnique({
      where: { id },
    });

    if (!entry) {
      return NextResponse.json(
        { error: "Vault entry not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.vaultEntry.update({
      where: { id },
      data: {
        ...(key && { key }),
        ...(notes !== undefined && { notes }),
        ...(scope && { scope }),
        ...(scopeRef !== undefined && { scopeRef }),
      },
      select: {
        id: true,
        key: true,
        lastFour: true,
        scope: true,
        scopeRef: true,
        notes: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ success: true, entry: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.includes("Forbidden") || message.includes("Unauthorized") ? 403 : 500;
    console.error("[API /ceo/vault/:id PATCH] Error:", error);
    return NextResponse.json({ error: message }, { status });
  }
}
