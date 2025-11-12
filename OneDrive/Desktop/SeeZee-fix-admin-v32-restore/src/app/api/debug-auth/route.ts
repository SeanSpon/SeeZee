import { NextResponse } from 'next/server';

export async function GET() {
  const GOOGLE_ID = process.env.AUTH_GOOGLE_ID ?? process.env.GOOGLE_CLIENT_ID;
  const GOOGLE_SECRET = process.env.AUTH_GOOGLE_SECRET ?? process.env.GOOGLE_CLIENT_SECRET;
  const AUTH_SECRET = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  const AUTH_URL = process.env.AUTH_URL;
  const NEXTAUTH_URL = process.env.NEXTAUTH_URL;

  // Determine expected callback URL
  const expectedCallbackUrl = AUTH_URL 
    ? `${AUTH_URL}/api/auth/callback/google`
    : NEXTAUTH_URL 
    ? `${NEXTAUTH_URL}/api/auth/callback/google`
    : "Cannot determine - AUTH_URL or NEXTAUTH_URL required";

  return NextResponse.json({
    // Environment variables
    env: {
      hasAuthSecret: !!AUTH_SECRET,
      hasGoogleId: !!GOOGLE_ID,
      hasGoogleSecret: !!GOOGLE_SECRET,
      hasAuthUrl: !!AUTH_URL,
      hasNextAuthUrl: !!NEXTAUTH_URL,
      authUrl: AUTH_URL || "Not set",
      nextAuthUrl: NEXTAUTH_URL || "Not set",
      nodeEnv: process.env.NODE_ENV,
    },
    // OAuth configuration
    oauth: {
      googleClientId: GOOGLE_ID ? `${GOOGLE_ID.substring(0, 10)}...` : "Not set",
      googleClientSecret: GOOGLE_SECRET ? "Set (hidden)" : "Not set",
      expectedCallbackUrl,
    },
    // Recommendations
    recommendations: [
      !AUTH_URL && !NEXTAUTH_URL ? "⚠️ Set AUTH_URL or NEXTAUTH_URL environment variable" : null,
      !AUTH_SECRET ? "⚠️ Set AUTH_SECRET or NEXTAUTH_SECRET environment variable" : null,
      !GOOGLE_ID ? "⚠️ Set AUTH_GOOGLE_ID or GOOGLE_CLIENT_ID environment variable" : null,
      !GOOGLE_SECRET ? "⚠️ Set AUTH_GOOGLE_SECRET or GOOGLE_CLIENT_SECRET environment variable" : null,
      AUTH_URL && NEXTAUTH_URL ? "ℹ️ Both AUTH_URL and NEXTAUTH_URL are set - AUTH_URL takes precedence" : null,
    ].filter(Boolean),
    // Expected Google OAuth settings
    googleOAuthSettings: {
      authorizedRedirectUri: expectedCallbackUrl,
      authorizedJavaScriptOrigins: AUTH_URL || NEXTAUTH_URL || "Not set",
    },
  });
}