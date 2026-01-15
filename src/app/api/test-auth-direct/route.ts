import { NextResponse } from "next/server";

export async function GET() {
  const GOOGLE_ID = process.env.AUTH_GOOGLE_ID ?? process.env.GOOGLE_CLIENT_ID;
  const GOOGLE_SECRET = process.env.AUTH_GOOGLE_SECRET ?? process.env.GOOGLE_CLIENT_SECRET;
  const AUTH_SECRET = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  const AUTH_URL = process.env.AUTH_URL;
  const NEXTAUTH_URL = process.env.NEXTAUTH_URL;

  const diagnostics = {
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      hasAuthSecret: !!AUTH_SECRET,
      hasGoogleId: !!GOOGLE_ID,
      hasGoogleSecret: !!GOOGLE_SECRET,
      authUrl: AUTH_URL,
      nextAuthUrl: NEXTAUTH_URL,
    },
    oauth: {
      googleClientIdPrefix: GOOGLE_ID?.substring(0, 20) + "...",
      googleSecretPrefix: GOOGLE_SECRET?.substring(0, 10) + "...",
      expectedCallback: `${AUTH_URL || NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/callback/google`,
    },
    nextAuthConfig: {
      trustHost: true,
      sessionStrategy: "jwt",
      hasAdapter: true,
    },
    possibleIssues: [] as string[]
  };

  // Check for potential issues
  if (!AUTH_SECRET) {
    diagnostics.possibleIssues.push("❌ AUTH_SECRET is missing");
  }
  if (!GOOGLE_ID) {
    diagnostics.possibleIssues.push("❌ Google Client ID is missing");
  }
  if (!GOOGLE_SECRET) {
    diagnostics.possibleIssues.push("❌ Google Client Secret is missing");
  }
  if (!AUTH_URL && !NEXTAUTH_URL) {
    diagnostics.possibleIssues.push("⚠️ No AUTH_URL or NEXTAUTH_URL set - may cause issues");
  }
  if (GOOGLE_ID && !GOOGLE_ID.endsWith('.apps.googleusercontent.com')) {
    diagnostics.possibleIssues.push("⚠️ Google Client ID doesn't have expected format");
  }
  if (GOOGLE_SECRET && !GOOGLE_SECRET.startsWith('GOCSPX-')) {
    diagnostics.possibleIssues.push("⚠️ Google Client Secret doesn't have expected format (should start with GOCSPX-)");
  }

  if (diagnostics.possibleIssues.length === 0) {
    diagnostics.possibleIssues.push("✅ All required environment variables are set correctly");
  }

  return NextResponse.json(diagnostics, { status: 200 });
}



