/**
 * CEO Vault API
 * CRUD for secret references stored with AES-256 encryption.
 * Values never returned in full — only lastFour shown.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authz";
import crypto from "crypto";

const VAULT_KEY = process.env.VAULT_ENCRYPTION_KEY || process.env.AUTH_SECRET || "";
const ALGORITHM = "aes-256-cbc";

function encrypt(text: string): string {
  const key = crypto.scryptSync(VAULT_KEY, "salt", 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

function decrypt(encryptedText: string): string {
  const key = crypto.scryptSync(VAULT_KEY, "salt", 32);
  const [ivHex, encrypted] = encryptedText.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

function getLastFour(value: string): string {
  if (value.length <= 4) return "****";
  return "…" + value.slice(-4);
}

/**
 * GET: List all vault entries (never returns full values)
 */
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const scope = searchParams.get("scope");

    const where: Record<string, unknown> = {};
    if (scope) where.scope = scope;

    const entries = await prisma.vaultEntry.findMany({
      where,
      select: {
        id: true,
        key: true,
        lastFour: true,
        scope: true,
        scopeRef: true,
        notes: true,
        createdById: true,
        createdBy: {
          select: { name: true, email: true },
        },
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ entries, count: entries.length });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.includes("Forbidden") || message.includes("Unauthorized") ? 403 : 500;
    console.error("[API /ceo/vault] Error:", error);
    return NextResponse.json({ error: message }, { status });
  }
}

/**
 * POST: Create a new vault entry
 */
export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    const userId = (session.user as { id: string }).id;

    const body = await req.json();
    const { key, value, scope = "GLOBAL", scopeRef, notes } = body;

    if (!key || typeof key !== "string") {
      return NextResponse.json(
        { error: "key is required" },
        { status: 400 }
      );
    }

    if (!value || typeof value !== "string") {
      return NextResponse.json(
        { error: "value is required" },
        { status: 400 }
      );
    }

    if (!["GLOBAL", "PROJECT", "REPO"].includes(scope)) {
      return NextResponse.json(
        { error: "scope must be GLOBAL, PROJECT, or REPO" },
        { status: 400 }
      );
    }

    const encryptedValue = encrypt(value);
    const lastFour = getLastFour(value);

    const entry = await prisma.vaultEntry.create({
      data: {
        key,
        encryptedValue,
        lastFour,
        scope,
        scopeRef: scopeRef || null,
        notes: notes || null,
        createdById: userId,
      },
      select: {
        id: true,
        key: true,
        lastFour: true,
        scope: true,
        scopeRef: true,
        notes: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, entry });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const isConflict = message.includes("Unique constraint");
    const status = isConflict
      ? 409
      : message.includes("Forbidden") || message.includes("Unauthorized")
        ? 403
        : 500;
    console.error("[API /ceo/vault POST] Error:", error);
    return NextResponse.json(
      { error: isConflict ? "A vault entry with this key and scope already exists" : message },
      { status }
    );
  }
}
