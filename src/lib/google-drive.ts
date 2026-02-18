import { prisma } from "@/lib/prisma";

const DRIVE_API = "https://www.googleapis.com/drive/v3";
const TOKEN_URL = "https://oauth2.googleapis.com/token";

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  iconLink: string;
  thumbnailLink: string | null;
  modifiedTime: string;
}

/**
 * Get a valid Google access token for a user, refreshing if expired.
 */
export async function getAccessToken(userId: string): Promise<string> {
  const account = await prisma.account.findFirst({
    where: { userId, provider: "google" },
    select: {
      id: true,
      access_token: true,
      refresh_token: true,
      expires_at: true,
    },
  });

  if (!account) {
    throw new Error("No Google account linked for this user");
  }

  // Check if the current token is still valid (with 60s buffer)
  const now = Math.floor(Date.now() / 1000);
  if (account.access_token && account.expires_at && account.expires_at > now + 60) {
    return account.access_token;
  }

  // Token expired or missing — refresh it
  if (!account.refresh_token) {
    throw new Error("No refresh token available. User must re-authenticate with Google.");
  }

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.AUTH_GOOGLE_ID ?? process.env.GOOGLE_CLIENT_ID ?? "",
      client_secret: process.env.AUTH_GOOGLE_SECRET ?? process.env.GOOGLE_CLIENT_SECRET ?? "",
      refresh_token: account.refresh_token,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to refresh Google token: ${err}`);
  }

  const data = await res.json();

  // Update the account with the new token
  await prisma.account.update({
    where: { id: account.id },
    data: {
      access_token: data.access_token,
      expires_at: Math.floor(Date.now() / 1000) + (data.expires_in ?? 3600),
      ...(data.refresh_token ? { refresh_token: data.refresh_token } : {}),
    },
  });

  return data.access_token as string;
}

/**
 * List files from Google Drive matching an optional query.
 */
export async function listDriveFiles(
  accessToken: string,
  query?: string
): Promise<DriveFile[]> {
  const params = new URLSearchParams({
    fields: "files(id,name,mimeType,webViewLink,iconLink,thumbnailLink,modifiedTime)",
    pageSize: "100",
    orderBy: "modifiedTime desc",
  });

  if (query) {
    params.set("q", query);
  }

  const res = await fetch(`${DRIVE_API}/files?${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Drive API list failed: ${err}`);
  }

  const data = await res.json();
  return (data.files ?? []) as DriveFile[];
}

/**
 * Get a single file's metadata from Google Drive.
 */
export async function getDriveFile(
  accessToken: string,
  fileId: string
): Promise<DriveFile> {
  const params = new URLSearchParams({
    fields: "id,name,mimeType,webViewLink,iconLink,thumbnailLink,modifiedTime",
  });

  const res = await fetch(`${DRIVE_API}/files/${encodeURIComponent(fileId)}?${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Drive API get failed: ${err}`);
  }

  return (await res.json()) as DriveFile;
}

/**
 * Generate a short-lived access token for the Google Picker widget.
 * This is the same as getAccessToken — the Picker uses a standard OAuth2 token.
 */
export async function generatePickerToken(userId: string): Promise<string> {
  return getAccessToken(userId);
}
