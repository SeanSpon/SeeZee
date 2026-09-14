import "server-only";

import crypto from "crypto";
import { cookies } from "next/headers";

const KROGER_API_BASE = "https://api.kroger.com/v1";
const KROGER_AUTHORIZE_URL = `${KROGER_API_BASE}/connect/oauth2/authorize`;
const KROGER_TOKEN_URL = `${KROGER_API_BASE}/connect/oauth2/token`;
const TOKEN_COOKIE = "seezee_kroger_tokens";

export const KROGER_SCOPES = [
  "cart.basic:write",
  "product.compact",
  "profile.compact",
].join(" ");

type KrogerTokenSet = {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
};

function requiredEnv(name: "KROGER_CLIENT_ID" | "KROGER_CLIENT_SECRET" | "KROGER_REDIRECT_URI") {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

function encryptionKey() {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET or NEXTAUTH_SECRET is required for Kroger token encryption");
  return crypto.createHash("sha256").update(secret).digest();
}

function encrypt(value: KrogerTokenSet) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(value), "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ciphertext]).toString("base64url");
}

function decrypt(value: string): KrogerTokenSet {
  const raw = Buffer.from(value, "base64url");
  const iv = raw.subarray(0, 12);
  const tag = raw.subarray(12, 28);
  const ciphertext = raw.subarray(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", encryptionKey(), iv);
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
  return JSON.parse(plaintext) as KrogerTokenSet;
}

async function saveTokens(tokens: KrogerTokenSet) {
  const store = await cookies();
  store.set(TOKEN_COOKIE, encrypt(tokens), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearKrogerTokens() {
  const store = await cookies();
  store.delete(TOKEN_COOKIE);
}

export function buildKrogerAuthorizationUrl(state: string) {
  const params = new URLSearchParams({
    client_id: requiredEnv("KROGER_CLIENT_ID"),
    redirect_uri: requiredEnv("KROGER_REDIRECT_URI"),
    response_type: "code",
    scope: KROGER_SCOPES,
    state,
  });
  return `${KROGER_AUTHORIZE_URL}?${params.toString()}`;
}

async function tokenRequest(params: URLSearchParams) {
  const clientId = requiredEnv("KROGER_CLIENT_ID");
  const clientSecret = requiredEnv("KROGER_CLIENT_SECRET");
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetch(KROGER_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
    cache: "no-store",
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body?.error_description || body?.error || "Kroger token request failed");
  }

  return body as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  };
}

export async function exchangeKrogerCode(code: string) {
  const body = await tokenRequest(
    new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: requiredEnv("KROGER_REDIRECT_URI"),
    }),
  );

  await saveTokens({
    accessToken: body.access_token,
    refreshToken: body.refresh_token,
    expiresAt: Date.now() + body.expires_in * 1000,
  });
}

export async function getKrogerAccessToken() {
  const store = await cookies();
  const encrypted = store.get(TOKEN_COOKIE)?.value;
  if (!encrypted) return null;

  let tokens: KrogerTokenSet;
  try {
    tokens = decrypt(encrypted);
  } catch {
    store.delete(TOKEN_COOKIE);
    return null;
  }

  if (tokens.expiresAt > Date.now() + 60_000) return tokens.accessToken;
  if (!tokens.refreshToken) return null;

  const body = await tokenRequest(
    new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: tokens.refreshToken,
    }),
  );

  const refreshed: KrogerTokenSet = {
    accessToken: body.access_token,
    refreshToken: body.refresh_token || tokens.refreshToken,
    expiresAt: Date.now() + body.expires_in * 1000,
  };
  await saveTokens(refreshed);
  return refreshed.accessToken;
}

export async function krogerFetch(path: string, init: RequestInit = {}) {
  const accessToken = await getKrogerAccessToken();
  if (!accessToken) throw new Error("KROGER_NOT_CONNECTED");

  return fetch(`${KROGER_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
    cache: "no-store",
  });
}
